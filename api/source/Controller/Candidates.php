<?php

namespace Source\Controller;

use Source\Models\Candidate;
use Source\Models\CandidateArea;
use Source\Models\User;

class Candidates extends Api
{
    public function candidatesList(array $data): void
    {
        // A listagem geral fica restrita ao administrador até existir o filtro
        // de candidatos interessados em uma vaga específica.
        if (!$this->authToken(1)) {
            $this->call(401, 'unauthorized', 'Acesso permitido somente para administradores.', 'error')->back();
            return;
        }

        $candidate = new Candidate();
        $this->call(200, 'success', 'Lista de candidatos.', 'success')->back($candidate->selectAll());
    }

    public function candidatesListById(array $data): void
    {
        $candidateId = filter_var($data['candidatesId'] ?? null, FILTER_VALIDATE_INT);
        if ($candidateId === false || $candidateId < 1) {
            $this->call(400, 'bad_request', 'ID do candidato inválido.', 'error')->back();
            return;
        }

        if (!$this->authToken([1, 3])) {
            $this->call(401, 'unauthorized', 'Usuário não autenticado ou sem permissão.', 'error')->back();
            return;
        }

        $candidate = new Candidate();
        if (!$candidate->selectById((int)$candidateId)) {
            $this->call(404, 'not_found', 'Candidato não encontrado.', 'error')->back();
            return;
        }

        if ($this->userAuthTypeId !== 1 && (int)$candidate->getUserId() !== $this->userAuthId) {
            $this->call(403, 'forbidden', 'Você não pode visualizar este candidato.', 'error')->back();
            return;
        }

        // Mantém o contrato original: retorna somente o objeto Candidate.
        $this->call(200, 'success', 'Candidato encontrado.', 'success')->back($candidate);
    }

    public function register(array $data): void
    {
        if (!$this->authToken(2)) {
            $this->call(401, 'unauthorized', 'Usuário não autenticado ou sem permissão.', 'error')->back();
            return;
        }

        foreach (['full_name' => 'Nome', 'cpf' => 'CPF', 'interest_area' => 'Área de interesse'] as $field => $label) {
            if (!isset($data[$field]) || !is_string($data[$field]) || trim($data[$field]) === '') {
                $this->call(400, 'bad_request', "{$label} é obrigatório.", 'error')->back();
                return;
            }
        }

        foreach (['location', 'salary_expectation', 'work_schedule', 'shift', 'work_model', 'employment_type', 'about'] as $field) {
            if (array_key_exists($field, $data) && $data[$field] !== null && !is_string($data[$field])) {
                $this->call(400, 'bad_request', "O campo {$field} deve ser um texto.", 'error')->back();
                return;
            }
        }

        if (array_key_exists('areas', $data) && !is_array($data['areas'])) {
            $this->call(400, 'bad_request', 'O campo areas deve ser uma lista.', 'error')->back();
            return;
        }

        $user = new User();
        if (!$user->selectById($this->userAuthId)) {
            $this->call(404, 'not_found', 'Usuário não encontrado.', 'error')->back();
            return;
        }

        $existingCandidate = new Candidate();
        if ($existingCandidate->selectByUserId($this->userAuthId)) {
            $this->call(409, 'conflict', 'Este usuário já possui um cadastro de candidato.', 'error')->back();
            return;
        }

        $cpfCheck = new Candidate();
        $cpfCheck->setCpf(trim($data['cpf']));
        if ($cpfCheck->cpfExists()) {
            $this->call(409, 'conflict', 'CPF já cadastrado.', 'error')->back();
            return;
        }

        $candidate = new Candidate(
            null,
            $this->userAuthId,
            trim($data['full_name']),
            trim($data['cpf']),
            isset($data['location']) ? trim($data['location']) : null,
            trim($data['interest_area']),
            $data['salary_expectation'] ?? null,
            $data['work_schedule'] ?? null,
            $data['shift'] ?? null,
            $data['work_model'] ?? null,
            $data['employment_type'] ?? null,
            $data['about'] ?? null
        );

        if (!$candidate->insert()) {
            $this->call(500, 'internal_server_error', 'Não foi possível cadastrar o candidato.', 'error')->back();
            return;
        }

        if (array_key_exists('areas', $data) && !$this->saveAreas($data['areas'], (int)$candidate->getId())) {
            $candidate->deleteById((int)$candidate->getId());
            $this->call(400, 'bad_request', 'Não foi possível cadastrar as áreas informadas. Confira os IDs e a área personalizada.', 'error')->back();
            return;
        }

        $user->setTypeId(3);
        if (!$user->updateById($this->userAuthId)) {
            $candidate->deleteById((int)$candidate->getId());
            $this->call(500, 'internal_server_error', 'Não foi possível concluir a ativação do cadastro de candidato.', 'error')->back();
            return;
        }

        $this->call(201, 'success', 'Candidato cadastrado com sucesso.', 'created')->back([
            'id' => $candidate->getId(),
            'name' => $candidate->getFullName(),
            'cpf' => $candidate->getCpf(),
            'interest_area' => $candidate->getInterestArea(),
            'areas' => (new CandidateArea())->selectByCandidateId((int)$candidate->getId())
        ]);
    }

    public function update(array $data): void
    {
        if (!$this->authToken(3)) {
            $this->call(401, 'unauthorized', 'Usuário não autenticado ou sem permissão.', 'error')->back();
            return;
        }

        if (array_key_exists('areas', $data) && !is_array($data['areas'])) {
            $this->call(400, 'bad_request', 'O campo areas deve ser uma lista.', 'error')->back();
            return;
        }

        $candidate = new Candidate();
        if (!$candidate->selectByUserId($this->userAuthId)) {
            $this->call(404, 'not_found', 'Candidato não encontrado.', 'error')->back();
            return;
        }

        if (array_key_exists('full_name', $data) && (!is_scalar($data['full_name']) || trim((string)$data['full_name']) === '')) {
            $this->call(400, 'bad_request', 'O nome do candidato não pode ficar vazio.', 'error')->back();
            return;
        }

        $fields = [
            'full_name' => 'setFullName',
            'location' => 'setLocation',
            'salary_expectation' => 'setSalaryExpectation',
            'work_schedule' => 'setWorkSchedule',
            'shift' => 'setShift',
            'work_model' => 'setWorkModel',
            'employment_type' => 'setEmploymentType',
            'about' => 'setAbout'
        ];
        $nullableFields = [];
        $hasCandidateFields = false;
        $nullableMap = [
            'location' => 'location',
            'salary_expectation' => 'salaryExpectation',
            'work_schedule' => 'workSchedule',
            'shift' => 'shift',
            'work_model' => 'workModel',
            'employment_type' => 'employmentType',
            'about' => 'about'
        ];

        foreach ($fields as $field => $setter) {
            if (array_key_exists($field, $data)) {
                if ($data[$field] !== null && !is_scalar($data[$field])) {
                    $this->call(400, 'bad_request', "O campo {$field} possui formato inválido.", 'error')->back();
                    return;
                }
                $value = is_string($data[$field]) ? trim($data[$field]) : $data[$field];
                $candidate->{$setter}($value);
                $hasCandidateFields = true;
                if ($value === null && isset($nullableMap[$field])) {
                    $nullableFields[] = $nullableMap[$field];
                }
            }
        }

        if (!$hasCandidateFields && !array_key_exists('areas', $data)) {
            $this->call(400, 'bad_request', 'Informe ao menos um campo para atualizar.', 'error')->back();
            return;
        }

        if ($hasCandidateFields && !$candidate->updateById((int)$candidate->getId(), $nullableFields)) {
            $this->call(500, 'internal_server_error', 'Não foi possível atualizar o cadastro do candidato.', 'error')->back();
            return;
        }

        if (array_key_exists('areas', $data) && !$this->saveAreas($data['areas'], (int)$candidate->getId())) {
            $this->call(400, 'bad_request', 'Não foi possível atualizar as áreas informadas.', 'error')->back();
            return;
        }

        $this->call(200, 'success', 'Candidato atualizado com sucesso.', 'success')->back();
    }

    public function delete(): void
    {
        if (!$this->authToken(3)) {
            $this->call(401, 'unauthorized', 'Usuário não autenticado ou sem permissão.', 'error')->back();
            return;
        }

        $user = new User();
        if (!$user->deactivateById($this->userAuthId)) {
            $this->call(500, 'internal_server_error', 'Não foi possível desativar a conta do candidato.', 'error')->back();
            return;
        }

        $this->call(200, 'success', 'Conta do candidato desativada com sucesso.', 'success')->back();
    }

    private function saveAreas(array $areas, int $candidateId): bool
    {
        return (new CandidateArea())->replaceForCandidateId($candidateId, $areas);
    }

}
