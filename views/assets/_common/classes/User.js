export default class User {
    #id;
    #typeId;
    #password;
    #email;
    #photo;
    #active;
    #token;

    constructor({
        id = null,
        typeId = null,
        password = "",
        email = "",
        photo = "",
        active = null,
        token = ""
    } = {}) {

        this.id = id;
        this.typeId = typeId;
        this.password = password;
        this.email = email;
        this.photo = photo;
        this.active = active;
        this.token = token;
    }

    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value === null ? null : Number(value);
    }

    get typeId() {
        return this.#typeId;
    }

    set typeId(value) {
        this.#typeId = value === null ? null : Number(value);
    }

    get password() {
        return this.#password;
    }
  //typeof tipo de 
    set password(value) {
        if (typeof value !== "string") {
            throw new TypeError("A senha deve ser uma string.");
        }

        this.#password = value;
    }

    get email() {
        return this.#email;
    }

    set email(value) {
    if (typeof value !== "string") {
        throw new TypeError("E-mail deve ser uma string.");
    }

    value = value.trim();

    if (value !== "" && !value.includes("@")) {
        throw new TypeError("E-mail inválido.");
    }

    this.#email = value;
}

    get photo() {
        return this.#photo;
    }

    set photo(value) {
        this.#photo = value ?? "";
    }

    get active() {
        return this.#active;
    }

    set active(value) {
        this.#active = value;
    }

    get token() {
        return this.#token;
    }

    set token(value) {
        this.#token = value ?? "";
    }

    toJSON() {
        return {
            id: this.id,
            type_id: this.typeId,
            password: this.password,
            email: this.email,
            photo: this.photo,
            active: this.active,
            token: this.token
        };
    }
}