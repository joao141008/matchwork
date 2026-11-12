<?php

namespace Source\Models;

use Source\Core\Connect;
use Source\Core\Model;

class VacancyLike extends Model
{
    private ?int $id;
    private ?int $candidate_user_id;
    private ?int $vacancy_id;
    private ?string $created_at;

    public function __construct(
        ?int $id = null,
        ?int $candidate_user_id = null,
        ?int $vacancy_id = null,
        ?string $created_at = null
    ) {
        $this->id = $id;
        $this->candidate_user_id = $candidate_user_id;
        $this->vacancy_id = $vacancy_id;
        $this->created_at = $created_at;

        $this->table = "vacancy_likes";

        $this->fillable = [
            "candidateUserId",
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
        return $this->candidate_user_id;
    }

    public function setCandidateUserId(?int $candidate_user_id): void
    {
        $this->candidate_user_id = $candidate_user_id;
    }

    public function getVacancyId(): ?int
    {
        return $this->vacancy_id;
    }

    public function setVacancyId(?int $vacancy_id): void
    {
        $this->vacancy_id = $vacancy_id;
    }

    public function getCreatedAt(): ?string
    {
        return $this->created_at;
    }

    public function setCreatedAt(?string $created_at): void
    {
        $this->created_at = $created_at;
    }

    public function likeExists(): bool
    {
        $query = "
            SELECT id
            FROM {$this->table}
            WHERE candidate_user_id = :candidate_user_id
            AND vacancy_id = :vacancy_id
            LIMIT 1
        ";

        $stmt = Connect::getInstance()->prepare($query);

        $stmt->bindValue(":candidate_user_id", $this->candidate_user_id);
        $stmt->bindValue(":vacancy_id", $this->vacancy_id);

        $stmt->execute();

        return $stmt->fetchColumn() !== false;
    }
}