<?php

namespace Source\Models;

use Source\Core\Model;
use Source\Core\Connect;

class Interaction extends Model
{
    private ?int $id;
    private ?int $from_user_id;
    private ?int $to_user_id;
    private ?string $action;

    public function __construct(
        ?int $id = null,
        ?int $from_user_id = null,
        ?int $to_user_id = null,
        ?string $action = null
    ) {
        $this->id = $id;
        $this->from_user_id = $from_user_id;
        $this->to_user_id = $to_user_id;
        $this->action = $action;

        $this->table = "interactions";

        $this->fillable = [
            "fromUserId",
            "toUserId",
            "action"
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

    public function getFromUserId(): ?int
    {
        return $this->from_user_id;
    }

    public function setFromUserId(?int $id): void
    {
        $this->from_user_id = $id;
    }

    public function getToUserId(): ?int
    {
        return $this->to_user_id;
    }

    public function setToUserId(?int $id): void
    {
        $this->to_user_id = $id;
    }

    public function getAction(): ?string
    {
        return $this->action;
    }

    public function setAction(?string $action): void
    {
        $this->action = $action;
    }

 
    public function interactionExists(): bool
    {
        
        $query = "
            SELECT id
            FROM interactions
            WHERE from_user_id = :from_user_id
            AND to_user_id = :to_user_id
        ";

        $stmt = Connect::getInstance()->prepare($query);

        $stmt->bindValue(":from_user_id", $this->from_user_id);
        $stmt->bindValue(":to_user_id", $this->to_user_id);

        $stmt->execute();

        return $stmt->rowCount() > 0;
        
    }
    //Verfica se já occoreu uma interação entre os dois usuários
}