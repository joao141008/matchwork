<?php

namespace Source\Models;

use Source\Core\Connect;
use Source\Core\Model;

class Company extends Model
{
    private ?int $id;
    private ?int $user_id;
    private ?string $company_name;
    private ?string $cnpj;
    private ?string $location;
    private ?string $website;
    private ?string $company_size;
    private ?string $industry;
    private ?string $description;

    public function __construct(
        ?int $id = null,
        ?int $user_id = null,
        ?string $company_name = null,
        ?string $cnpj = null,
        ?string $location = null,
        ?string $industry = null,
        ?string $description = null,
        ?string $website = null,
        ?string $company_size = null
    ) {
        $this->id = $id;
        $this->user_id = $user_id;
        $this->company_name = $company_name;
        $this->cnpj = $cnpj;
        $this->location = $location;
        $this->website = $website;
        $this->company_size = $company_size;
        $this->industry = $industry;
        $this->description = $description;

        $this->table = 'companies';

        $this->fillable = [
            'userId',
            'companyName',
            'cnpj',
            'location',
            'website',
            'companySize',
            'industry',
            'description'
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

    public function getCompanyName(): ?string
    {
        return $this->company_name;
    }

    public function setCompanyName(?string $company_name): void
    {
        $this->company_name = $company_name;
    }

    public function getCnpj(): ?string
    {
        return $this->cnpj;
    }

    public function setCnpj(?string $cnpj): void
    {
        $this->cnpj = $cnpj;
    }

    public function getLocation(): ?string
    {
        return $this->location;
    }

    public function setLocation(?string $location): void
    {
        $this->location = $location;
    }

    public function getWebsite(): ?string
    {
        return $this->website;
    }

    public function setWebsite(?string $website): void
    {
        $this->website = $website;
    }

    public function getCompanySize(): ?string
    {
        return $this->company_size;
    }

    public function setCompanySize(?string $company_size): void
    {
        $this->company_size = $company_size;
    }

    public function getIndustry(): ?string
    {
        return $this->industry;
    }

    public function setIndustry(?string $industry): void
    {
        $this->industry = $industry;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): void
    {
        $this->description = $description;
    }

    public function cnpjExists(): bool
    {
        $query = "
            SELECT id
            FROM {$this->table}
            WHERE cnpj = :cnpj
        ";

        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindValue(':cnpj', $this->cnpj);
        $stmt->execute();

        return $stmt->fetchColumn() !== false;
    }

    public function selectByUserId(int $userId): bool
    {
        $query = "
            SELECT *
            FROM {$this->table}
            WHERE user_id = :user_id
            LIMIT 1
        ";

        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindValue(':user_id', $userId);
        $stmt->execute();

        $result = $stmt->fetch();

        if (!$result) {
            $this->errorMessage = 'Empresa não encontrada.';
            return false;
        }

        foreach ($result as $column => $value) {
            $property = $this->snakeToCamel($column);
            $setter = 'set' . ucfirst($property);

            if (method_exists($this, $setter)) {
                $this->{$setter}($value);
            }
        }

        return true;
    }
}
