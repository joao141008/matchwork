<?php

namespace Source\Controller;

use Source\Models\Question;

class Questions extends Api
{
    private const REQUEST_TYPES = ['question', 'report', 'bug', 'suggestion'];

    public function register(array $data): void
    {
        if (!$this->authToken([3, 4])) {
            $this->call(401, 'unauthorized', 'Usuário não autenticado.', 'error')->back();
            return;
        }

        $subject = trim((string) ($data['subject'] ?? ''));
        $questionText = trim((string) ($data['question'] ?? ''));
        $requestType = trim((string) ($data['request_type'] ?? 'question'));

        if ($subject === '' || $questionText === '') {
            $this->call(400, 'bad_request', 'Assunto e mensagem são obrigatórios.', 'error')->back();
            return;
        }

        if (!in_array($requestType, self::REQUEST_TYPES, true)) {
            $this->call(400, 'bad_request', 'Tipo de solicitação inválido.', 'error')->back();
            return;
        }

        $question = new Question(
            null,
            $this->userAuthId,
            $subject,
            $questionText,
            null,
            'open',
            null,
            $requestType
        );

        if (!$question->insert()) {
            $this->call(500, 'internal_server_error', 'Não foi possível registrar a solicitação.', 'error')->back();
            return;
        }

        $this->call(201, 'success', 'Solicitação enviada para a equipe administrativa.', 'created')->back($question);
    }

    public function list(): void
    {
        if (!$this->authToken([3, 4])) {
            $this->call(401, 'unauthorized', 'Usuário não autenticado.', 'error')->back();
            return;
        }

        $question = new Question();
        $this->call(200, 'success', 'Solicitações encontradas.', 'success')->back(
            $question->selectByUserId($this->userAuthId)
        );
    }

    public function listAll(): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, 'unauthorized', 'Acesso permitido somente para administradores.', 'error')->back();
            return;
        }

        $question = new Question();
        $this->call(200, 'success', 'Solicitações encontradas.', 'success')->back($question->selectAllWithUser());
    }

    public function answer(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, 'unauthorized', 'Acesso permitido somente para administradores.', 'error')->back();
            return;
        }

        $questionId = filter_var($data['questionId'] ?? null, FILTER_VALIDATE_INT);
        $answer = trim((string) ($data['answer'] ?? ''));

        if ($questionId === false || $questionId < 1 || $answer === '') {
            $this->call(400, 'bad_request', 'Informe uma solicitação válida e uma resposta.', 'error')->back();
            return;
        }

        $question = new Question();
        if (!$question->answerById((int) $questionId, $answer)) {
            $this->call(404, 'not_found', 'Solicitação não encontrada.', 'error')->back();
            return;
        }

        $this->call(200, 'success', 'Resposta enviada com sucesso.', 'success')->back([
            'id' => (int) $questionId,
            'answer' => $answer,
            'status' => 'answered'
        ]);
    }

    public function delete(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, 'unauthorized', 'Acesso permitido somente para administradores.', 'error')->back();
            return;
        }

        $questionId = filter_var($data['questionId'] ?? $data['id'] ?? null, FILTER_VALIDATE_INT);
        if ($questionId === false || $questionId < 1) {
            $this->call(400, 'bad_request', 'ID da solicitação inválido.', 'error')->back();
            return;
        }

        $question = new Question();
        if (!$question->deleteById((int) $questionId)) {
            $this->call(404, 'not_found', 'Solicitação não encontrada.', 'error')->back();
            return;
        }

        $this->call(200, 'success', 'Solicitação excluída com sucesso.', 'success')->back();
    }
}
