
import HttpClientBase from "../classes/HttpClientBase.js";

export default class Conversation extends HttpClientBase {

    // Lista todas as conversas do usuário autenticado.
    async get() {
        return super.get("/conversations/list");
    }

    // Cria uma conversa vinculada a um match.
    async register(data) {
        return super.post("/conversations/register", data);
    }

    // Exclui uma conversa pelo ID.
    async delete(deleteId) {
        return super.delete(`/conversations/delete/${deleteId}`);
    }

    // Busca uma conversa específica pelo ID.
    async listId(convId) {
        return super.get(`/conversations/list/${convId}`);
    }
}
