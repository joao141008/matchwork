
import HttpClientBase from "../classes/HttpClientBase.js";

export default class InteractionService extends HttpClientBase {

    async registerCandidateLike(vacancyId) {
        this.#validateId(vacancyId, "vaga");

        return super.post("/interactions/candidate/like", {
            vacancy_id: Number(vacancyId)
        });
    }

    async listCandidateLikes() {
        return super.get("/interactions/candidate/list");
    }

    async listCompanyLikes() {
        return super.get("/interactions/company/list");
    }

    async registerCompanyLike(vacancyId, candidateUserId) {
        this.#validateId(vacancyId, "vaga");
        this.#validateId(candidateUserId, "candidato");

        return super.post("/interactions/company/like", {
            vacancy_id: Number(vacancyId),
            candidate_user_id: Number(candidateUserId)
        });
    }

    #validateId(id, label) {
        const numericId = Number(id);

        if (!Number.isInteger(numericId) || numericId < 1) {
            throw new TypeError(`ID de ${label} inválido.`);
        }
    }
}
