<?php

namespace Source\Models;

use Source\Core\Model;
use Source\Core\Connect;

class Report extends Model
{
    private ?int $id;
    private ?int $user_id;
    private ?int $reported_user_id;
    private ?string $reason;
    private ?string $description;
    private ?string $status;

    public function __construct(
        ?int $id = null,
        ?int $user_id = null,
        ?int $reported_user_id = null,
        ?string $reason = null,
        ?string $description = null,
        ?string $status = "pending"
    ) {
        $this->id = $id;
        $this->user_id = $user_id;
        $this->reported_user_id = $reported_user_id;
        $this->reason = $reason;
        $this->description = $description;
        $this->status = $status;

        $this->table = "reports";

        $this->fillable = [
            "userId",
            "reportedUserId",
            "reason",
            "description",
            "status"
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