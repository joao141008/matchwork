<?php

namespace Source\Controller;

use Source\Models\Conversation;
use Source\Models\UserMatch;

class Conversations extends Api
{
    public function register(array $data): void
    {
        if (!$this->authToken([3, 4])) {
            $this->call(401, 'unauthorized', 'Usuário não autenticado ou sem permissão.', 'error')->back();
            return;
        }

        $matchId = filter_var($data['match_id'] ?? null, FILTER_VALIDATE_INT);
        if ($matchId === false || $matchId < 1) {
            $this->call(400, 'bad_request', 'match_id inválido.', 'error')->back();
            return;
        }

        $match = new UserMatch();
        if (!$match->selectById((int)$matchId)) {
            $this->call(404, 'not_found', 'Match não encontrado.', 'error')->back();
            return;
        }

        if ((int)$match->getCandidateUserId() !== $this->userAuthId && (int)$match->getCompanyUserId() !== $this->userAuthId) {
            $this->call(403, 'forbidden', 'Você não pertence a este match.', 'error')->back();
            return;
        }

        $conversation = new Conversation();
        if ($conversation->selectByMatchId((int)$matchId)) {
            $this->call(200, 'success', 'Conversa já existente.', 'success')->back($conversation);
            return;
        }

        $conversation = new Conversation(null, (int)$matchId);
        if (!$conversation->insert()) {
            $this->call(500, 'internal_server_error', 'Não foi possível criar a conversa.', 'error')->back();
            return;
        }
        $conversation->selectById((int)$conversation->getId());

        $this->call(201, 'success', 'Conversa criada com sucesso.', 'created')->back($conversation);
    }

    public function list(): void
    {
        if (!$this->authToken([3, 4])) {
            $this->call(401, 'unauthorized', 'Usuário não autenticado ou sem permissão.', 'error')->back();
            return;
        }

        $conversation = new Conversation();
        $this->call(200, 'success', 'Conversas encontradas.', 'success')->back(
            $conversation->selectByUserId($this->userAuthId)
        );
    }

    public function listById(array $data): void
    {
        if (!$this->authToken([3, 4])) {
            $this->call(401, 'unauthorized', 'Usuário não autenticado ou sem permissão.', 'error')->back();
            return;
        }

        $conversationId = filter_var($data['listId'] ?? null, FILTER_VALIDATE_INT);
        if ($conversationId === false || $conversationId < 1) {
            $this->call(400, 'bad_request', 'ID da conversa inválido.', 'error')->back();
            return;
        }

        $conversation = new Conversation();
        if (!$conversation->selectById((int)$conversationId)) {
            $this->call(404, 'not_found', 'Conversa não encontrada.', 'error')->back();
            return;
        }

        if (!$conversation->belongsToUser($this->userAuthId)) {
            $this->call(403, 'forbidden', 'Você não pertence a esta conversa.', 'error')->back();
            return;
        }

        $this->call(200, 'success', 'Conversa encontrada.', 'success')->back($conversation);
    }

    public function delete(array $data): void
    {
        if (!$this->authToken([3, 4])) {
            $this->call(401, 'unauthorized', 'Usuário não autenticado ou sem permissão.', 'error')->back();
            return;
        }

        $conversationId = filter_var($data['deleteId'] ?? null, FILTER_VALIDATE_INT);
        if ($conversationId === false || $conversationId < 1) {
            $this->call(400, 'bad_request', 'ID da conversa inválido.', 'error')->back();
            return;
        }

        $conversation = new Conversation();
        if (!$conversation->selectById((int)$conversationId)) {
            $this->call(404, 'not_found', 'Conversa não encontrada.', 'error')->back();
            return;
        }

        if (!$conversation->belongsToUser($this->userAuthId)) {
            $this->call(403, 'forbidden', 'Você não pertence a esta conversa.', 'error')->back();
            return;
        }

        if (!$conversation->deleteById((int)$conversationId)) {
            $this->call(500, 'internal_server_error', 'Não foi possível excluir a conversa.', 'error')->back();
            return;
        }

        $this->call(200, 'success', 'Conversa excluída com sucesso.', 'success')->back();
    }
}
