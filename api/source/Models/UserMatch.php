<?php

namespace Source\Models;

use PDO;
use Source\Core\Connect;
use Source\Core\Model;

class UserMatch extends Model
{
    private ?int $id;
    private ?int $candidateUserId;
    private ?int $companyUserId;
    private ?int $vacancyId;
    private ?string $createdAt;

    public function __construct(
        ?int $id = null,
        ?int $candidateUserId = null,
        ?int $companyUserId = null,
        ?int $vacancyId = null,
        ?string $createdAt = null
    ) {
        $this->id = $id;
        $this->candidateUserId = $candidateUserId;
        $this->companyUserId = $companyUserId;
        $this->vacancyId = $vacancyId;
        $this->createdAt = $createdAt;

        $this->table = "matches";

        $this->fillable = [
            "candidateUserId",
            "companyUserId",
            "vacancyId",
            "createdAt"
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

    public function getCandidateUserId(): ?int
    {
        return $this->candidateUserId;
    }

    public function setCandidateUserId(?int $candidateUserId): void
    {
        $this->candidateUserId = $candidateUserId;
    }

    public function getCompanyUserId(): ?int
    {
        return $this->companyUserId;
    }

    public function setCompanyUserId(?int $companyUserId): void
    {
        $this->companyUserId = $companyUserId;
    }

    public function getVacancyId(): ?int
    {
        return $this->vacancyId;
    }

    public function setVacancyId(?int $vacancyId): void
    {
        $this->vacancyId = $vacancyId;
    }

    public function getCreatedAt(): ?string
    {
        return $this->createdAt;
    }

    public function setCreatedAt(?string $createdAt): void
    {
        $this->createdAt = $createdAt;
    }

    /**
     * Lista os matches do usuário e os dados públicos
     * do outro participante.
     */
    public function selectAllWithContactData(int $userId): array
    {
        $query = "
            SELECT
                m.id,
                m.candidate_user_id,
                m.company_user_id,
                m.vacancy_id,
                m.created_at,

                CASE
                    WHEN m.candidate_user_id = :viewer_contact_id
                    THEN m.company_user_id
                    ELSE m.candidate_user_id
                END AS contact_user_id,

                COALESCE(
                    CASE
                        WHEN m.candidate_user_id = :viewer_name_id
                        THEN companies.company_name
                        ELSE candidates.full_name
                    END,
                    'Perfil não disponível'
                ) AS contact_name,

                CASE
                    WHEN m.candidate_user_id = :viewer_type_id
                    THEN 'company'
                    ELSE 'candidate'
                END AS contact_type,

                contact_user.photo AS contact_photo

            FROM {$this->table} m

            LEFT JOIN companies
                ON companies.user_id = m.company_user_id

            LEFT JOIN candidates
                ON candidates.user_id = m.candidate_user_id

            LEFT JOIN users contact_user
                ON contact_user.id = CASE
                    WHEN m.candidate_user_id = :viewer_photo_id
                    THEN m.company_user_id
                    ELSE m.candidate_user_id
                END

            WHERE m.candidate_user_id = :candidate_user_id
               OR m.company_user_id = :company_user_id

            ORDER BY m.created_at DESC
        ";

        try {
            $stmt = Connect::getInstance()->prepare($query);

            $stmt->bindValue(':viewer_contact_id', $userId, PDO::PARAM_INT);
            $stmt->bindValue(':viewer_name_id', $userId, PDO::PARAM_INT);
            $stmt->bindValue(':viewer_type_id', $userId, PDO::PARAM_INT);
            $stmt->bindValue(':viewer_photo_id', $userId, PDO::PARAM_INT);

            $stmt->bindValue(':candidate_user_id', $userId, PDO::PARAM_INT);
            $stmt->bindValue(':company_user_id', $userId, PDO::PARAM_INT);

            $stmt->execute();

            $this->errorMessage = null;

            return $stmt->fetchAll();

        } catch (\PDOException $exception) {
            $this->errorMessage = $exception->getMessage();
            return [];
        }
    }

    public function matchExists(): bool
    {
        $query = "
            SELECT id
            FROM {$this->table}
            WHERE candidate_user_id = :candidate_user_id
            AND company_user_id = :company_user_id
            AND vacancy_id = :vacancy_id
            LIMIT 1
        ";

        $stmt = Connect::getInstance()->prepare($query);

        $stmt->bindValue(":candidate_user_id", $this->candidateUserId);
        $stmt->bindValue(":company_user_id", $this->companyUserId);
        $stmt->bindValue(":vacancy_id", $this->vacancyId);

        $stmt->execute();

        return $stmt->fetchColumn() !== false;
    }
}
