<?php

namespace Source\Models;

use Source\Core\Connect;
use Source\Core\Model;
use PDO;

class Vacancy extends Model
{
    private ?int $id;
    private ?int $company_id;
    private ?string $title;
    private ?string $description;
    private ?string $requirements;
    private ?string $salary_offer;
    private ?string $workload;
    private ?string $work_schedule;
    private ?string $shift;
    private ?string $work_model;
    private ?string $employment_type;
    private ?string $location;
    private ?string $benefits;
    private ?string $status;
    private ?string $created_at;
    private ?string $updated_at;

    public function __construct(
        ?int $id = null,
        ?int $company_id = null,
        ?string $title = null,
        ?string $description = null,
        ?string $requirements = null,
        ?string $salary_offer = null,
        ?string $workload = null,
        ?string $work_schedule = null,
        ?string $shift = null,
        ?string $work_model = null,
        ?string $employment_type = null,
        ?string $location = null,
        ?string $benefits = null,
        ?string $status = "active",
        ?string $created_at = null,
        ?string $updated_at = null
    ) {
        $this->id = $id;
        $this->company_id = $company_id;
        $this->title = $title;
        $this->description = $description;
        $this->requirements = $requirements;
        $this->salary_offer = $salary_offer;
        $this->workload = $workload;
        $this->work_schedule = $work_schedule;
        $this->shift = $shift;
        $this->work_model = $work_model;
        $this->employment_type = $employment_type;
        $this->location = $location;
        $this->benefits = $benefits;
        $this->status = $status;
        $this->created_at = $created_at;
        $this->updated_at = $updated_at;

        $this->table = "vacancies";

        $this->fillable = [
            "companyId",
            "title",
            "description",
            "requirements",
            "salaryOffer",
            "workload",
            "workSchedule",
            "shift",
            "workModel",
            "employmentType",
            "location",
            "benefits",
            "status"
        ];
    }

    /**
     * Inclui a galeria ao serializar uma vaga individual.
     */
    public function jsonSerialize(): array
    {
        $data = parent::jsonSerialize();

        $data['images'] = $this->id !== null
            ? (new VacancyImage())->selectByVacancyId($this->id)
            : [];

        return $data;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): void
    {
        $this->id = $id;
    }

    public function getCompanyId(): ?int
    {
        return $this->company_id;
    }

    public function setCompanyId(?int $company_id): void
    {
        $this->company_id = $company_id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(?string $title): void
    {
        $this->title = $title;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): void
    {
        $this->description = $description;
    }

    public function getRequirements(): ?string
    {
        return $this->requirements;
    }

    public function setRequirements(?string $requirements): void
    {
        $this->requirements = $requirements;
    }

    public function getSalaryOffer(): ?string
    {
        return $this->salary_offer;
    }

    public function setSalaryOffer(?string $salary_offer): void
    {
        $this->salary_offer = $salary_offer;
    }

    public function getWorkload(): ?string
    {
        return $this->workload;
    }

    public function setWorkload(?string $workload): void
    {
        $this->workload = $workload;
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

    public function getLocation(): ?string
    {
        return $this->location;
    }

    public function setLocation(?string $location): void
    {
        $this->location = $location;
    }

    public function getBenefits(): ?string
    {
        return $this->benefits;
    }

    public function setBenefits(?string $benefits): void
    {
        $this->benefits = $benefits;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(?string $status): void
    {
        $this->status = $status;
    }

    public function getCreatedAt(): ?string
    {
        return $this->created_at;
    }

    public function setCreatedAt(?string $created_at): void
    {
        $this->created_at = $created_at;
    }

    public function getUpdatedAt(): ?string
    {
        return $this->updated_at;
    }

    public function setUpdatedAt(?string $updated_at): void
    {
        $this->updated_at = $updated_at;
    }

    public function selectActiveWithDetails(): array
    {
        return $this->selectWithDetails(
            'WHERE v.status = :status',
            [':status' => 'active']
        );
    }

    public function selectByCompanyWithDetails(int $companyId): array
    {
        if ($companyId < 1) {
            $this->errorMessage = 'ID da empresa inválido.';
            return [];
        }

        return $this->selectWithDetails(
            'WHERE v.company_id = :company_id',
            [':company_id' => $companyId]
        );
    }

    private function selectWithDetails(
        string $where,
        array $params
    ): array {

        try {

            $query = "
                SELECT
                    v.*,
                    c.company_name,
                    c.industry AS company_industry
                FROM {$this->table} v
                INNER JOIN companies c
                    ON c.id = v.company_id
                {$where}
                ORDER BY v.created_at DESC
            ";

            $stmt = Connect::getInstance()->prepare($query);
            $stmt->execute($params);

            $vacancies = $stmt->fetchAll();

            if ($vacancies === []) {
                $this->errorMessage = null;
                return [];
            }

            $placeholders = [];
            $vacancyIds = [];

            foreach ($vacancies as $index => $vacancy) {
                $placeholder = ':vacancy_' . $index;

                $placeholders[] = $placeholder;

                $vacancyIds[$placeholder] = (int) $vacancy->id;
            }

            // BUSCAR ÁREAS DAS VAGAS

            $areaQuery = "
                SELECT
                    va.vacancy_id,
                    va.area_id,
                    va.custom_area,
                    a.name AS area_name,
                    CASE
                        WHEN a.name = 'Outras'
                             AND va.custom_area IS NOT NULL
                             AND va.custom_area <> ''
                        THEN va.custom_area
                        ELSE a.name
                    END AS display_name
                FROM vacancy_areas va
                INNER JOIN areas a
                    ON a.id = va.area_id
                WHERE va.vacancy_id IN (
                    " . implode(', ', $placeholders) . "
                )
                ORDER BY a.name ASC
            ";

            $areaStmt = Connect::getInstance()->prepare($areaQuery);

            foreach ($vacancyIds as $placeholder => $id) {
                $areaStmt->bindValue(
                    $placeholder,
                    $id,
                    PDO::PARAM_INT
                );
            }

            $areaStmt->execute();

            $areasByVacancy = [];

            foreach ($areaStmt->fetchAll() as $area) {

                $vacancyId = (int) $area->vacancy_id;

                $areasByVacancy[$vacancyId][] = [
                    'area_id' => (int) $area->area_id,
                    'area_name' => $area->area_name,
                    'custom_area' => $area->custom_area,
                    'display_name' => $area->display_name
                ];
            }

            // BUSCAR IMAGENS DE TODAS AS VAGAS

            $imageModel = new VacancyImage();

            $imagesByVacancy = $imageModel->selectGroupedByVacancyIds(
                array_values($vacancyIds)
            );

            if ($imageModel->getErrorMessage() !== null) {
                throw new \RuntimeException(
                    'Não foi possível carregar as imagens das vagas.'
                );
            }

            // ASSOCIAR ÁREAS E IMAGENS A CADA VAGA

            foreach ($vacancies as $vacancy) {

                $vacancyId = (int) $vacancy->id;

                $vacancy->areas = $areasByVacancy[$vacancyId] ?? [];

                $vacancy->images = $imagesByVacancy[$vacancyId] ?? [];
            }

            $this->errorMessage = null;

            return $vacancies;

        } catch (\Throwable $exception) {

            $this->errorMessage = $exception->getMessage();

            return [];
        }
    }
}
