import HttpClientBase from "../classes/HttpClientBase.js";

export default class QuestionService extends HttpClientBase {
    async register(data = {}) {
        return this.postForm("/questions/register", data);
    }

    async list() {
        return this.get("/questions/list");
    }

    async listAll() {
        return this.get("/questions/listall");
    }

    async answer(questionId, answer) {
        const id = Number(questionId);
        if (!Number.isInteger(id) || id < 1) {
            throw new TypeError("ID da solicitação inválido.");
        }
        return this.put(`/questions/${id}/answer`, { answer });
    }

    async delete(questionId) {
        const id = Number(questionId);
        if (!Number.isInteger(id) || id < 1) {
            throw new TypeError("ID da solicitação inválido.");
        }
        return super.delete(`/questions/delete/${id}`);
    }
}
