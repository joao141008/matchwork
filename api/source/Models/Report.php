<?php

namespace Source\Models;

use Source\Core\Model;
use PDO;
use Source\Core\Connect;

class Report extends Model
{
    private ?int $id;
    private ?int $user_id;
    private ?int $reported_user_id;
    private ?string $reason;
    private ?string $description;
    private ?string $status;
    private ?string $admin_response;

    public function __construct(
        ?int $id = null,
        ?int $user_id = null,
        ?int $reported_user_id = null,
        ?string $reason = null,
        ?string $description = null,
        ?string $status = "pending",
        ?string $admin_response = null
    ) {
        $this->id = $id;
        $this->user_id = $user_id;
        $this->reported_user_id = $reported_user_id;
        $this->reason = $reason;
        $this->description = $description;
        $this->status = $status;
        $this->admin_response = $admin_response;

        $this->table = "reports";

        $this->fillable = [
            "userId",
            "reportedUserId",
            "reason",
            "description",
            "status",
            "adminResponse"
        ];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): void
    {
        $this->id = $id;
    }

    public function getUserId(): ?int
    {
        return $this->user_id;
    }

    public function setUserId(?int $user_id): void
    {
        $this->user_id = $user_id;
    }

    public function getReportedUserId(): ?int
    {
        return $this->reported_user_id;
    }

    public function setReportedUserId(?int $reported_user_id): void
    {
        $this->reported_user_id = $reported_user_id;
    }

    public function getReason(): ?string
    {
        return $this->reason;
    }

    public function setReason(?string $reason): void
    {
        $this->reason = $reason;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): void
    {
        $this->description = $description;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(?string $status): void
    {
        $this->status = $status;
    }

    public function getAdminResponse(): ?string
    {
        return $this->admin_response;
    }

    public function setAdminResponse(?string $admin_response): void
    {
        $this->admin_response = $admin_response;
    }


    /**
     * Lista denúncias com identificação pública de quem denunciou
     * e, principalmente, de quem foi denunciado.
     */
    public function selectAllWithUserDetails(): array
    {
        $query = "
            SELECT
                r.id,
                r.user_id,
                r.reported_user_id,
                r.reason,
                r.description,
                r.admin_response,
                r.status,
                r.created_at,

                reporter.email AS reporter_email,
                reporter.type_id AS reporter_type_id,
                COALESCE(
                    reporter_candidate.full_name,
                    reporter_company.company_name,
                    reporter.email,
                    'Usuário'
                ) AS reporter_name,

                reported.email AS reported_email,
                reported.photo AS reported_photo,
                reported.type_id AS reported_type_id,

                CASE
                    WHEN reported.type_id = 4 THEN 'Empresa'
                    WHEN reported.type_id = 3 THEN 'Candidato'
                    ELSE 'Usuário'
                END AS reported_type,

                COALESCE(
                    reported_company.company_name,
                    reported_candidate.full_name,
                    reported.email,
                    CONCAT('Usuário #', r.reported_user_id)
                ) AS reported_name

            FROM {$this->table} r

            LEFT JOIN users reporter
                ON reporter.id = r.user_id

            LEFT JOIN candidates reporter_candidate
                ON reporter_candidate.user_id = reporter.id

            LEFT JOIN companies reporter_company
                ON reporter_company.user_id = reporter.id

            LEFT JOIN users reported
                ON reported.id = r.reported_user_id

            LEFT JOIN candidates reported_candidate
                ON reported_candidate.user_id = reported.id

            LEFT JOIN companies reported_company
                ON reported_company.user_id = reported.id

            ORDER BY r.created_at DESC, r.id DESC
        ";

        try {
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->execute();

            $this->errorMessage = null;

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $exception) {
            $this->errorMessage = $exception->getMessage();

            return [];
        }
    }

    public function reportExists(): bool
    {
        $query = "
            SELECT id
            FROM {$this->table}
            WHERE user_id = :user_id
            AND reported_user_id = :reported_user_id
            LIMIT 1
        ";

        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindValue(":user_id", $this->user_id);
        $stmt->bindValue(":reported_user_id", $this->reported_user_id);
        $stmt->execute();

        return $stmt->fetchColumn() !== false;
    }
}