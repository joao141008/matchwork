<?php

namespace source\Models;

use Source\Core\Model;
use Source\Core\Connect;

class Product
{
    private ?int $id;
    private ?int $categoryId;
    private ?string $name;
    private ?float $price;

    public function __construct(?int $id = null, ?int $categoryId = null, ?string $name = null, ?float $price = null)
    {
        $this->id = $id;
        $this->categoryId = $categoryId;
        $this->name = $name;
        $this->price = $price;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function getCategoryId(): int
    {
        return $this->categoryId;
    }

    public function setCategoryId(int $categoryId): void
    {
        $this->categoryId = $categoryId;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function getPrice(): float
    {
        return $this->price;
    }

    public function setPrice(float $price): void
    {
        $this->price = $price;
    }

    public function listAll (): array
    {
        $query = "SELECT products.*,  products_categories.name as 'category_name'
                  FROM products
                  JOIN products_categories ON products.category_id = products_categories.id WHERE active = 1";
        $stmt = Connect::getInstance()->query($query);
        return $stmt->fetchAll();
    }

    public function listById (int $id): object | false
    {
        $query = "SELECT * FROM products WHERE id = :id AND active = 1";
        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function insert (): bool
    {
        $query = "INSERT INTO products VALUES (NULL, :categoryId, :name, :price, active = 1)";
        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindParam(":categoryId", $this->categoryId);
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":price", $this->price);
        if(!$stmt->execute()) {
            return false;
        }
        $this->id = Connect::getInstance()->lastInsertId();
        return true;
    }
    public function update (int $id): bool
    {
        $query = "UPDATE products SET category_id = :categoryId, name = :name, price = :price WHERE id = :id";
        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":categoryId", $this->categoryId);
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":price", $this->price);
        if(!$stmt->execute()) {
            return false;
        }
        $this->id = Connect::getInstance()->lastInsertId();
        return true;
    }

    public function delete(int $id): bool
    {
        $query = "UPDATE products SET active = 0 WHERE id = :id AND active = 1";
        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindParam(":id", $id);
        if(!$stmt->execute()) {
            return false;
        }
        $this->id = Connect::getInstance()->lastInsertId();
        return true;
    }
}