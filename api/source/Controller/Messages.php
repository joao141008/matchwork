<?php

namespace Source\Controller;

use Source\Models\Conversation;
use Source\Models\Message;

class Messages extends Api
{
    public function register(array $data): void
    {
        if (!$this->authToken([3, 4])) {
            $this->call(401, 'unauthorized', 'Usuário não autenticado ou sem permissão.', 'error')->back();
            return;
        }

        $conversationId = filter_var($data['conversation_id'] ?? null, FILTER_VALIDATE_INT);
        $rawMessage = $data['message'] ?? null;
        if (!is_string($rawMessage)) {
            $this->call(400, 'bad_request', 'A mensagem deve ser um texto.', 'error')->back();
            return;
        }
        $messageText = trim($rawMessage);
        if ($conversationId === false || $conversationId < 1 || $messageText === '') {
            $this->call(400, 'bad_request', 'conversation_id e message são obrigatórios.', 'error')->back();
            return;
        }

        $conversation = new Conversation();
        if (!$conversation->selectById((int)$conversationId)) {
            $this->call(404, 'not_found', 'Conversa não encontrada.', 'error')->back();
            return;
        }
        if (!$conversation->belongsToUser($this->userAuthId)) {
            $this->call(403, 'forbidden', 'Você não participa desta conversa.', 'error')->back();
            return;
        }

        $message = new Message(null, (int)$conversationId, $this->userAuthId, $messageText);
        if (!$message->insert()) {
            $this->call(500, 'internal_server_error', 'Não foi possível enviar a mensagem.', 'error')->back();
            return;
        }
        $message->selectById((int)$message->getId());

        $this->call(201, 'success', 'Mensagem enviada com sucesso.', 'created')->back($message);
    }

    public function list(array $data): void
    {
        if (!$this->authToken([3, 4])) {
            $this->call(401, 'unauthorized', 'Usuário não autenticado ou sem permissão.', 'error')->back();
            return;
        }

        $conversationId = filter_var($data['conversationId'] ?? null, FILTER_VALIDATE_INT);
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
            $this->call(403, 'forbidden', 'Você não participa desta conversa.', 'error')->back();
            return;
        }

        $message = new Message();
        $this->call(200, 'success', 'Mensagens encontradas.', 'success')->back(
            $message->selectByConversationId((int)$conversationId)
        );
    }

    public function listById(array $data): void
    {
        if (!$this->authToken([3, 4])) {
            $this->call(401, 'unauthorized', 'Usuário não autenticado ou sem permissão.', 'error')->back();
            return;
        }

        $messageId = filter_var($data['messageId'] ?? null, FILTER_VALIDATE_INT);
        if ($messageId === false || $messageId < 1) {
            $this->call(400, 'bad_request', 'ID da mensagem inválido.', 'error')->back();
            return;
        }

        $message = new Message();
        if (!$message->selectById((int)$messageId)) {
            $this->call(404, 'not_found', 'Mensagem não encontrada.', 'error')->back();
            return;
        }

        $conversation = new Conversation();
        if (!$conversation->selectById((int)$message->getConversationId()) || !$conversation->belongsToUser($this->userAuthId)) {
            $this->call(404, 'not_found', 'Mensagem não encontrada nesta conversa.', 'error')->back();
            return;
        }

        $this->call(200, 'success', 'Mensagem encontrada.', 'success')->back($message);
    }

    public function delete(array $data): void
    {
        if (!$this->authToken([3, 4])) {
            $this->call(401, 'unauthorized', 'Usuário não autenticado ou sem permissão.', 'error')->back();
            return;
        }

        $messageId = filter_var($data['deleteId'] ?? null, FILTER_VALIDATE_INT);
        if ($messageId === false || $messageId < 1) {
            $this->call(400, 'bad_request', 'ID da mensagem inválido.', 'error')->back();
            return;
        }

        $message = new Message();
        if (!$message->selectById((int)$messageId)) {
            $this->call(404, 'not_found', 'Mensagem não encontrada.', 'error')->back();
            return;
        }

        if ((int)$message->getSenderId() !== $this->userAuthId) {
            $this->call(403, 'forbidden', 'Você só pode excluir suas próprias mensagens.', 'error')->back();
            return;
        }

        $conversation = new Conversation();
        if (!$conversation->selectById((int)$message->getConversationId()) || !$conversation->belongsToUser($this->userAuthId)) {
            $this->call(404, 'not_found', 'Mensagem não encontrada nesta conversa.', 'error')->back();
            return;
        }

        if (!$message->deleteById((int)$messageId)) {
            $this->call(500, 'internal_server_error', 'Não foi possível excluir a mensagem.', 'error')->back();
            return;
        }

        $this->call(200, 'success', 'Mensagem excluída com sucesso.', 'success')->back();
    }
}
