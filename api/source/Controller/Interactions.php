<?php

namespace Source\Controller;

use Source\Models\Candidate;
use Source\Models\CandidateArea;
use Source\Models\Company;
use Source\Models\CompanyLike;
use Source\Models\Vacancy;
use Source\Models\VacancyArea;
use Source\Models\VacancyLike;
use Source\Models\User;
use Source\Models\UserMatch;

class Interactions extends Api
{
    /**
     * Registra o interesse de um candidato em uma vaga.
     */
    public function registerCandidateLike(array $data): void
    {
        if (!$this->authToken(3)) {
            $this->call(401, 'unauthorized', 'Somente candidatos autenticados podem demonstrar interesse em vagas.', 'error')->back();
            return;
        }

        $vacancyId = filter_var($data['vacancy_id'] ?? null, FILTER_VALIDATE_INT);
        if ($vacancyId === false || $vacancyId < 1) {
            $this->call(400, 'bad_request', 'Informe um vacancy_id válido.', 'error')->back();
            return;
        }

        $candidate = new Candidate();
        if (!$candidate->selectByUserId($this->userAuthId)) {
            $this->call(404, 'not_found', 'Cadastro do candidato não encontrado.', 'error')->back();
            return;
        }

        $vacancy = new Vacancy();
        if (!$vacancy->selectById((int)$vacancyId)) {
            $this->call(404, 'not_found', 'Vaga não encontrada.', 'error')->back();
            return;
        }

        if ($vacancy->getStatus() !== 'active') {
            $this->call(409, 'conflict', 'Não é possível demonstrar interesse em uma vaga que não está ativa.', 'error')->back();
            return;
        }

        $company = new Company();
        if (!$company->selectById((int)$vacancy->getCompanyId())) {
            $this->call(404, 'not_found', 'Empresa responsável pela vaga não encontrada.', 'error')->back();
            return;
        }

        $companyUser = new User();
        if (!$companyUser->selectById((int)$company->getUserId()) || (int)$companyUser->getActive() !== 1) {
            $this->call(409, 'conflict', 'Não é possível demonstrar interesse em uma vaga de uma empresa inativa.', 'error')->back();
            return;
        }

        $vacancyLike = new VacancyLike(null, $this->userAuthId, (int)$vacancyId);
        $likeCreated = false;

        if (!$vacancyLike->likeExists()) {
            if ($vacancyLike->insert()) {
                $likeCreated = true;
            } elseif (!$vacancyLike->likeExists()) {
                $this->call(500, 'internal_server_error', 'Não foi possível registrar o interesse na vaga.', 'error')->back();
                return;
            }
        }

        $match = null;
        $matchCreated = false;
        $companyLike = new CompanyLike(
            null,
            (int)$company->getUserId(),
            $this->userAuthId,
            (int)$vacancyId
        );

        if ($companyLike->likeExists()) {
            $match = $this->findOrCreateMatch(
                $this->userAuthId,
                (int)$company->getUserId(),
                (int)$vacancyId,
                $matchCreated
            );

            if ($match === null) {
                $this->call(500, 'internal_server_error', 'O interesse foi registrado, mas não foi possível concluir o match.', 'error')->back();
                return;
            }
        }

        $created = $likeCreated || $matchCreated;
        $message = $matchCreated
            ? 'Interesse registrado e match criado com sucesso.'
            : ($likeCreated ? 'Interesse na vaga registrado com sucesso.' : 'Você já demonstrou interesse nesta vaga.');

        $this->call($created ? 201 : 200, $created ? 'created' : 'success', $message, 'success')->back([
            'vacancy_like' => [
                'candidate_user_id' => $this->userAuthId,
                'vacancy_id' => (int)$vacancyId
            ],
            'match' => $match
        ]);
    }

    /**
     * Lista as vagas nas quais o candidato autenticado demonstrou interesse.
     */
    public function listCandidateLikes(): void
    {
        if (!$this->authToken(3)) {
            $this->call(401, 'unauthorized', 'Somente candidatos autenticados podem consultar seus interesses.', 'error')->back();
            return;
        }

        $candidate = new Candidate();
        if (!$candidate->selectByUserId($this->userAuthId)) {
            $this->call(404, 'not_found', 'Cadastro do candidato não encontrado.', 'error')->back();
            return;
        }

        $likes = (new VacancyLike())->selectAll(
            ['candidate_user_id = :candidate_user_id'],
            'created_at',
            'DESC',
            [':candidate_user_id' => $this->userAuthId]
        );

        $response = [];
        foreach ($likes as $like) {
            $vacancy = new Vacancy();
            if (!$vacancy->selectById((int)$like->vacancy_id)) {
                continue;
            }

            $response[] = [
                'interaction' => $like,
                'vacancy' => $vacancy,
                'areas' => (new VacancyArea())->selectAll(
                    ['vacancy_id = :vacancy_id'],
                    'id',
                    'ASC',
                    [':vacancy_id' => (int)$vacancy->getId()]
                )
            ];
        }

        $this->call(200, 'success', 'Interesses do candidato encontrados.', 'success')->back($response);
    }

    /**
     * Registra o interesse de uma empresa em um candidato que já curtiu
     * uma vaga pertencente à própria empresa.
     */
    public function registerCompanyLike(array $data): void
    {
        if (!$this->authToken(4)) {
            $this->call(401, 'unauthorized', 'Somente empresas autenticadas podem demonstrar interesse em candidatos.', 'error')->back();
            return;
        }

        $vacancyId = filter_var($data['vacancy_id'] ?? null, FILTER_VALIDATE_INT);
        $candidateUserId = filter_var($data['candidate_user_id'] ?? null, FILTER_VALIDATE_INT);

        if ($vacancyId === false || $vacancyId < 1 || $candidateUserId === false || $candidateUserId < 1) {
            $this->call(400, 'bad_request', 'Informe vacancy_id e candidate_user_id válidos.', 'error')->back();
            return;
        }

        $company = new Company();
        if (!$company->selectByUserId($this->userAuthId)) {
            $this->call(404, 'not_found', 'Cadastro da empresa não encontrado.', 'error')->back();
            return;
        }

        $vacancy = new Vacancy();
        if (!$vacancy->selectById((int)$vacancyId)) {
            $this->call(404, 'not_found', 'Vaga não encontrada.', 'error')->back();
            return;
        }

        if ((int)$vacancy->getCompanyId() !== (int)$company->getId()) {
            $this->call(403, 'forbidden', 'Você não tem permissão para interagir com candidatos desta vaga.', 'error')->back();
            return;
        }

        if ($vacancy->getStatus() !== 'active') {
            $this->call(409, 'conflict', 'Não é possível demonstrar interesse por candidatos de uma vaga que não está ativa.', 'error')->back();
            return;
        }

        $candidateUser = new User();
        if (!$candidateUser->selectById((int)$candidateUserId) || (int)$candidateUser->getActive() !== 1) {
            $this->call(404, 'not_found', 'Candidato não encontrado ou inativo.', 'error')->back();
            return;
        }

        $candidate = new Candidate();
        if (!$candidate->selectByUserId((int)$candidateUserId)) {
            $this->call(404, 'not_found', 'Cadastro do candidato não encontrado.', 'error')->back();
            return;
        }

        $candidateLike = new VacancyLike(null, (int)$candidateUserId, (int)$vacancyId);
        if (!$candidateLike->likeExists()) {
            $this->call(409, 'conflict', 'O candidato ainda não demonstrou interesse nesta vaga.', 'error')->back();
            return;
        }

        $companyLike = new CompanyLike(
            null,
            $this->userAuthId,
            (int)$candidateUserId,
            (int)$vacancyId
        );

        $likeCreated = false;
        if (!$companyLike->likeExists()) {
            if ($companyLike->insert()) {
                $likeCreated = true;
            } elseif (!$companyLike->likeExists()) {
                $this->call(500, 'internal_server_error', 'Não foi possível registrar o interesse da empresa.', 'error')->back();
                return;
            }
        }

        $matchCreated = false;
        $match = $this->findOrCreateMatch(
            (int)$candidateUserId,
            $this->userAuthId,
            (int)$vacancyId,
            $matchCreated
        );

        if ($match === null) {
            $this->call(500, 'internal_server_error', 'O interesse foi registrado, mas não foi possível concluir o match. Tente novamente.', 'error')->back();
            return;
        }

        $created = $likeCreated || $matchCreated;
        $message = $matchCreated
            ? 'Interesse registrado. Match criado com sucesso.'
            : ($likeCreated ? 'Interesse da empresa registrado com sucesso.' : 'A empresa já demonstrou interesse neste candidato para esta vaga.');

        $this->call($created ? 201 : 200, $created ? 'created' : 'success', $message, 'success')->back([
            'company_like' => [
                'company_user_id' => $this->userAuthId,
                'candidate_user_id' => (int)$candidateUserId,
                'vacancy_id' => (int)$vacancyId
            ],
            'match' => $match
        ]);
    }

    /**
     * Lista os candidatos que demonstraram interesse nas vagas da empresa.
     */
    public function listCompanyLikes(): void
    {
        if (!$this->authToken(4)) {
            $this->call(401, 'unauthorized', 'Somente empresas autenticadas podem consultar seus interessados.', 'error')->back();
            return;
        }

        $company = new Company();
        if (!$company->selectByUserId($this->userAuthId)) {
            $this->call(404, 'not_found', 'Cadastro da empresa não encontrado.', 'error')->back();
            return;
        }

        $vacancies = (new Vacancy())->selectAll(
            ['company_id = :company_id'],
            'created_at',
            'DESC',
            [':company_id' => (int)$company->getId()]
        );

        $response = [];
        foreach ($vacancies as $vacancy) {
            $likes = (new VacancyLike())->selectAll(
                ['vacancy_id = :vacancy_id'],
                'created_at',
                'DESC',
                [':vacancy_id' => (int)$vacancy->id]
            );

            $interestedCandidates = [];
            foreach ($likes as $like) {
                $candidateUser = new User();
                if (!$candidateUser->selectById((int)$like->candidate_user_id)
                    || (int)$candidateUser->getActive() !== 1) {
                    continue;
                }

                $candidate = new Candidate();
                if (!$candidate->selectByUserId((int)$like->candidate_user_id)) {
                    continue;
                }

                $companyLike = new CompanyLike(
                    null,
                    $this->userAuthId,
                    (int)$like->candidate_user_id,
                    (int)$vacancy->id
                );

                $interestedCandidates[] = [
                    'interaction' => $like,
                    'candidate' => [
                        'user_id' => $candidate->getUserId(),
                        'full_name' => $candidate->getFullName(),
                        'location' => $candidate->getLocation(),
                        'areas' => (new CandidateArea())->selectByCandidateId((int)$candidate->getId()),
                        'salary_expectation' => $candidate->getSalaryExpectation(),
                        'work_schedule' => $candidate->getWorkSchedule(),
                        'shift' => $candidate->getShift(),
                        'work_model' => $candidate->getWorkModel(),
                        'employment_type' => $candidate->getEmploymentType(),
                        'about' => $candidate->getAbout()
                    ],
                    'company_liked' => $companyLike->likeExists()
                ];
            }

            $response[] = [
                'vacancy' => $vacancy,
                'interested_candidates' => $interestedCandidates
            ];
        }

        $this->call(200, 'success', 'Candidatos interessados nas vagas da empresa encontrados.', 'success')->back($response);
    }

    /**
     * Cria o match somente quando os dois lados demonstraram interesse
     * para a mesma vaga.
     */
    private function findOrCreateMatch(
        int $candidateUserId,
        int $companyUserId,
        int $vacancyId,
        bool &$created
    ): ?object {
        $created = false;

        $match = new UserMatch(
            null,
            $candidateUserId,
            $companyUserId,
            $vacancyId
        );

        if (!$match->matchExists()) {
            if ($match->insert()) {
                $created = true;
                $match->selectById((int)$match->getId());
                return $match;
            }

            // Uma segunda requisição pode ter criado o mesmo match simultaneamente.
            if (!$match->matchExists()) {
                return null;
            }
        }

        $matches = $match->selectAll(
            [
                'candidate_user_id = :candidate_user_id',
                'company_user_id = :company_user_id',
                'vacancy_id = :vacancy_id'
            ],
            'created_at',
            'DESC',
            [
                ':candidate_user_id' => $candidateUserId,
                ':company_user_id' => $companyUserId,
                ':vacancy_id' => $vacancyId
            ]
        );

        return $matches[0] ?? null;
    }
}
