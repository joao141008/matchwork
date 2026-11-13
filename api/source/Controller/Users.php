<?php

namespace Source\Controller;

use Source\Models\User;
use Source\Models\Candidate;
use Source\Models\CandidateArea;
use Source\Models\Company;
use Source\Models\CompanyArea;
use Source\Support\ProfilePhotoUpload;
use RuntimeException;

class Users extends Api
{
    public function list(array $data = []): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, 'unauthorized', 'Acesso permitido somente para administradores.', 'error')->back();
            return;
        }

        $user = new User();
        $this->call(200, 'success', 'Lista de usuários.', 'success')->back($user->selectAllPublic());
    }

    public function listById(array $data): void
    {
        $userId = filter_var($data['userId'] ?? null, FILTER_VALIDATE_INT);
        if ($userId === false || $userId < 1) {
            $this->call(400, 'bad_request', 'ID do usuário inválido.', 'error')->back();
            return;
        }

        if (!$this->authToken([1, 2, 3, 4])) {
            $this->call(401, 'unauthorized', 'Usuário não autenticado.', 'error')->back();
            return;
        }

        if ($this->userAuthTypeId !== 1 && $this->userAuthId !== (int)$userId) {
            $this->call(403, 'forbidden', 'Você não pode visualizar os dados deste usuário.', 'error')->back();
            return;
        }

        $user = new User();
        $response = $user->selectPublicById((int)$userId);
        if (!$response) {
            $this->call(404, 'not_found', 'Usuário não encontrado.', 'error')->back();
            return;
        }

        $this->call(200, 'success', 'Usuário encontrado.', 'success')->back($response);
    }

    /**
     * Retorna somente as informações públicas de um candidato ou empresa.
     * Dados sensíveis como CPF, CNPJ, e-mail e senha nunca são expostos aqui.
     */
    public function publicProfile(array $data): void
    {
        if (!$this->authToken([1, 3, 4])) {
            $this->call(401, 'unauthorized', 'Usuário não autenticado.', 'error')->back();
            return;
        }

        $targetUserId = filter_var($data['userId'] ?? null, FILTER_VALIDATE_INT);
        if ($targetUserId === false || $targetUserId < 1) {
            $this->call(400, 'bad_request', 'ID do perfil inválido.', 'error')->back();
            return;
        }

        $user = new User();
        if (
            !$user->selectById((int)$targetUserId) ||
            (int)$user->getActive() !== 1 ||
            !in_array((int)$user->getTypeId(), [3, 4], true)
        ) {
            $this->call(404, 'not_found', 'Perfil não encontrado ou indisponível.', 'error')->back();
            return;
        }

        $profileData = [
            'user_id' => (int)$user->getId(),
            'type_id' => (int)$user->getTypeId(),
            'photo_url' => $this->formatPhotoUrl($user->getPhoto()),
            'profile' => []
        ];

        if ((int)$user->getTypeId() === 3) {
            $candidate = new Candidate();
            if (!$candidate->selectByUserId((int)$targetUserId)) {
                $this->call(404, 'not_found', 'Perfil do candidato não encontrado.', 'error')->back();
                return;
            }

            $profileData['profile'] = [
                'full_name' => $candidate->getFullName(),
                'location' => $candidate->getLocation(),
                'interest_area' => $candidate->getInterestArea(),
                'salary_expectation' => $candidate->getSalaryExpectation(),
                'shift' => $candidate->getShift(),
                'work_model' => $candidate->getWorkModel(),
                'employment_type' => $candidate->getEmploymentType(),
                'about' => $candidate->getAbout(),
                'areas' => (new CandidateArea())->selectByCandidateId((int)$candidate->getId())
            ];
        } else {
            $company = new Company();
            if (!$company->selectByUserId((int)$targetUserId)) {
                $this->call(404, 'not_found', 'Perfil da empresa não encontrado.', 'error')->back();
                return;
            }

            $profileData['profile'] = [
                'company_name' => $company->getCompanyName(),
                'location' => $company->getLocation(),
                'website' => $company->getWebsite(),
                'company_size' => $company->getCompanySize(),
                'industry' => $company->getIndustry(),
                'description' => $company->getDescription(),
                'areas' => (new CompanyArea())->selectByCompanyId((int)$company->getId())
            ];
        }

        $this->call(200, 'success', 'Perfil carregado com sucesso.', 'success')->back($profileData);
    }

    /**
     * Retorna os dados básicos do usuário autenticado, incluindo a URL pública da foto.
     */
    public function me(array $data = []): void
    {
        if (!$this->authToken([1, 2, 3, 4])) {
            $this->call(401, 'unauthorized', 'Usuário não autenticado.', 'error')->back();
            return;
        }

        $user = new User();

        if (!$user->selectById((int) $this->userAuthId)) {
            $this->call(404, 'not_found', 'Usuário não encontrado.', 'error')->back();
            return;
        }

        $profileData = [
            'id' => $user->getId(),
            'type_id' => $user->getTypeId(),
            'email' => $user->getEmail(),
            'photo' => $user->getPhoto(),
            'photo_url' => $this->formatPhotoUrl($user->getPhoto())
        ];

        if ((int) $user->getTypeId() === 3) {
            $candidate = new Candidate();
            if ($candidate->selectByUserId((int) $this->userAuthId)) {
                $profileData['candidate'] = [
                    'id' => $candidate->getId(),
                    'full_name' => $candidate->getFullName(),
                    'cpf' => $candidate->getCpf(),
                    'location' => $candidate->getLocation(),
                    'interest_area' => $candidate->getInterestArea(),
                    'salary_expectation' => $candidate->getSalaryExpectation(),
                    'work_schedule' => $candidate->getWorkSchedule(),
                    'shift' => $candidate->getShift(),
                    'work_model' => $candidate->getWorkModel(),
                    'employment_type' => $candidate->getEmploymentType(),
                    'about' => $candidate->getAbout(),
                    'areas' => (new CandidateArea())->selectByCandidateId((int) $candidate->getId())
                ];
            }
        } elseif ((int) $user->getTypeId() === 4) {
            $company = new Company();
            if ($company->selectByUserId((int) $this->userAuthId)) {
                $profileData['company'] = [
                    'id' => $company->getId(),
                    'company_name' => $company->getCompanyName(),
                    'cnpj' => $company->getCnpj(),
                    'location' => $company->getLocation(),
                    'website' => $company->getWebsite(),
                    'company_size' => $company->getCompanySize(),
                    'industry' => $company->getIndustry(),
                    'description' => $company->getDescription(),
                    'areas' => (new CompanyArea())->selectByCompanyId((int) $company->getId())
                ];
            }
        }

        $this->call(200, 'success', 'Dados do usuário carregados.', 'success')->back($profileData);
    }

    /**
     * Recebe uma foto multipart/form-data e salva seu caminho em users.photo.
     */
    public function uploadPhoto(array $data = []): void
    {
        if (!$this->authToken([1, 2, 3, 4])) {
            $this->call(401, 'unauthorized', 'Usuário não autenticado.', 'error')->back();
            return;
        }

        if (!isset($_FILES['photo']) || !is_array($_FILES['photo'])) {
            $this->call(400, 'bad_request', 'Selecione uma foto de perfil.', 'error')->back();
            return;
        }

        $user = new User();

        if (!$user->selectById((int) $this->userAuthId)) {
            $this->call(404, 'not_found', 'Usuário não encontrado.', 'error')->back();
            return;
        }

        $uploader = new ProfilePhotoUpload();

        try {
            $newPhotoPath = $uploader->store($_FILES['photo']);
        } catch (RuntimeException $exception) {
            $this->call(400, 'bad_request', $exception->getMessage(), 'error')->back();
            return;
        } catch (\Throwable $exception) {
            error_log('[MatchWork] Falha no upload da foto de perfil: ' . $exception->getMessage());
            $this->call(500, 'internal_server_error', 'Não foi possível armazenar a foto de perfil.', 'error')->back();
            return;
        }

        $oldPhotoPath = $user->getPhoto();
        $user->setPhoto($newPhotoPath);

        if (!$user->updateById((int) $this->userAuthId)) {
            $uploader->delete($newPhotoPath);
            $this->call(500, 'internal_server_error', 'Não foi possível salvar a foto no cadastro do usuário.', 'error')->back();
            return;
        }

        // A foto anterior só é removida depois da atualização bem-sucedida no banco.
        if ($oldPhotoPath && $oldPhotoPath !== $newPhotoPath) {
            $uploader->delete($oldPhotoPath);
        }

        $this->call(200, 'success', 'Foto de perfil atualizada com sucesso.', 'success')->back([
            'photo' => $newPhotoPath,
            'photo_url' => $this->formatPhotoUrl($newPhotoPath)
        ]);
    }

    /**
     * Converte o caminho armazenado no banco em uma URL pública da API.
     */
    private function formatPhotoUrl(?string $photoPath): ?string
    {
        if ($photoPath === null || trim($photoPath) === '') {
            return null;
        }

        $photoPath = trim($photoPath);

        // Compatibilidade com registros antigos que já armazenavam uma URL.
        if (
            preg_match('~^https?://~i', $photoPath) ||
            str_starts_with($photoPath, 'data:image/')
        ) {
            return $photoPath;
        }

        if (str_starts_with($photoPath, '/')) {
            return $photoPath;
        }

        $scriptDirectory = dirname(
            (string) ($_SERVER['SCRIPT_NAME'] ?? '/api/index.php')
        );

        $apiDirectory = rtrim(
            str_replace('\\', '/', $scriptDirectory),
            '/'
        );

        if ($apiDirectory === '' || $apiDirectory === '.') {
            $apiDirectory = '/api';
        }

        if ($apiDirectory[0] !== '/') {
            $apiDirectory = '/' . $apiDirectory;
        }

        $normalizedPath = ltrim(
            str_replace('\\', '/', $photoPath),
            '/'
        );

        return $apiDirectory . '/' . $normalizedPath;
    }

    public function register(array $data): void
    {
        $email = trim((string)($data['email'] ?? ''));
        $password = (string)($data['password'] ?? '');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->call(400, 'bad_request', 'Informe um e-mail válido.', 'error')->back();
            return;
        }

        if (strlen($password) < 6) {
            $this->call(400, 'bad_request', 'A senha deve conter pelo menos 6 caracteres.', 'error')->back();
            return;
        }

        $user = new User(null, 2, $email, $password);
        if (!$user->insert()) {
            $statusCode = str_contains((string)$user->getErrorMessage(), 'já cadastrado') ? 409 : 500;
            $this->call($statusCode, $statusCode === 409 ? 'conflict' : 'internal_server_error', $user->getErrorMessage(), 'error')->back();
            return;
        }

        $this->call(201, 'success', 'Usuário cadastrado com sucesso.', 'created')->back([
            'id' => $user->getId(),
            'email' => $user->getEmail()
        ]);
    }

    /** Cadastro administrativo exige uma sessão de administrador existente. */
    public function registerAdmin(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, 'unauthorized', 'Somente administradores podem cadastrar outros administradores.', 'error')->back();
            return;
        }

        $email = trim((string)($data['email'] ?? ''));
        $password = (string)($data['password'] ?? '');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->call(400, 'bad_request', 'Informe um e-mail válido.', 'error')->back();
            return;
        }

        if (strlen($password) < 6) {
            $this->call(400, 'bad_request', 'A senha deve conter pelo menos 6 caracteres.', 'error')->back();
            return;
        }

        $user = new User(null, 1, $email, $password);
        if (!$user->insert()) {
            $statusCode = str_contains((string)$user->getErrorMessage(), 'já cadastrado') ? 409 : 500;
            $this->call($statusCode, $statusCode === 409 ? 'conflict' : 'internal_server_error', $user->getErrorMessage(), 'error')->back();
            return;
        }

        $this->call(201, 'success', 'Administrador cadastrado com sucesso.', 'created')->back([
            'id' => $user->getId(),
            'email' => $user->getEmail()
        ]);
    }

    public function auth(array $data): void
    {
        $this->login($data, null);
    }

    public function authAdmin(array $data): void
    {
        $this->login($data, [1]);
    }

    private function login(array $data, ?array $allowedTypes): void
    {
        $email = trim((string)($data['email'] ?? ''));
        $password = (string)($data['password'] ?? '');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
            $this->call(400, 'bad_request', 'E-mail e senha válidos são obrigatórios.', 'error')->back();
            return;
        }

        $user = new User();
        if (!$user->login($email, $password, $allowedTypes)) {
            $this->call(401, 'unauthorized', $user->getErrorMessage() ?? 'Credenciais inválidas.', 'error')->back();
            return;
        }

        $this->call(200, 'success', 'Login realizado com sucesso.', 'success')->back([
            'id' => $user->getId(),
            'type_id' => $user->getTypeId(),
            'photo' => $user->getPhoto(),
            'photo_url' => $this->formatPhotoUrl($user->getPhoto()),
            'token' => $user->getToken()
        ]);
    }

    public function update(array $data): void
    {
        if (!$this->authToken([2, 3, 4])) {
            $this->call(401, 'unauthorized', 'Usuário não autenticado.', 'error')->back();
            return;
        }

        $this->updateAuthenticatedUser($data);
    }

    public function updateAdmin(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, 'unauthorized', 'Somente administradores podem realizar esta operação.', 'error')->back();
            return;
        }

        $this->updateAuthenticatedUser($data);
    }

    private function updateAuthenticatedUser(array $data): void
    {
        if (!array_key_exists('email', $data)
            && !array_key_exists('password', $data)
            && !array_key_exists('photo', $data)) {
            $this->call(400, 'bad_request', 'Informe ao menos um campo para atualizar.', 'error')->back();
            return;
        }

        foreach (['email', 'password'] as $field) {
            if (array_key_exists($field, $data) && !is_string($data[$field])) {
                $this->call(400, 'bad_request', "O campo {$field} deve ser um texto.", 'error')->back();
                return;
            }
        }

        $user = new User();
        if (!$user->selectById($this->userAuthId)) {
            $this->call(404, 'not_found', 'Usuário não encontrado.', 'error')->back();
            return;
        }

        if (isset($data['email'])) {
            $email = trim((string)$data['email']);

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $this->call(400, 'bad_request', 'E-mail inválido.', 'error')->back();
                return;
            }

            if ($email !== $user->getEmail()) {
                $check = new User();
                $check->setEmail($email);

                if ($check->emailExists($this->userAuthId)) {
                    $this->call(409, 'conflict', 'E-mail já cadastrado.', 'error')->back();
                    return;
                }
            }

            $user->setEmail($email);
        }

        if (isset($data['password'])) {
            $password = (string)$data['password'];

            if (strlen($password) < 6) {
                $this->call(400, 'bad_request', 'A senha deve conter pelo menos 6 caracteres.', 'error')->back();
                return;
            }

            $user->setPassword(password_hash($password, PASSWORD_DEFAULT));
        }

        if (array_key_exists('photo', $data)) {
            if ($data['photo'] !== null && !is_string($data['photo'])) {
                $this->call(400, 'bad_request', 'A foto deve ser informada como texto ou null.', 'error')->back();
                return;
            }

            $user->setPhoto($data['photo']);
        }

        $nullableFields = array_key_exists('photo', $data) && $data['photo'] === null ? ['photo'] : [];

        if (!$user->updateById($this->userAuthId, $nullableFields)) {
            $this->call(500, 'internal_server_error', 'Não foi possível atualizar o usuário.', 'error')->back();
            return;
        }

        $newToken = (new \Source\Core\JWTToken())->encode([
            'id' => $this->userAuthId,
            'email' => $user->getEmail(),
            'type_id' => $user->getTypeId()
        ]);

        $this->call(200, 'success', 'Usuário atualizado com sucesso.', 'success')->back([
            'token' => $newToken,
            'email' => $user->getEmail()
        ]);
    }

    public function deleteUser(array $data): void
    {
        if (!$this->authToken([1, 2, 3, 4])) {
            $this->call(401, 'unauthorized', 'Usuário não autenticado.', 'error')->back();
            return;
        }

        $targetId = filter_var($data['userId'] ?? null, FILTER_VALIDATE_INT);
        if ($targetId === false || $targetId < 1) {
            $this->call(400, 'bad_request', 'ID do usuário inválido.', 'error')->back();
            return;
        }

        if ($this->userAuthTypeId !== 1 && $this->userAuthId !== (int)$targetId) {
            $this->call(403, 'forbidden', 'Você só pode desativar a própria conta.', 'error')->back();
            return;
        }

        $user = new User();
        if (!$user->deactivateById((int)$targetId)) {
            $this->call(404, 'not_found', 'Não foi possível desativar o usuário solicitado.', 'error')->back();
            return;
        }

        $this->call(200, 'success', 'Conta desativada com sucesso.', 'success')->back();
    }
}
