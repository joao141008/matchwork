<?php

namespace Source\Controller;

use Source\Models\Company;
use Source\Models\Vacancy;
use Source\Models\VacancyArea;

class Vacancies extends Api
{
    public function vacanciesList(array $data): void
    {
        if (!$this->authToken([1, 3])) {
            $this->call(401, "unauthorized", "Usuário não autenticado ou sem permissão.", "error")->back(null);
            return;
        }

        $vacancy = new Vacancy();

        if ($this->userAuthTypeId === 1) {
            $response = $vacancy->selectAll([], "created_at", "DESC");
        } else {
            $response = $vacancy->selectActiveWithDetails();
        }

        if ($vacancy->getErrorMessage() !== null) {
            $this->call(500, "internal_server_error", "Não foi possível carregar as vagas.", "error")->back(null);
            return;
        }

        $this->call(200, "success", "Lista de vagas", "success")->back($response);
    }

    public function vacanciesListById(array $data): void
    {
        if (!isset($data["vacancyId"]) || !filter_var($data["vacancyId"], FILTER_VALIDATE_INT)) {
            $this->call(400, "bad_request", "ID da vaga é obrigatório e deve ser um número inteiro", "error")->back(null);
            return;
        }

        if (!$this->authToken([1, 3, 4])) {
            $this->call(401, "unauthorized", "Usuário não autenticado ou sem permissão.", "error")->back(null);
            return;
        }

        $vacancy = new Vacancy();

        if (!$vacancy->selectById((int)$data["vacancyId"])) {
            $this->call(404, "not_found", "Vaga não encontrada", "error")->back(null);
            return;
        }

        if ($this->userAuthTypeId === 3 && $vacancy->getStatus() !== "active") {
            $this->call(404, "not_found", "Vaga não encontrada", "error")->back(null);
            return;
        }

        if ($this->userAuthTypeId === 4) {
            $company = new Company();

            if (!$company->selectByUserId($this->userAuthId) || (int)$company->getId() !== (int)$vacancy->getCompanyId()) {
                $this->call(403, "forbidden", "Você não tem permissão para visualizar esta vaga.", "error")->back(null);
                return;
            }
        }

        $this->call(200, "success", "Vaga encontrada", "success")->back($vacancy);
    }

    public function vacanciesListByCompany(array $data): void
    {
        if (!$this->authToken([1, 4])) {
            $this->call(401, "unauthorized", "Usuário não autenticado ou sem permissão.", "error")->back(null);
            return;
        }

        $company = new Company();

        if ($this->userAuthTypeId === 4) {
            if (!$company->selectByUserId($this->userAuthId)) {
                $this->call(404, "not_found", "Empresa não encontrada", "error")->back(null);
                return;
            }

            $companyId = (int)$company->getId();
        } else {
            $companyId = filter_var($data["companyId"] ?? null, FILTER_VALIDATE_INT);

            if ($companyId === false || $companyId < 1 || !$company->selectById((int)$companyId)) {
                $this->call(400, "bad_request", "ID da empresa inválido.", "error")->back(null);
                return;
            }
        }

        $vacancy = new Vacancy();
        $response = $vacancy->selectByCompanyWithDetails((int)$companyId);

        if ($vacancy->getErrorMessage() !== null) {
            $this->call(500, "internal_server_error", "Não foi possível carregar as vagas da empresa.", "error")->back(null);
            return;
        }

        $this->call(200, "success", "Lista de vagas da empresa", "success")->back($response);
    }

    public function insert(array $data): void
    {
        if (!$this->authToken(4)) {
            $this->call(401, "unauthorized", "Somente empresas autenticadas podem cadastrar vagas.", "error")->back(null);
            return;
        }

        if (
            !isset($data["title"]) ||
            !isset($data["description"]) ||
            !isset($data["areas"]) ||
            !is_array($data["areas"]) ||
            $data["areas"] === [] ||
            !is_scalar($data["title"]) ||
            !is_scalar($data["description"]) ||
            trim((string)$data["title"]) === "" ||
            trim((string)$data["description"]) === ""
        ) {
            $this->call(400, "bad_request", "Título, descrição e ao menos uma área válida são obrigatórios.", "error")->back(null);
            return;
        }

        $fields = [
            "requirements", "salary_offer", "workload", "work_schedule",
            "shift", "work_model", "employment_type", "location", "benefits"
        ];

        foreach ($fields as $field) {
            if (array_key_exists($field, $data) && $data[$field] !== null && !is_scalar($data[$field])) {
                $this->call(400, "bad_request", "O campo {$field} possui formato inválido.", "error")->back(null);
                return;
            }
        }

        $company = new Company();

        if (!$company->selectByUserId($this->userAuthId)) {
            $this->call(404, "not_found", "Cadastro da empresa não encontrado.", "error")->back(null);
            return;
        }

        $vacancy = new Vacancy(
            null,
            (int)$company->getId(),
            trim((string)$data["title"]),
            trim((string)$data["description"]),
            isset($data["requirements"]) ? trim((string)$data["requirements"]) : null,
            isset($data["salary_offer"]) ? trim((string)$data["salary_offer"]) : null,
            isset($data["workload"]) ? trim((string)$data["workload"]) : null,
            isset($data["work_schedule"]) ? trim((string)$data["work_schedule"]) : null,
            isset($data["shift"]) ? trim((string)$data["shift"]) : null,
            isset($data["work_model"]) ? trim((string)$data["work_model"]) : null,
            isset($data["employment_type"]) ? trim((string)$data["employment_type"]) : null,
            isset($data["location"]) ? trim((string)$data["location"]) : null,
            isset($data["benefits"]) ? trim((string)$data["benefits"]) : null,
            "active"
        );

        if (!$vacancy->insert()) {
            $this->call(500, "internal_server_error", "Não foi possível cadastrar a vaga.", "error")->back(null);
            return;
        }

        if (!$this->saveAreas($data["areas"], (int)$vacancy->getId())) {
            $vacancy->deleteById((int)$vacancy->getId());
            $this->call(400, "bad_request", "Não foi possível cadastrar as áreas da vaga. Confira os IDs e a área personalizada.", "error")->back(null);
            return;
        }

        $this->call(201, "created", "Vaga cadastrada com sucesso", "success")->back([
            "id" => $vacancy->getId(),
            "company_id" => $vacancy->getCompanyId(),
            "title" => $vacancy->getTitle(),
            "description" => $vacancy->getDescription(),
            "requirements" => $vacancy->getRequirements(),
            "salary_offer" => $vacancy->getSalaryOffer(),
            "workload" => $vacancy->getWorkload(),
            "work_schedule" => $vacancy->getWorkSchedule(),
            "shift" => $vacancy->getShift(),
            "work_model" => $vacancy->getWorkModel(),
            "employment_type" => $vacancy->getEmploymentType(),
            "location" => $vacancy->getLocation(),
            "benefits" => $vacancy->getBenefits(),
            "status" => $vacancy->getStatus(),
            "areas" => (new VacancyArea())->selectAll(
                ["vacancy_id = :vacancy_id"],
                "id",
                "ASC",
                [":vacancy_id" => (int)$vacancy->getId()]
            )
        ]);
    }

    public function update(array $data): void
    {
        $vacancyId = filter_var($data["vacancyId"] ?? null, FILTER_VALIDATE_INT);

        if ($vacancyId === false || $vacancyId < 1) {
            $this->call(400, "bad_request", "ID da vaga inválido.", "error")->back(null);
            return;
        }

        if (!$this->authToken(4)) {
            $this->call(401, "unauthorized", "Somente empresas autenticadas podem atualizar vagas.", "error")->back(null);
            return;
        }

        $company = new Company();

        if (!$company->selectByUserId($this->userAuthId)) {
            $this->call(404, "not_found", "Cadastro da empresa não encontrado.", "error")->back(null);
            return;
        }

        $vacancy = new Vacancy();

        if (!$vacancy->selectById((int)$vacancyId)) {
            $this->call(404, "not_found", "Vaga não encontrada.", "error")->back(null);
            return;
        }

        if ((int)$vacancy->getCompanyId() !== (int)$company->getId()) {
            $this->call(403, "forbidden", "Você não tem permissão para atualizar esta vaga.", "error")->back(null);
            return;
        }

        $fields = [
            "title" => "setTitle",
            "description" => "setDescription",
            "requirements" => "setRequirements",
            "salary_offer" => "setSalaryOffer",
            "workload" => "setWorkload",
            "work_schedule" => "setWorkSchedule",
            "shift" => "setShift",
            "work_model" => "setWorkModel",
            "employment_type" => "setEmploymentType",
            "location" => "setLocation",
            "benefits" => "setBenefits",
            "status" => "setStatus"
        ];

        $nullableFields = [];
        $hasVacancyFields = false;

        $nullableMap = [
            "requirements" => "requirements",
            "salary_offer" => "salaryOffer",
            "workload" => "workload",
            "work_schedule" => "workSchedule",
            "shift" => "shift",
            "work_model" => "workModel",
            "employment_type" => "employmentType",
            "location" => "location",
            "benefits" => "benefits"
        ];

        foreach ($fields as $field => $setter) {
            if (!array_key_exists($field, $data)) {
                continue;
            }

            if ($data[$field] !== null && !is_scalar($data[$field])) {
                $this->call(400, "bad_request", "O campo {$field} possui formato inválido.", "error")->back(null);
                return;
            }

            if (
                in_array($field, ["title", "description"], true) &&
                ($data[$field] === null || trim((string)$data[$field]) === "")
            ) {
                $this->call(400, "bad_request", "O campo {$field} não pode ficar vazio.", "error")->back(null);
                return;
            }

            if (
                $field === "status" &&
                !in_array($data[$field], ["active", "paused", "closed"], true)
            ) {
                $this->call(400, "bad_request", "Status inválido. Utilize active, paused ou closed.", "error")->back(null);
                return;
            }

            $value = $data[$field] === null
                ? null
                : trim((string)$data[$field]);

            if ($value === "" && isset($nullableMap[$field])) {
                $value = null;
            }

            $vacancy->{$setter}($value);
            $hasVacancyFields = true;

            if ($value === null && isset($nullableMap[$field])) {
                $nullableFields[] = $nullableMap[$field];
            }
        }

        if (
            array_key_exists("areas", $data) &&
            (!is_array($data["areas"]) || $data["areas"] === [])
        ) {
            $this->call(400, "bad_request", "Informe ao menos uma área válida para a vaga.", "error")->back(null);
            return;
        }

        if (!$hasVacancyFields && !array_key_exists("areas", $data)) {
            $this->call(400, "bad_request", "Informe ao menos um campo para atualizar.", "error")->back(null);
            return;
        }

        if (
            $hasVacancyFields &&
            !$vacancy->updateById((int)$vacancyId, $nullableFields)
        ) {
            $this->call(500, "internal_server_error", "Não foi possível atualizar a vaga.", "error")->back(null);
            return;
        }

        if (
            array_key_exists("areas", $data) &&
            !$this->saveAreas($data["areas"], (int)$vacancyId)
        ) {
            $this->call(400, "bad_request", "Não foi possível atualizar as áreas da vaga.", "error")->back(null);
            return;
        }

        $this->call(200, "success", "Vaga atualizada com sucesso.", "success")->back($vacancy);
    }

    public function delete(array $data): void
    {
        $vacancyId = filter_var($data["vacancyId"] ?? null, FILTER_VALIDATE_INT);

        if ($vacancyId === false || $vacancyId < 1) {
            $this->call(400, "bad_request", "ID da vaga inválido.", "error")->back(null);
            return;
        }

        if (!$this->authToken(4)) {
            $this->call(401, "unauthorized", "Somente empresas autenticadas podem encerrar vagas.", "error")->back(null);
            return;
        }

        $company = new Company();

        if (!$company->selectByUserId($this->userAuthId)) {
            $this->call(404, "not_found", "Cadastro da empresa não encontrado.", "error")->back(null);
            return;
        }

        $vacancy = new Vacancy();

        if (!$vacancy->selectById((int)$vacancyId)) {
            $this->call(404, "not_found", "Vaga não encontrada.", "error")->back(null);
            return;
        }

        if ((int)$vacancy->getCompanyId() !== (int)$company->getId()) {
            $this->call(403, "forbidden", "Você não tem permissão para encerrar esta vaga.", "error")->back(null);
            return;
        }

        $vacancy->setStatus("closed");

        if (!$vacancy->updateById((int)$vacancyId)) {
            $this->call(500, "internal_server_error", "Não foi possível encerrar a vaga.", "error")->back(null);
            return;
        }

        $this->call(200, "success", "Vaga encerrada com sucesso.", "success")->back(null);
    }

    private function saveAreas(array $areas, int $vacancyId): bool
    {
        return (new VacancyArea())->replaceForVacancyId($vacancyId, $areas);
    }
}
