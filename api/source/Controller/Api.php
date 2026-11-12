<?php

namespace Source\Controller;

use Source\Core\JWTToken;
use Source\Models\User;

class Api
{
    protected ?int $userAuthId = null;
    protected ?int $userAuthTypeId = null;
    protected array $response = [];

    /**
     * Valida o token, confirma que a conta ainda está ativa e, opcionalmente,
     * verifica se o tipo atual do usuário está entre os permitidos.
     */
    public function authToken(int|array|null $typeId = null): bool
    {
        $headers = function_exists('getallheaders') ? (getallheaders() ?: []) : [];
        $normalizedHeaders = [];
        foreach ($headers as $name => $value) {
            $normalizedHeaders[strtolower((string)$name)] = $value;
        }

        $token = $normalizedHeaders['token']
            ?? $normalizedHeaders['authorization']
            ?? $_SERVER['HTTP_AUTHORIZATION']
            ?? $_SERVER['HTTP_TOKEN']
            ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
            ?? null;

        if (!is_string($token) || trim($token) === '') {
            return false;
        }

        $token = trim($token);
        if (preg_match('/^Bearer\s+/i', $token)) {
            $token = preg_replace('/^Bearer\s+/i', '', $token);
        }

        $decoded = (new JWTToken())->decode($token);
        if (!$decoded || !isset($decoded->data->id, $decoded->data->email)) {
            return false;
        }

        $userId = filter_var($decoded->data->id, FILTER_VALIDATE_INT);
        if ($userId === false || $userId < 1) {
            return false;
        }

        $user = new User();
        if (!$user->selectById((int)$userId)) {
            return false;
        }

        if ((int)$user->getActive() !== 1 || $user->getEmail() !== $decoded->data->email) {
            return false;
        }

        if ($typeId !== null) {
            $allowedTypes = is_array($typeId) ? $typeId : [$typeId];
            $allowedTypes = array_map('intval', $allowedTypes);
            if (!in_array((int)$user->getTypeId(), $allowedTypes, true)) {
                return false;
            }
        }

        $this->userAuthId = (int)$userId;
        $this->userAuthTypeId = (int)$user->getTypeId();
        return true;
    }

    protected function call(int $code, ?string $status = null, ?string $message = null, ?string $type = null): Api
    {
        http_response_code($code);
        $this->response = [
            'code' => $code,
            'type' => $type,
            'status' => $status,
            'message' => $message
        ];
        return $this;
    }

    protected function back(object|array|null $data = null): Api
    {
        header('Content-Type: application/json; charset=UTF-8');
        if ($data !== null) {
            $this->response['data'] = $data;
        }

        echo json_encode(
            $this->response,
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        );
        return $this;
    }

    public function hello(): void
    {
        $this->call(200, 'success', 'API MatchWork funcionando.', 'success')->back([
            'name' => 'MatchWork API'
        ]);
    }
}
