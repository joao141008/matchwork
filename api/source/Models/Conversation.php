<?php

namespace Source\Models;

use Source\Core\Connect;
use Source\Core\Model;

class Conversation extends Model
{
    private ?int $id;
    private ?int $match_id;
    private ?string $created_at;

    public function __construct(
        ?int $id = null,
        ?int $match_id = null,
        ?string $created_at = null
    ) {
        $this->id = $id;
        $this->match_id = $match_id;
        $this->created_at = $created_at;

        $this->table = "conversations";

        $this->fillable = [
            "matchId",
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

    public function getMatchId(): ?int
    {
        return $this->match_id;
    }

    public function setMatchId(?int $match_id): void
    {
        $this->match_id = $match_id;
    }

    public function getCreatedAt(): ?string
    {
        return $this->created_at;
    }

    public function setCreatedAt(?string $created_at): void
    {
        $this->created_at = $created_at;
    }

    public function selectByUserId(int $userId): array
    {
        $query = "
            SELECT c.*
            FROM {$this->table} c
            INNER JOIN matches m ON m.id = c.match_id
            WHERE m.candidate_user_id = :candidate_id
               OR m.company_user_id = :company_id
            ORDER BY c.created_at DESC
        ";

        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindValue(':candidate_id', $userId, \PDO::PARAM_INT);
        $stmt->bindValue(':company_id', $userId, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function belongsToUser(int $userId): bool
    {
        $query = "
            SELECT 1
            FROM {$this->table} c
            INNER JOIN matches m ON m.id = c.match_id
            WHERE c.id = :conversation_id
              AND (m.candidate_user_id = :candidate_id OR m.company_user_id = :company_id)
            LIMIT 1
        ";

        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindValue(':conversation_id', $this->id, \PDO::PARAM_INT);
        $stmt->bindValue(':candidate_id', $userId, \PDO::PARAM_INT);
        $stmt->bindValue(':company_id', $userId, \PDO::PARAM_INT);
        $stmt->execute();
        return (bool)$stmt->fetchColumn();
    }

    /**
     * Busca uma conversa pelo match.
     */
    public function selectByMatchId(int $matchId): bool
    {
        $query = "
            SELECT *
            FROM {$this->table}
            WHERE match_id = :match_id
            LIMIT 1
        ";

        $stmt = Connect::getInstance()->prepare($query);

        $stmt->bindValue(
            ":match_id",
            $matchId
        );

        $stmt->execute();

        $result = $stmt->fetch();

        if (!$result) {
            $this->errorMessage = "Conversa não encontrada.";
            return false;
        }

        foreach ($result as $column => $value) {
            $property = $this->snakeToCamel($column);
            $setter = "set" . ucfirst($property);

            if (method_exists($this, $setter)) {
                $this->{$setter}($value);
            }
        }

        return true;
    }
}