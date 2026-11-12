<?php

namespace Source\Models;

use Source\Core\Model;

class Message extends Model
{
    private ?int $id;
    private ?int $conversation_id;
    private ?int $sender_user_id;
    private ?string $message;
    private ?string $created_at;

    public function __construct(
        ?int $id = null,
        ?int $conversation_id = null,
        ?int $sender_user_id = null,
        ?string $message = null,
        ?string $created_at = null
    ) {
        $this->id = $id;
        $this->conversation_id = $conversation_id;
        $this->sender_user_id = $sender_user_id;
        $this->message = $message;
        $this->created_at = $created_at;

        $this->table = "messages";

        $this->fillable = [
            "conversationId",
            "senderId",
            "message",
            "createdAt"
        ];
    }

    public function selectByConversationId(int $conversationId): array
    {
        return $this->selectAll(
            ['conversation_id = :conversation_id'],
            'created_at',
            'ASC',
            [':conversation_id' => $conversationId]
        );
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): void
    {
        $this->id = $id;
    }

    public function getConversationId(): ?int
    {
        return $this->conversation_id;
    }

    public function setConversationId(?int $conversation_id): void
    {
        $this->conversation_id = $conversation_id;
    }

    public function getSenderId(): ?int
    {
        return $this->sender_user_id;
    }

    public function setSenderId(?int $sender_user_id): void
    {
        $this->sender_user_id = $sender_user_id;
    }

    public function getMessage(): ?string
    {
        return $this->message;
    }

    public function setMessage(?string $message): void
    {
        $this->message = $message;
    }

    public function getCreatedAt(): ?string
    {
        return $this->created_at;
    }

    public function setCreatedAt(?string $created_at): void
    {
        $this->created_at = $created_at;
    }
}