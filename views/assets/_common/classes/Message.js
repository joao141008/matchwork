export default class Message {
    #id;
    #conversationId;
    #senderId;
    #message;
    #createdAt;

    constructor({
        id = null,
        conversationId = null,
        senderId = null,
        message = "",
        createdAt = null
    } = {}) {
        this.id = id;
        this.conversationId = conversationId;
        this.senderId = senderId;
        this.message = message;
        this.createdAt = createdAt;
    }

    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value === null ? null : Number(value);
    }

    get conversationId() {
        return this.#conversationId;
    }

    set conversationId(value) {
        this.#conversationId = value === null ? null : Number(value);
    }

    get senderId() {
        return this.#senderId;
    }

    set senderId(value) {
        this.#senderId = value === null ? null : Number(value);
    }

    get message() {
        return this.#message;
    }

    set message(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("A mensagem é obrigatória");
        }

        this.#message = value.trim();
    }

    get createdAt() {
        return this.#createdAt;
    }

    set createdAt(value) {
        this.#createdAt = value ?? null;
    }

    toJSON() {
        return {
            id: this.id,
            conversationId: this.conversationId,
            senderId: this.senderId,
            message: this.message,
            createdAt: this.createdAt
        };
    }

    static fromJSON(data = {}) {
        return new Message({
            id: data.id ?? null,
            conversationId: data.conversationId ?? data.conversation_id ?? null,
            senderId: data.senderId ?? data.sender_id ?? null,
            message: data.message ?? "",
            createdAt: data.createdAt ?? data.created_at ?? null
        });
    }
}