import HttpClientBase from "../classes/HttpClientBase.js";

export default class ReportsService extends HttpClientBase {
    // Registra uma denúncia vinculada ao usuário denunciado.
    async register(data = {}) {
        return this.postForm("/reports/register", data);
    }

    async list() {
        return this.get("/reports/list");
    }

    async update(data = {}) {
        return this.put("/reports/update", data);
    }

    async delete(reportId) {
        const id = Number(reportId);

        if (!Number.isInteger(id) || id < 1) {
            throw new TypeError("ID da denúncia inválido.");
        }

        return super.delete(`/reports/delete/${id}`);
    }
}
