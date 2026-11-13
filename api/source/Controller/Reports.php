<?php

namespace Source\Controller;

use Source\Models\Report;
use Source\Models\User;

class Reports extends Api
{
    public function register(array $data): void
    {
        if (!$this->authToken([3, 4])) {
            $this->call(401, 'unauthorized', 'Usuário não autenticado.', 'error')->back();
            return;
        }

        $reportedUserId = filter_var($data['reported_user_id'] ?? null, FILTER_VALIDATE_INT);
        $reasonValue = $data['reason'] ?? null;
        if (!is_string($reasonValue)) {
            $this->call(400, 'bad_request', 'Informe um motivo válido.', 'error')->back();
            return;
        }
        $reason = trim($reasonValue);
        $description = $data['description'] ?? null;
        if ($description !== null && !is_string($description)) {
            $this->call(400, 'bad_request', 'A descrição da denúncia deve ser um texto.', 'error')->back();
            return;
        }
        if ($reportedUserId === false || $reportedUserId < 1 || $reason === '' || mb_strlen($reason) > 255) {
            $this->call(400, 'bad_request', 'Informe um reported_user_id válido e um motivo com até 255 caracteres.', 'error')->back();
            return;
        }
        if ((int)$reportedUserId === $this->userAuthId) {
            $this->call(400, 'bad_request', 'Você não pode denunciar a si mesmo.', 'error')->back();
            return;
        }

        $reportedUser = new User();
        if (!$reportedUser->selectById((int)$reportedUserId) || (int)$reportedUser->getActive() !== 1) {
            $this->call(404, 'not_found', 'Usuário denunciado não encontrado.', 'error')->back();
            return;
        }

        // Denúncias entre perfis são feitas entre os dois tipos da plataforma:
        // empresas podem denunciar candidatos e candidatos podem denunciar empresas.
        $validPair =
            ($this->userAuthTypeId === 4 && (int)$reportedUser->getTypeId() === 3) ||
            ($this->userAuthTypeId === 3 && (int)$reportedUser->getTypeId() === 4);

        if (!$validPair) {
            $this->call(
                403,
                'forbidden',
                'Empresas podem denunciar candidatos e candidatos podem denunciar empresas.',
                'error'
            )->back();
            return;
        }

        $report = new Report(null, $this->userAuthId, (int)$reportedUserId, $reason, $description);
        if ($report->reportExists()) {
            $this->call(409, 'conflict', 'Você já denunciou este usuário.', 'error')->back();
            return;
        }
        if (!$report->insert()) {
            $this->call(500, 'internal_server_error', 'Não foi possível registrar a denúncia.', 'error')->back();
            return;
        }

        $this->call(201, 'success', 'Denúncia registrada com sucesso.', 'created')->back($report);
    }

    public function list(): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, 'unauthorized', 'Apenas administradores podem visualizar denúncias.', 'error')->back();
            return;
        }

        $report = new Report();
        $reports = $report->selectAllWithUserDetails();

        if ($report->getErrorMessage() !== null) {
            $this->call(
                500,
                'internal_server_error',
                'Não foi possível carregar as denúncias.',
                'error'
            )->back();

            return;
        }

        $this->call(200, 'success', 'Denúncias encontradas.', 'success')->back($reports);
    }

    public function listById(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, 'unauthorized', 'Apenas administradores podem visualizar denúncias.', 'error')->back();
            return;
        }

        $reportId = filter_var($data['reportId'] ?? null, FILTER_VALIDATE_INT);
        if ($reportId === false || $reportId < 1) {
            $this->call(400, 'bad_request', 'ID da denúncia inválido.', 'error')->back();
            return;
        }

        $report = new Report();
        if (!$report->selectById((int)$reportId)) {
            $this->call(404, 'not_found', 'Denúncia não encontrada.', 'error')->back();
            return;
        }

        $this->call(200, 'success', 'Denúncia encontrada.', 'success')->back($report);
    }

    public function update(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, 'unauthorized', 'Apenas administradores podem atualizar denúncias.', 'error')->back();
            return;
        }

        $reportId = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
        if ($reportId === false || $reportId < 1) {
            $this->call(400, 'bad_request', 'ID da denúncia inválido.', 'error')->back();
            return;
        }

        if (
            !array_key_exists('status', $data) &&
            !array_key_exists('description', $data) &&
            !array_key_exists('admin_response', $data)
        ) {
            $this->call(400, 'bad_request', 'Informe o status, a descrição ou o parecer administrativo para atualizar a denúncia.', 'error')->back();
            return;
        }

        $report = new Report();
        if (!$report->selectById((int)$reportId)) {
            $this->call(404, 'not_found', 'Denúncia não encontrada.', 'error')->back();
            return;
        }

        if (array_key_exists('status', $data)) {
            if (!is_string($data['status']) || !in_array($data['status'], ['pending', 'reviewed', 'resolved'], true)) {
                $this->call(400, 'bad_request', 'Status inválido.', 'error')->back();
                return;
            }
            $report->setStatus($data['status']);
        }
        if (array_key_exists('description', $data)) {
            if ($data['description'] !== null && !is_string($data['description'])) {
                $this->call(400, 'bad_request', 'A descrição da denúncia deve ser um texto.', 'error')->back();
                return;
            }
            $report->setDescription($data['description']);
        }

        if (array_key_exists('admin_response', $data)) {
            if ($data['admin_response'] !== null && !is_string($data['admin_response'])) {
                $this->call(400, 'bad_request', 'O parecer administrativo deve ser um texto.', 'error')->back();
                return;
            }

            $adminResponse = $data['admin_response'] === null
                ? null
                : trim($data['admin_response']);

            if ($adminResponse !== null && mb_strlen($adminResponse) > 5000) {
                $this->call(400, 'bad_request', 'O parecer administrativo deve ter no máximo 5.000 caracteres.', 'error')->back();
                return;
            }

            $report->setAdminResponse($adminResponse === '' ? null : $adminResponse);
        }

        $nullableFields = [];
        if (array_key_exists('description', $data) && $data['description'] === null) {
            $nullableFields[] = 'description';
        }
        if (array_key_exists('admin_response', $data) && ($data['admin_response'] === null || trim((string)$data['admin_response']) === '')) {
            $nullableFields[] = 'adminResponse';
        }
        if (!$report->updateById((int)$reportId, $nullableFields)) {
            $this->call(500, 'internal_server_error', 'Não foi possível atualizar a denúncia.', 'error')->back();
            return;
        }

        $this->call(200, 'success', 'Denúncia atualizada.', 'success')->back($report);
    }

    public function delete(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, 'unauthorized', 'Apenas administradores podem excluir denúncias.', 'error')->back();
            return;
        }

        $reportId = filter_var($data['deleteId'] ?? null, FILTER_VALIDATE_INT);
        if ($reportId === false || $reportId < 1) {
            $this->call(400, 'bad_request', 'ID da denúncia inválido.', 'error')->back();
            return;
        }

        $report = new Report();
        if (!$report->deleteById((int)$reportId)) {
            $this->call(404, 'not_found', 'Denúncia não encontrada.', 'error')->back();
            return;
        }

        $this->call(200, 'success', 'Denúncia removida.', 'success')->back();
    }
}
