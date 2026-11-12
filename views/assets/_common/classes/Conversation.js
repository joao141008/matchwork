export default class Conversation {
    #id;
    #matchId;
    #createdAt;

    constructor({
        id = null,
        matchId = null,
        createdAt = null
    } = {}) {
        this.id = id;
        this.matchId = matchId;
        this.createdAt = createdAt;
    }

    get id() {
        return this.#id;
    }

    set id(value) {
        if (value === null || value === undefined || value === "") {
            this.#id = null;
            return;
        }

        const number = Number(value);

        if (!Number.isInteger(number) || number <= 0) {
            throw new TypeError("O ID da conversa deve ser um número inteiro positivo");
        }

        this.#id = number;
    }

    get matchId() {
        return this.#matchId;
    }

    set matchId(value) {
        if (value === null || value === undefined || value === "") {
            this.#matchId = null;
            return;
        }

        const number = Number(value);

        if (!Number.isInteger(number) || number <= 0) {
            throw new TypeError("O ID do match deve ser um número inteiro positivo");
        }

        this.#matchId = number;
    }

    get createdAt() {
        return this.#createdAt;
    }

    set createdAt(value) {
        if (value === null || value === undefined || value === "") {
            this.#createdAt = null;
            return;
        }

        if (typeof value !== "string") {
            throw new TypeError("A data de criação deve ser uma string");
        }

        this.#createdAt = value;
    }

    /**
     * Verifica se a conversa possui um match associado.
     */
    hasMatch() {
        return this.matchId !== null;
    }

    /**
     * Converte a entidade para o formato enviado à API.
     */
    toJSON() {
        return {
            id: this.id,
            matchId: this.matchId,
            createdAt: this.createdAt
        };
    }

    /**
     * Cria uma Conversation a partir de um payload da API.
     */
    static fromJSON(payload = {}) {
        return new Conversation({
            id: payload.id ?? null,
            matchId: payload.matchId ?? payload.match_id ?? null,
            createdAt: payload.createdAt ?? payload.created_at ?? null
        });
    }
}
