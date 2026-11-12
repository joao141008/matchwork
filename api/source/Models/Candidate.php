<?php

namespace Source\Models;

use Source\Core\Connect;
use Source\Core\Model;

class Candidate extends Model
{
    private ?int $id;
    private ?int $user_id;
    private ?string $full_name;
    private ?string $cpf;
    private ?string $location;
    private ?string $interest_area;
    private ?string $salary_expectation;
    private ?string $work_schedule;
    private ?string $shift;
    private ?string $work_model;
    private ?string $employment_type;
    private ?string $about;

    public function __construct(
        ?int $id = null,
        ?int $user_id = null,
        ?string $full_name = null,
        ?string $cpf = null,
        ?string $location = null,
        ?string $interest_area = null,
        ?string $salary_expectation = null,
        ?string $work_schedule = null,
        ?string $shift = null,
        ?string $work_model = null,
        ?string $employment_type = null,
        ?string $about = null
    ) {
        $this->id = $id;
        $this->user_id = $user_id;
        $this->full_name = $full_name;
        $this->cpf = $cpf;
        $this->location = $location;
        $this->interest_area = $interest_area;
        $this->salary_expectation = $salary_expectation;
        $this->work_schedule = $work_schedule;
        $this->shift = $shift;
        $this->work_model = $work_model;
        $this->employment_type = $employment_type;
        $this->about = $about;

        $this->table = "candidates";

        $this->fillable = [
            "userId",
            "fullName",
            "cpf",
            "location",
            "interestArea",
            "salaryExpectation",
            "workSchedule",
            "shift",
            "workModel",
            "employmentType",
            "about"
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

    public function getFullName(): ?string
    {
        return $this->full_name;
    }

    public function setFullName(?string $full_name): void
    {
        $this->full_name = $full_name;
    }

    public function getCpf(): ?string
    {
        return $this->cpf;
    }

    public function setCpf(?string $cpf): void
    {
        $this->cpf = $cpf;
    }

    public function getLocation(): ?string
    {
        return $this->location;
    }

    public function setLocation(?string $location): void
    {
        $this->location = $location;
    }

    public function getInterestArea(): ?string
    {
        return $this->interest_area;
    }

    public function setInterestArea(?string $interest_area): void
    {
        $this->interest_area = $interest_area;
    }

    public function getSalaryExpectation(): ?string
    {
        return $this->salary_expectation;
    }

    public function setSalaryExpectation(?string $salary_expectation): void
    {
        $this->salary_expectation = $salary_expectation;
    }

    public function getWorkSchedule(): ?string
    {
        return $this->work_schedule;
    }

    public function setWorkSchedule(?string $work_schedule): void
    {
        $this->work_schedule = $work_schedule;
    }

    public function getShift(): ?string
    {
        return $this->shift;
    }

    public function setShift(?string $shift): void
    {
        $this->shift = $shift;
    }

    public function getWorkModel(): ?string
    {
        return $this->work_model;
    }

    public function setWorkModel(?string $work_model): void
    {
        $this->work_model = $work_model;
    }

    public function getEmploymentType(): ?string
    {
        return $this->employment_type;
    }

    public function setEmploymentType(?string $employment_type): void
    {
        $this->employment_type = $employment_type;
    }

    public function getAbout(): ?string
    {
        return $this->about;
    }

    public function setAbout(?string $about): void
    {
        $this->about = $about;
    }


    public function cpfExists(): bool
    {
        $query = "SELECT id FROM {$this->table} WHERE cpf = :cpf";

        $stmt = Connect::getInstance()->prepare($query);
        $stmt->bindValue(":cpf", $this->cpf);
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
        $stmt->bindValue(":user_id", $userId);
        $stmt->execute();

        $result = $stmt->fetch();

        if (!$result) {
            $this->errorMessage = "Candidato não encontrado.";
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