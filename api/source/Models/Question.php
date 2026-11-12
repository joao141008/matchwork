<?php

namespace Source\Models;

use Source\Core\Connect;
use Source\Core\Model;

class Question extends Model
{
    private ?int $id = null;
    private ?int $user_id = null;
    private ?string $subject = null;
    private ?string $question = null;
    private ?string $answer = null;
    private ?string $status = 'open';
    private ?string $created_at = null;

    public function __construct(
        ?int $id = null,
        ?int $user_id = null,
        ?string $subject = null,
        ?string $question = null,
        ?string $answer = null,
        ?string $status = 'open',
        ?string $created_at = null
    ) {
        $this->id = $id;
        $this->user_id = $user_id;
        $this->subject = $subject;
        $this->question = $question;
        $this->answer = $answer;
        $this->status = $status;
        $this->created_at = $created_at;
        $this->table = 'questions';
        $this->fillable = ['userId', 'subject', 'question', 'answer', 'status'];
    }

    public function getId(): ?int { return $this->id; }
    public function setId(?int $id): void { $this->id = $id; }
    public function getUserId(): ?int { return $this->user_id; }
    public function setUserId(?int $user_id): void { $this->user_id = $user_id; }
    public function getSubject(): ?string { return $this->subject; }
    public function setSubject(?string $subject): void { $this->subject = $subject; }
    public function getQuestion(): ?string { return $this->question; }
    public function setQuestion(?string $question): void { $this->question = $question; }
    public function getAnswer(): ?string { return $this->answer; }
    public function setAnswer(?string $answer): void { $this->answer = $answer; }
    public function getStatus(): ?string { return $this->status; }
    public function setStatus(?string $status): void { $this->status = $status; }
    public function getCreatedAt(): ?string { return $this->created_at; }
    public function setCreatedAt(?string $created_at): void { $this->created_at = $created_at; }

    public function selectByUserId(int $userId): array
    {
        $stmt = Connect::getInstance()->prepare(
            "SELECT * FROM {$this->table} WHERE user_id = :user_id ORDER BY created_at DESC"
        );
        $stmt->bindValue(':user_id', $userId, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function selectAllWithUser(): array
    {
        $stmt = Connect::getInstance()->query(
            "SELECT q.*, u.email FROM {$this->table} q INNER JOIN users u ON u.id = q.user_id ORDER BY q.created_at DESC"
        );
        return $stmt->fetchAll();
    }
}
