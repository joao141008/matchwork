
import HttpClientBase from "../classes/HttpClientBase.js";

export default class Message extends HttpClientBase {

    // Lista as mensagens de uma conversa.
    async list(conversationId) {
        return super.get(`/messages/list/${conversationId}`);
    }

    // Envia uma mensagem.
    async register(data) {
        return super.post("/messages/register", data);
    }

    // Busca uma mensagem específica pelo ID.
    async listById(messageId) {
        return super.get(`/messages/view/${messageId}`);
    }

    // Exclui uma mensagem pelo ID.
    async delete(messageId) {
        return super.delete(`/messages/delete/${messageId}`);
    }
}
