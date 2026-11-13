<?php

namespace Source\Controller;

use PDO;
use Source\Core\Connect;

class AdminDashboard extends Api
{
    /**
     * Retorna indicadores reais do painel administrativo.
     * Os totais de candidatos e empresas consideram somente contas ativas.
     */
    public function stats(): void
    {
        if (!$this->authToken(1)) {
            $this->call(
                401,
                'unauthorized',
                'Acesso permitido somente para administradores.',
                'error'
            )->back();

            return;
        }

        try {
            $query = "
                SELECT
                    (
                        SELECT COUNT(*)
                        FROM matches
                    ) AS total_matches,

                    (
                        SELECT COUNT(*)
                        FROM candidates c
                        INNER JOIN users u ON u.id = c.user_id
                        WHERE u.active = 1
                    ) AS total_candidates,

                    (
                        SELECT COUNT(*)
                        FROM companies c
                        INNER JOIN users u ON u.id = c.user_id
                        WHERE u.active = 1
                    ) AS total_companies
            ";

            $stmt = Connect::getInstance()->query($query);
            $stats = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];

            $this->call(
                200,
                'success',
                'Indicadores administrativos carregados.',
                'success'
            )->back([
                'total_matches' => (int)($stats['total_matches'] ?? 0),
                'total_candidates' => (int)($stats['total_candidates'] ?? 0),
                'total_companies' => (int)($stats['total_companies'] ?? 0)
            ]);
        } catch (\Throwable $exception) {
            $this->call(
                500,
                'internal_server_error',
                'Não foi possível carregar os indicadores administrativos.',
                'error'
            )->back();
        }
    }
}
