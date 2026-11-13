<?php

namespace Source\Controller;

use Source\Models\UserMatch;

class Matches extends Api
{
    public function list(): void
    {
        if (!$this->authToken([3, 4])) {
            $this->call(
                401,
                'unauthorized',
                'Usuário não autenticado ou sem permissão.',
                'error'
            )->back();

            return;
        }

        $match = new UserMatch();

        $matches = $match->selectAllWithContactData(
            $this->userAuthId
        );

        // O banco armazena o caminho relativo da foto. Convertemos para
        // uma URL pública da API antes de entregar os dados ao frontend.
        foreach ($matches as &$item) {
            if (isset($item->contact_photo) && is_string($item->contact_photo)) {
                $item->contact_photo = $this->formatPhotoUrl($item->contact_photo);
            }
        }
        unset($item);

        if ($match->getErrorMessage() !== null) {
            $this->call(
                500,
                'internal_server_error',
                'Não foi possível carregar os matches.',
                'error'
            )->back();

            return;
        }

        $this->call(
            200,
            'success',
            'Matches encontrados.',
            'success'
        )->back($matches);
    }

    public function listById(array $data): void
    {
        if (!$this->authToken([3, 4])) {
            $this->call(
                401,
                'unauthorized',
                'Usuário não autenticado ou sem permissão.',
                'error'
            )->back();

            return;
        }

        $matchId = filter_var(
            $data['matchId'] ?? null,
            FILTER_VALIDATE_INT
        );

        if ($matchId === false || $matchId < 1) {
            $this->call(
                400,
                'bad_request',
                'ID do match inválido.',
                'error'
            )->back();

            return;
        }

        $match = new UserMatch();

        if (!$match->selectById((int)$matchId)) {
            $this->call(
                404,
                'not_found',
                'Match não encontrado.',
                'error'
            )->back();

            return;
        }

        if (
            (int)$match->getCandidateUserId() !== $this->userAuthId &&
            (int)$match->getCompanyUserId() !== $this->userAuthId
        ) {
            $this->call(
                403,
                'forbidden',
                'Você não tem acesso a este match.',
                'error'
            )->back();

            return;
        }

        $this->call(
            200,
            'success',
            'Match encontrado.',
            'success'
        )->back($match);
    }


    private function formatPhotoUrl(?string $photoPath): ?string
    {
        if ($photoPath === null || trim($photoPath) === '') {
            return null;
        }

        $photoPath = trim($photoPath);

        if (
            preg_match('~^https?://~i', $photoPath) ||
            str_starts_with($photoPath, 'data:image/') ||
            str_starts_with($photoPath, '/')
        ) {
            return $photoPath;
        }

        $scriptDirectory = dirname(
            (string) ($_SERVER['SCRIPT_NAME'] ?? '/api/index.php')
        );

        $apiDirectory = rtrim(
            str_replace('\\', '/', $scriptDirectory),
            '/'
        );

        if ($apiDirectory === '' || $apiDirectory === '.') {
            $apiDirectory = '/api';
        }

        if ($apiDirectory[0] !== '/') {
            $apiDirectory = '/' . $apiDirectory;
        }

        return $apiDirectory . '/' . ltrim(
            str_replace('\\', '/', $photoPath),
            '/'
        );
    }
}
