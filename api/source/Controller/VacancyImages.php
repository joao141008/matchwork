<?php

namespace Source\Controller;

use RuntimeException;
use Source\Core\Connect;
use Source\Models\Company;
use Source\Models\Vacancy;
use Source\Models\VacancyImage;
use Source\Support\VacancyImageUpload;
use Throwable;

class VacancyImages extends Api
{
    /**
     * Adiciona várias imagens a uma vaga existente.
     */
    public function upload(array $data): void
    {
        $vacancyId = filter_var(
            $data['vacancyId'] ?? null,
            FILTER_VALIDATE_INT
        );

        if ($vacancyId === false || $vacancyId < 1) {
            $this->call(
                400,
                'bad_request',
                'ID da vaga inválido.',
                'error'
            )->back(null);

            return;
        }

        if (!$this->authToken(4)) {
            $this->call(
                401,
                'unauthorized',
                'Somente empresas autenticadas podem enviar imagens.',
                'error'
            )->back(null);

            return;
        }

        $vacancy = $this->findOwnedVacancy((int) $vacancyId);

        if ($vacancy === null) {
            return;
        }

        $imageModel = new VacancyImage();

        $currentImages = $imageModel->selectByVacancyId(
            (int) $vacancyId
        );

        if ($imageModel->getErrorMessage() !== null) {
            $this->call(
                500,
                'internal_server_error',
                'Não foi possível consultar as imagens da vaga.',
                'error'
            )->back(null);

            return;
        }

        $currentCount = count($currentImages);

        $remaining = VacancyImageUpload::MAX_IMAGES_PER_VACANCY
            - $currentCount;

        if ($remaining <= 0) {
            $this->call(
                400,
                'bad_request',
                'Esta vaga já atingiu o limite de 6 imagens.',
                'error'
            )->back(null);

            return;
        }

        $files = $_FILES['images'] ?? [];

        $uploader = new VacancyImageUpload();

        try {

            $storedPaths = $uploader->storeMany(
                $files,
                $remaining
            );

        } catch (RuntimeException $exception) {

            $this->call(
                400,
                'bad_request',
                $exception->getMessage(),
                'error'
            )->back(null);

            return;

        } catch (Throwable $exception) {

            error_log(
                '[MatchWork] Falha no upload de imagens: '
                . $exception->getMessage()
            );

            $this->call(
                500,
                'internal_server_error',
                'Não foi possível armazenar as imagens.',
                'error'
            )->back(null);

            return;
        }

        $db = Connect::getInstance();

        $nextPosition = $imageModel->nextPositionForVacancy(
            (int) $vacancyId
        );

        if ($imageModel->getErrorMessage() !== null) {

            $uploader->deleteMany($storedPaths);

            $this->call(
                500,
                'internal_server_error',
                'Não foi possível definir a ordem das imagens.',
                'error'
            )->back(null);

            return;
        }

        // REGISTRAR IMAGENS NO BANCO

        try {

            $db->beginTransaction();

            foreach ($storedPaths as $index => $relativePath) {

                $image = new VacancyImage(
                    null,
                    (int) $vacancyId,
                    $relativePath,
                    $nextPosition + $index
                );

                if (!$image->insert()) {

                    throw new RuntimeException(
                        $image->getErrorMessage()
                            ?? 'Não foi possível registrar uma imagem da vaga.'
                    );

                }
            }

            $db->commit();

        } catch (Throwable $exception) {

            if ($db->inTransaction()) {
                $db->rollBack();
            }

            $uploader->deleteMany($storedPaths);

            error_log(
                '[MatchWork] Falha ao registrar imagens da vaga: '
                . $exception->getMessage()
            );

            $this->call(
                500,
                'internal_server_error',
                'As imagens foram recebidas, mas não foi possível vinculá-las à vaga.',
                'error'
            )->back(null);

            return;
        }

        // RETORNAR IMAGENS ATUALIZADAS

        $images = (new VacancyImage())->selectByVacancyId(
            (int) $vacancyId
        );

        $this->call(
            201,
            'created',
            'Imagens adicionadas à vaga com sucesso.',
            'success'
        )->back([
            'vacancy_id' => (int) $vacancyId,
            'images' => $images,
            'maximum_images' => VacancyImageUpload::MAX_IMAGES_PER_VACANCY
        ]);
    }

    /**
     * Exclui uma imagem específica de uma vaga.
     */
    public function delete(array $data): void
    {
        $vacancyId = filter_var(
            $data['vacancyId'] ?? null,
            FILTER_VALIDATE_INT
        );

        $imageId = filter_var(
            $data['imageId'] ?? null,
            FILTER_VALIDATE_INT
        );

        if (
            $vacancyId === false ||
            $vacancyId < 1 ||
            $imageId === false ||
            $imageId < 1
        ) {
            $this->call(
                400,
                'bad_request',
                'Os IDs da vaga e da imagem são inválidos.',
                'error'
            )->back(null);

            return;
        }

        if (!$this->authToken(4)) {
            $this->call(
                401,
                'unauthorized',
                'Somente empresas autenticadas podem remover imagens.',
                'error'
            )->back(null);

            return;
        }

        $vacancy = $this->findOwnedVacancy((int) $vacancyId);

        if ($vacancy === null) {
            return;
        }

        $image = new VacancyImage();

        if (!$image->selectById((int) $imageId)) {
            $this->call(
                404,
                'not_found',
                'Imagem não encontrada.',
                'error'
            )->back(null);

            return;
        }

        if ((int) $image->getVacancyId() !== (int) $vacancyId) {
            $this->call(
                404,
                'not_found',
                'Imagem não encontrada nesta vaga.',
                'error'
            )->back(null);

            return;
        }

        $relativePath = (string) $image->getImagePath();

        $db = Connect::getInstance();

        try {

            $db->beginTransaction();

            if (!$image->deleteById((int) $imageId)) {
                throw new RuntimeException(
                    'Não foi possível remover o registro da imagem.'
                );
            }

            $db->commit();

        } catch (Throwable $exception) {

            if ($db->inTransaction()) {
                $db->rollBack();
            }

            error_log(
                '[MatchWork] Falha ao excluir imagem da vaga: '
                . $exception->getMessage()
            );

            $this->call(
                500,
                'internal_server_error',
                'Não foi possível remover a imagem.',
                'error'
            )->back(null);

            return;
        }

        // REMOVER ARQUIVO FÍSICO

        $uploader = new VacancyImageUpload();

        if (!$uploader->delete($relativePath)) {
            error_log(
                '[MatchWork] Não foi possível remover o arquivo físico: '
                . $relativePath
            );
        }

        $this->call(
            200,
            'success',
            'Imagem removida com sucesso.',
            'success'
        )->back([
            'vacancy_id' => (int) $vacancyId,
            'images' => (new VacancyImage())->selectByVacancyId(
                (int) $vacancyId
            )
        ]);
    }

    /**
     * Confirma que a vaga pertence à empresa autenticada.
     */
    private function findOwnedVacancy(int $vacancyId): ?Vacancy
    {
        $company = new Company();

        if (!$company->selectByUserId((int) $this->userAuthId)) {
            $this->call(
                404,
                'not_found',
                'Cadastro da empresa não encontrado.',
                'error'
            )->back(null);

            return null;
        }

        $vacancy = new Vacancy();

        if (!$vacancy->selectById($vacancyId)) {
            $this->call(
                404,
                'not_found',
                'Vaga não encontrada.',
                'error'
            )->back(null);

            return null;
        }

        if (
            (int) $vacancy->getCompanyId() !==
            (int) $company->getId()
        ) {
            $this->call(
                403,
                'forbidden',
                'Você não tem permissão para alterar imagens desta vaga.',
                'error'
            )->back(null);

            return null;
        }

        return $vacancy;
    }
}
