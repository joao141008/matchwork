<?php

namespace Source\Controller;

use Source\Models\Company;
use Source\Models\CompanyArea;
use Source\Models\User;

class Companies extends Api
{
    private const COMPANY_SIZES = [
        'Microempresa',
        'Pequena empresa',
        'Média empresa',
        'Grande empresa'
    ];

    public function companiesList(array $data): void
    {
        if (!$this->authToken([1, 3])) {
            $this->call(401, 'unauthorized', 'Usuário não autenticado ou sem permissão.', 'error')->back();
            return;
        }

        $company = new Company();

        $this->call(200, 'success', 'Lista de empresas.', 'success')
            ->back($company->selectAll());
    }

    public function companiesListById(array $data): void
    {
        $companyId = filter_var(
            $data['companyId'] ?? null,
            FILTER_VALIDATE_INT
        );

        if ($companyId === false || $companyId < 1) {
            $this->call(400, 'bad_request', 'ID da empresa inválido.', 'error')->back();
            return;
        }

        if (!$this->authToken([1, 3, 4])) {
            $this->call(401, 'unauthorized', 'Usuário não autenticado ou sem permissão.', 'error')->back();
            return;
        }

        $company = new Company();

        if (!$company->selectById((int)$companyId)) {
            $this->call(404, 'not_found', 'Empresa não encontrada.', 'error')->back();
            return;
        }

        if (
            $this->userAuthTypeId === 4 &&
            (int)$company->getUserId() !== $this->userAuthId
        ) {
            $this->call(403, 'forbidden', 'Você não pode visualizar os dados desta empresa.', 'error')->back();
            return;
        }

        $this->call(200, 'success', 'Empresa encontrada.', 'success')
            ->back($company);
    }

    public function register(array $data): void
    {
        if (!$this->authToken(2)) {
            $this->call(401, 'unauthorized', 'Usuário não autenticado ou sem permissão.', 'error')->back();
            return;
        }

        // CAMPOS OBRIGATÓRIOS

        foreach ([
            'company_name' => 'Nome da empresa',
            'cnpj' => 'CNPJ',
            'industry' => 'Setor/área de atuação'
        ] as $field => $label) {

            if (
                !isset($data[$field]) ||
                !is_string($data[$field]) ||
                trim($data[$field]) === ''
            ) {
                $this->call(400, 'bad_request', "{$label} é obrigatório.", 'error')->back();
                return;
            }
        }

        // LIMITES DOS CAMPOS

        if (strlen(trim($data['company_name'])) > 255) {
            $this->call(400, 'bad_request', 'O nome da empresa deve ter no máximo 255 caracteres.', 'error')->back();
            return;
        }

        if (strlen(trim($data['cnpj'])) > 18) {
            $this->call(400, 'bad_request', 'O CNPJ deve ter no máximo 18 caracteres.', 'error')->back();
            return;
        }

        if (strlen(trim($data['industry'])) > 255) {
            $this->call(400, 'bad_request', 'O resumo das áreas de atuação deve ter no máximo 255 caracteres.', 'error')->back();
            return;
        }

        // VALIDAR CAMPOS OPCIONAIS

        foreach ([
            'location',
            'description',
            'website',
            'company_size'
        ] as $field) {

            if (
                array_key_exists($field, $data) &&
                $data[$field] !== null &&
                !is_string($data[$field])
            ) {
                $this->call(400, 'bad_request', "O campo {$field} deve ser um texto.", 'error')->back();
                return;
            }
        }

        $website = $this->normalizeOptionalText(
            $data['website'] ?? null
        );

        $companySize = $this->normalizeOptionalText(
            $data['company_size'] ?? null
        );

        // VALIDAR SITE

        if (!$this->isValidWebsite($website)) {
            $this->call(
                400,
                'bad_request',
                'Informe um site válido, começando com http:// ou https://.',
                'error'
            )->back();

            return;
        }

        // VALIDAR PORTE

        if (!$this->isValidCompanySize($companySize)) {
            $this->call(
                400,
                'bad_request',
                'Selecione um porte de empresa válido.',
                'error'
            )->back();

            return;
        }

        // VALIDAR ÁREAS

        if (
            !isset($data['areas']) ||
            !is_array($data['areas']) ||
            count($data['areas']) === 0
        ) {
            $this->call(
                400,
                'bad_request',
                'Adicione pelo menos uma área de atuação.',
                'error'
            )->back();

            return;
        }

        // VERIFICAR USUÁRIO

        $user = new User();

        if (!$user->selectById($this->userAuthId)) {
            $this->call(404, 'not_found', 'Usuário não encontrado.', 'error')->back();
            return;
        }

        // VERIFICAR SE JÁ EXISTE CADASTRO

        $existingCompany = new Company();

        if ($existingCompany->selectByUserId($this->userAuthId)) {
            $this->call(409, 'conflict', 'Este usuário já possui um cadastro de empresa.', 'error')->back();
            return;
        }

        // CONSTRUIR EMPRESA

        $company = new Company(
            null,
            $this->userAuthId,
            trim($data['company_name']),
            trim($data['cnpj']),
            $this->normalizeOptionalText($data['location'] ?? null),
            trim($data['industry']),
            $this->normalizeOptionalText($data['description'] ?? null),
            $website,
            $companySize
        );

        // VERIFICAR CNPJ DUPLICADO

        if ($company->cnpjExists()) {
            $this->call(409, 'conflict', 'CNPJ já cadastrado.', 'error')->back();
            return;
        }

        // INSERIR EMPRESA

        if (!$company->insert()) {
            $this->call(
                500,
                'internal_server_error',
                'Não foi possível cadastrar a empresa.',
                'error'
            )->back();

            return;
        }

        // SALVAR ÁREAS DE ATUAÇÃO

        if (!$this->saveAreas($data['areas'], (int)$company->getId())) {
            $company->deleteById((int)$company->getId());

            $this->call(
                400,
                'bad_request',
                'Não foi possível cadastrar as áreas informadas. Confira os IDs e a área personalizada.',
                'error'
            )->back();

            return;
        }

        // ATUALIZAR TIPO DO USUÁRIO

        $user->setTypeId(4);

        if (!$user->updateById($this->userAuthId)) {
            $company->deleteById((int)$company->getId());

            $this->call(
                500,
                'internal_server_error',
                'Não foi possível concluir a ativação do cadastro da empresa.',
                'error'
            )->back();

            return;
        }

        // RETORNAR DADOS CADASTRADOS

        $this->call(
            201,
            'success',
            'Empresa cadastrada com sucesso.',
            'created'
        )->back([
            'user_id' => $user->getId(),
            'company_id' => $company->getId(),
            'company_name' => $company->getCompanyName(),
            'cnpj' => $company->getCnpj(),
            'location' => $company->getLocation(),
            'website' => $company->getWebsite(),
            'company_size' => $company->getCompanySize(),
            'industry' => $company->getIndustry(),
            'description' => $company->getDescription(),
            'areas' => (new CompanyArea())->selectByCompanyId(
                (int)$company->getId()
            )
        ]);
    }

    public function update(array $data): void
    {
        if (!$this->authToken(4)) {
            $this->call(401, 'unauthorized', 'Usuário não autenticado ou sem permissão.', 'error')->back();
            return;
        }

        if (!array_key_exists('areas', $data) && array_key_exists('areas_present', $data)) {
            $data['areas'] = [];
        }

        if (array_key_exists('areas', $data) && !is_array($data['areas'])) {
            $this->call(400, 'bad_request', 'O campo areas deve ser uma lista.', 'error')->back();
            return;
        }

        // BUSCAR EMPRESA

        $company = new Company();

        if (!$company->selectByUserId($this->userAuthId)) {
            $this->call(404, 'not_found', 'Empresa não encontrada.', 'error')->back();
            return;
        }

        // VALIDAR TIPOS DOS CAMPOS

        $textFields = [
            'company_name',
            'cnpj',
            'location',
            'website',
            'company_size',
            'industry',
            'description'
        ];

        foreach ($textFields as $field) {
            if (
                array_key_exists($field, $data) &&
                $data[$field] !== null &&
                !is_string($data[$field])
            ) {
                $this->call(400, 'bad_request', "O campo {$field} deve ser um texto.", 'error')->back();
                return;
            }
        }

        // CAMPOS QUE NÃO PODEM FICAR VAZIOS

        foreach (['company_name', 'cnpj', 'industry'] as $requiredField) {
            if (
                array_key_exists($requiredField, $data) &&
                trim((string)$data[$requiredField]) === ''
            ) {
                $this->call(400, 'bad_request', "O campo {$requiredField} não pode ficar vazio.", 'error')->back();
                return;
            }
        }

        // LIMITES DOS CAMPOS

        if (
            array_key_exists('company_name', $data) &&
            strlen(trim($data['company_name'])) > 255
        ) {
            $this->call(400, 'bad_request', 'O nome da empresa deve ter no máximo 255 caracteres.', 'error')->back();
            return;
        }

        if (
            array_key_exists('cnpj', $data) &&
            strlen(trim($data['cnpj'])) > 18
        ) {
            $this->call(400, 'bad_request', 'O CNPJ deve ter no máximo 18 caracteres.', 'error')->back();
            return;
        }

        if (
            array_key_exists('industry', $data) &&
            strlen(trim($data['industry'])) > 255
        ) {
            $this->call(400, 'bad_request', 'O resumo das áreas de atuação deve ter no máximo 255 caracteres.', 'error')->back();
            return;
        }

        // VALIDAR SITE

        if (array_key_exists('website', $data)) {
            $websiteToValidate = $this->normalizeOptionalText($data['website']);

            if (!$this->isValidWebsite($websiteToValidate)) {
                $this->call(
                    400,
                    'bad_request',
                    'Informe um site válido, começando com http:// ou https://.',
                    'error'
                )->back();

                return;
            }
        }

        // VALIDAR PORTE

        if (array_key_exists('company_size', $data)) {
            $sizeToValidate = $this->normalizeOptionalText($data['company_size']);

            if (!$this->isValidCompanySize($sizeToValidate)) {
                $this->call(
                    400,
                    'bad_request',
                    'Selecione um porte de empresa válido.',
                    'error'
                )->back();

                return;
            }
        }

        // VERIFICAR CNPJ DUPLICADO

        if (array_key_exists('cnpj', $data)) {
            $newCnpj = trim($data['cnpj']);

            if ($newCnpj !== $company->getCnpj()) {
                $check = new Company();
                $check->setCnpj($newCnpj);

                if ($check->cnpjExists()) {
                    $this->call(409, 'conflict', 'CNPJ já cadastrado.', 'error')->back();
                    return;
                }
            }
        }

        // MAPEAR CAMPOS PARA OS SETTERS DO MODEL

        $fields = [
            'company_name' => 'setCompanyName',
            'cnpj' => 'setCnpj',
            'location' => 'setLocation',
            'website' => 'setWebsite',
            'company_size' => 'setCompanySize',
            'industry' => 'setIndustry',
            'description' => 'setDescription'
        ];

        // O Model espera nomes camelCase para atualizar campos NULL.

        $nullableFieldMap = [
            'location' => 'location',
            'website' => 'website',
            'company_size' => 'companySize',
            'description' => 'description'
        ];

        $nullableFields = [];
        $hasCompanyFields = false;

        foreach ($fields as $field => $setter) {
            if (!array_key_exists($field, $data)) {
                continue;
            }

            $value = $data[$field];

            if (is_string($value)) {
                $value = trim($value);
            }

            // Site e porte podem ser removidos.

            if (
                in_array($field, ['website', 'company_size'], true) &&
                $value === ''
            ) {
                $value = null;
            }

            $company->{$setter}($value);
            $hasCompanyFields = true;

            if ($value === null && isset($nullableFieldMap[$field])) {
                $nullableFields[] = $nullableFieldMap[$field];
            }
        }

        if (!$hasCompanyFields && !array_key_exists('areas', $data)) {
            $this->call(
                400,
                'bad_request',
                'Informe ao menos um campo para atualizar.',
                'error'
            )->back();

            return;
        }

        // ATUALIZAR EMPRESA

        if (
            $hasCompanyFields &&
            !$company->updateById((int)$company->getId(), $nullableFields)
        ) {
            $this->call(
                500,
                'internal_server_error',
                'Não foi possível atualizar o cadastro da empresa.',
                'error'
            )->back();

            return;
        }

        // ATUALIZAR ÁREAS

        if (
            array_key_exists('areas', $data) &&
            !$this->saveAreas($data['areas'], (int)$company->getId())
        ) {
            $this->call(
                400,
                'bad_request',
                'Não foi possível atualizar as áreas informadas.',
                'error'
            )->back();

            return;
        }

        $this->call(200, 'success', 'Empresa atualizada com sucesso.', 'success')
            ->back([
                'company_id' => $company->getId(),
                'company_name' => $company->getCompanyName(),
                'cnpj' => $company->getCnpj(),
                'location' => $company->getLocation(),
                'website' => $company->getWebsite(),
                'company_size' => $company->getCompanySize(),
                'industry' => $company->getIndustry(),
                'description' => $company->getDescription()
            ]);
    }

    public function delete(): void
    {
        if (!$this->authToken(4)) {
            $this->call(401, 'unauthorized', 'Usuário não autenticado ou sem permissão.', 'error')->back();
            return;
        }

        $user = new User();

        if (!$user->deactivateById($this->userAuthId)) {
            $this->call(
                500,
                'internal_server_error',
                'Não foi possível desativar a conta da empresa.',
                'error'
            )->back();

            return;
        }

        $this->call(200, 'success', 'Conta da empresa desativada com sucesso.', 'success')->back();
    }

    private function saveAreas(array $areas, int $companyId): bool
    {
        return (new CompanyArea())->replaceForCompanyId($companyId, $areas);
    }

    private function normalizeOptionalText(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $value = trim($value);

        return $value === '' ? null : $value;
    }

    private function isValidWebsite(?string $website): bool
    {
        if ($website === null) {
            return true;
        }

        if (
            strlen($website) > 255 ||
            filter_var($website, FILTER_VALIDATE_URL) === false
        ) {
            return false;
        }

        $scheme = strtolower(
            (string)parse_url($website, PHP_URL_SCHEME)
        );

        return in_array($scheme, ['http', 'https'], true);
    }

    private function isValidCompanySize(?string $companySize): bool
    {
        return $companySize === null ||
            in_array($companySize, self::COMPANY_SIZES, true);
    }
}
