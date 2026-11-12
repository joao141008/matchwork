<?php

namespace source\Models;

use Source\Core\Connect;

class ProductCategory
{
    private ?int $id;
    private ?string $name;

    public function __construct(?int $id = null, ?string $name = null)
    {
        $this->id = $id;
        $this->name = $name;
    }

     public function getId(): int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function listAll (): array
    {
        $query = "SELECT * FROM products_categories";
        $stmt = Connect::getInstance()->query($query);
        return $stmt->fetchAll();
    }

    public function listId(int $id):object | false
    // esse $id é o $data lá public function productsCategoriesList_id
    {
      $query = "SELECT * FROM products_categories WHERE id = :id";
      $stmt = Connect::getInstance()->prepare($query);
      $stmt->bindParam(":id", $id);
      $stmt->execute();
      return $stmt->fetch();
    }

    public function insert(): bool
    {
        $query = "INSERT INTO products_categories VALUES (NULL, :name)";
        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindParam(":name", $this->name);
        if(!$stmt->execute()) {
            return false;
        }
        $this->id = Connect::getInstance()->lastInsertId();
        return true;
    }
}