
import HttpClientBase from "../classes/HttpClientBase.js";

export default class AreaService extends HttpClientBase {

    // Busca todas as áreas profissionais.
    async list() {
        return super.get("/areas/list");
    }

    // Busca uma área específica.
    async listById(areaId) {
        this.#validateId(areaId);

        return super.get(`/areas/list/${Number(areaId)}`);
    }

    #validateId(id) {
        const numericId = Number(id);

        if (!Number.isInteger(numericId) || numericId < 1) {
            throw new TypeError("ID de área inválido.");
        }
    }
}
