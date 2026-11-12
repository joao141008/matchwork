
export default class Area {
    #id;
    #name;

    constructor({ id = null, name = "" } = {}) {
        this.id = id;
        this.name = name;
    }

    get id() {
        return this.#id;
    }

    set id(value) {
        if (value === null || value === undefined || value === "") {
            this.#id = null;
            return;
        }

        const id = Number(value);

        if (!Number.isInteger(id) || id < 1) {
            throw new TypeError("ID de área inválido.");
        }

        this.#id = id;
    }

    get name() {
        return this.#name;
    }

    set name(value) {
        this.#name = value == null ? "" : String(value).trim();
    }

    static fromJSON(data = {}) {
        return new Area({
            id: data.id,
            name: data.name
        });
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name
        };
    }
}
