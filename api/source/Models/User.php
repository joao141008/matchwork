<?php

namespace Source\Models;

use PDO;
use Source\Core\Connect;
use Source\Core\JWTToken;
use Source\Core\Model;

class User extends Model
{
    private ?int $id = null;
    private ?int $typeId = null;
    private ?string $email = null;
    private ?string $password = null;
    private ?string $photo = null;
    private ?int $active = 1;
    private ?string $token = null;

    public function __construct(
        ?int $id = null,
        ?int $typeId = null,
        ?string $email = null,
        ?string $password = null,
        ?string $photo = null,
        ?int $active = 1
    ) {
        $this->id = $id;
        $this->typeId = $typeId;
        $this->email = $email;
        $this->password = $password;
        $this->photo = $photo;
        $this->active = $active;

        $this->table = 'users';
        $this->fillable = ['typeId', 'email', 'password', 'photo', 'active'];
    }

    public function getId(): ?int { return $this->id; }
    public function setId(?int $id): void { $this->id = $id; }
    public function getTypeId(): ?int { return $this->typeId; }
    public function setTypeId(?int $typeId): void { $this->typeId = $typeId; }
    public function getEmail(): ?string { return $this->email; }
    public function setEmail(?string $email): void { $this->email = $email; }
    public function getPassword(): ?string { return $this->password; }
    public function setPassword(?string $password): void { $this->password = $password; }
    public function getPhoto(): ?string { return $this->photo; }
    public function setPhoto(?string $photo): void { $this->photo = $photo; }
    public function getActive(): ?int { return $this->active; }
    public function setActive(?int $active): void { $this->active = $active; }
    public function getToken(): ?string { return $this->token; }

    public function insert(): bool
    {
        if (empty($this->email) || empty($this->password)) {
            $this->errorMessage = 'E-mail e senha são obrigatórios.';
            return false;
        }

        if ($this->emailExists()) {
            $this->errorMessage = 'E-mail já cadastrado.';
            return false;
        }

        $plainPassword = $this->password;
        $this->password = password_hash($plainPassword, PASSWORD_DEFAULT);

        if (!parent::insert()) {
            $this->password = $plainPassword;
            return false;
        }

        return true;
    }

    public function login(string $email, string $password, ?array $allowedTypeIds = null): bool
    {
        $query = "SELECT * FROM {$this->table} WHERE email = :email AND active = 1 LIMIT 1";
        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindValue(':email', $email);
        $stmt->execute();
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user->password)) {
            $this->errorMessage = 'E-mail ou senha inválidos.';
            return false;
        }

        if ($allowedTypeIds !== null && !in_array((int)$user->type_id, array_map('intval', $allowedTypeIds), true)) {
            $this->errorMessage = 'E-mail ou senha inválidos.';
            return false;
        }

        $this->id = (int)$user->id;
        $this->typeId = (int)$user->type_id;
        $this->email = $user->email;
        $this->password = $user->password;
        $this->photo = $user->photo;
        $this->active = (int)$user->active;

        $this->token = (new JWTToken())->encode([
            'id' => $this->id,
            'email' => $this->email,
            'type_id' => $this->typeId
        ]);

        return true;
    }

    public function emailExists(?int $ignoreUserId = null): bool
    {
        $query = "SELECT id FROM {$this->table} WHERE email = :email";
        if ($ignoreUserId !== null) {
            $query .= ' AND id <> :ignore_id';
        }
        $query .= ' LIMIT 1';

        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindValue(':email', $this->email);
        if ($ignoreUserId !== null) {
            $stmt->bindValue(':ignore_id', $ignoreUserId, PDO::PARAM_INT);
        }
        $stmt->execute();
        return (bool)$stmt->fetchColumn();
    }

    public function selectAllPublic(): array
    {
        $query = "SELECT id, type_id, email, photo, active, created_at FROM {$this->table} ORDER BY id ASC";
        return Connect::getInstance()->query($query)->fetchAll();
    }

    public function selectPublicById(int $id): object|false
    {
        $query = "SELECT id, type_id, email, photo, active, created_at FROM {$this->table} WHERE id = :id LIMIT 1";
        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function deactivateById(int $id): bool
    {
        if (!$this->selectById($id)) {
            return false;
        }

        $this->active = 0;
        return $this->updateById($id);
    }

    public function jsonSerialize(): array
    {
        $data = parent::jsonSerialize();
        unset($data['password']);
        return $data;
    }
}
