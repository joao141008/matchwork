<?php

namespace Source\Controller;

use Source\Models\Question;

class Questions extends Api
{
    public function register(array $data): void
    {
        if (!$this->authToken([3, 4])) {
            $this->call(401, 'unauthorized', 'Usuário não autenticado.', 'error')->back();
            return;
        }

        $subject = trim((string)($data['subject'] ?? ''));
        $questionText = trim((string)($data['question'] ?? ''));
        if ($subject === '' || $questionText === '') {
            $this->call(400, 'bad_request', 'Assunto e pergunta são obrigatórios.', 'error')->back();
            return;
        }

        $question = new Question(null, $this->userAuthId, $subject, $questionText, null, 'open');
        if (!$question->insert()) {
            $this->call(500, 'internal_server_error', 'Não foi possível registrar a pergunta.', 'error')->back();
            return;
        }

        $this->call(201, 'success', 'Pergunta enviada com sucesso.', 'created')->back($question);
    }

    public function list(): void
    {
        if (!$this->authToken([3, 4])) {
            $this->call(401, 'unauthorized', 'Usuário não autenticado.', 'error')->back();
            return;
        }

        $question = new Question();
        $this->call(200, 'success', 'Perguntas encontradas.', 'success')->back(
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
        $this->call(200, 'success', 'Perguntas encontradas.', 'success')->back($question->selectAllWithUser());
    }

    public function delete(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, 'unauthorized', 'Acesso permitido somente para administradores.', 'error')->back();
            return;
        }

        $questionId = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
        if ($questionId === false || $questionId < 1) {
            $this->call(400, 'bad_request', 'ID da pergunta inválido.', 'error')->back();
            return;
        }

        $question = new Question();
        if (!$question->deleteById((int)$questionId)) {
            $this->call(404, 'not_found', 'Pergunta não encontrada.', 'error')->back();
            return;
        }

        $this->call(200, 'success', 'Pergunta excluída com sucesso.', 'success')->back();
    }
}
