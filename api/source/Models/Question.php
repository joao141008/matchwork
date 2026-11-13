<?php

namespace Source\Models;

use PDO;
use Source\Core\Connect;
use Source\Core\Model;

class Question extends Model
{
    private ?int $id = null;
    private ?int $user_id = null;
    private ?string $request_type = 'question';
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
        ?string $created_at = null,
        ?string $request_type = 'question'
    ) {
        $this->id = $id;
        $this->user_id = $user_id;
        $this->request_type = $request_type;
        $this->subject = $subject;
        $this->question = $question;
        $this->answer = $answer;
        $this->status = $status;
        $this->created_at = $created_at;
        $this->table = 'questions';
        $this->fillable = ['userId', 'requestType', 'subject', 'question', 'answer', 'status', 'createdAt'];
    }

    public function getId(): ?int { return $this->id; }
    public function getUserId(): ?int { return $this->user_id; }
    public function getRequestType(): ?string { return $this->request_type; }
    public function setRequestType(?string $request_type): void { $this->request_type = $request_type; }
    public function getSubject(): ?string { return $this->subject; }
    public function getQuestion(): ?string { return $this->question; }
    public function getAnswer(): ?string { return $this->answer; }
    public function getStatus(): ?string { return $this->status; }
    public function getCreatedAt(): ?string { return $this->created_at; }

    public function selectByUserId(int $userId): array
    {
        $stmt = Connect::getInstance()->prepare(
            "SELECT * FROM {$this->table} WHERE user_id = :user_id ORDER BY created_at DESC"
        );
        $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function selectAllWithUser(): array
    {
        $stmt = Connect::getInstance()->query(
            "SELECT
                q.*,
                u.email,
                u.type_id AS user_type_id,
                u.photo AS user_photo,
                COALESCE(c.full_name, co.company_name, u.email) AS user_name
             FROM {$this->table} q
             INNER JOIN users u ON u.id = q.user_id
             LEFT JOIN candidates c ON c.user_id = u.id
             LEFT JOIN companies co ON co.user_id = u.id
             ORDER BY q.created_at DESC"
        );
        return $stmt->fetchAll();
    }

    public function answerById(int $id, string $answer): bool
    {
        $stmt = Connect::getInstance()->prepare(
            "UPDATE {$this->table}
             SET answer = :answer, status = 'answered'
             WHERE id = :id"
        );
        $stmt->bindValue(':answer', $answer);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount() > 0 || $this->existsById($id);
    }

    private function existsById(int $id): bool
    {
        $stmt = Connect::getInstance()->prepare(
            "SELECT 1 FROM {$this->table} WHERE id = :id LIMIT 1"
        );
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return (bool) $stmt->fetchColumn();
    }
}
