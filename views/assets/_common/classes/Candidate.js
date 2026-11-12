export default class Candidate {
    #id;
    #userId;
    #fullName;
    #cpf;
    #location;
    #interestArea;
    #salaryExpectation;
    #workSchedule;
    #shift;
    #workModel;
    #employmentType;
    #about;

    constructor({
        id = null,
        userId = null,
        fullName = "",
        cpf = "",
        location = "",
        interestArea = "",
        salaryExpectation = "",
        workSchedule = "",
        shift = "",
        workModel = "",
        employmentType = "",
        about = ""
    } = {}) {
        this.id = id;
        this.userId = userId;
        this.fullName = fullName;
        this.cpf = cpf;
        this.location = location;
        this.interestArea = interestArea;
        this.salaryExpectation = salaryExpectation;
        this.workSchedule = workSchedule;
        this.shift = shift;
        this.workModel = workModel;
        this.employmentType = employmentType;
        this.about = about;
    }

    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value === null ? null : Number(value);
    }

    get userId() {
        return this.#userId;
    }

    set userId(value) {
        this.#userId = value === null ? null : Number(value);
    }

    get fullName() {
        return this.#fullName;
    }

    set fullName(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("O nome completo é obrigatório");
        }

        this.#fullName = value.trim();
    }

    get cpf() {
        return this.#cpf;
    }

    set cpf(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("O CPF é obrigatório");
        }

        this.#cpf = value.trim();
    }

    get location() {
        return this.#location;
    }

    set location(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("A localização é obrigatória");
        }

        this.#location = value.trim();
    }

    get interestArea() {
        return this.#interestArea;
    }

    set interestArea(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("A área de interesse é obrigatória");
        }

        this.#interestArea = value.trim();
    }

    get salaryExpectation() {
        return this.#salaryExpectation;
    }

    set salaryExpectation(value) {
        this.#salaryExpectation =
            value === null ? null : String(value).trim();
    }

    get workSchedule() {
        return this.#workSchedule;
    }

    set workSchedule(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("A carga horária é obrigatória");
        }

        this.#workSchedule = value.trim();
    }

    get shift() {
        return this.#shift;
    }

    set shift(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("O turno é obrigatório");
        }

        this.#shift = value.trim();
    }

    get workModel() {
        return this.#workModel;
    }

    set workModel(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("O modelo de trabalho é obrigatório");
        }

        this.#workModel = value.trim();
    }

    get employmentType() {
        return this.#employmentType;
    }

    set employmentType(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("O tipo de contratação é obrigatório");
        }

        this.#employmentType = value.trim();
    }

    get about() {
        return this.#about;
    }

    set about(value) {
        this.#about =
            value === null ? null : String(value).trim();
    }

    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            fullName: this.fullName,
            cpf: this.cpf,
            location: this.location,
            interestArea: this.interestArea,
            salaryExpectation: this.salaryExpectation,
            workSchedule: this.workSchedule,
            shift: this.shift,
            workModel: this.workModel,
            employmentType: this.employmentType,
            about: this.about
        };
    }
}
