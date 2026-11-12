
export default class Company {
    #id;
    #userId;
    #companyName;
    #cnpj;
    #location;
    #industry;
    #salaryOffer;
    #workload;
    #workModel;
    #employmentType;
    #description;

    constructor({
        id = null,
        userId = null,
        companyName = "",
        cnpj = "",
        location = "",
        industry = "",
        salaryOffer = "",
        workload = "",
        workModel = "",
        employmentType = "",
        description = ""
    } = {}) {
        this.id = id;
        this.userId = userId;
        this.companyName = companyName;
        this.cnpj = cnpj;
        this.location = location;
        this.industry = industry;
        this.salaryOffer = salaryOffer;
        this.workload = workload;
        this.workModel = workModel;
        this.employmentType = employmentType;
        this.description = description;
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

    get companyName() {
        return this.#companyName;
    }

    set companyName(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("O nome da empresa é obrigatório");
        }

        this.#companyName = value.trim();
    }

    get cnpj() {
        return this.#cnpj;
    }

    set cnpj(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("O CNPJ é obrigatório");
        }

        this.#cnpj = value.trim();
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

    get industry() {
        return this.#industry;
    }

    set industry(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("O setor da empresa é obrigatório");
        }

        this.#industry = value.trim();
    }

    get salaryOffer() {
        return this.#salaryOffer;
    }

    set salaryOffer(value) {
        this.#salaryOffer = value === null ? null : String(value).trim();
    }

    get workload() {
        return this.#workload;
    }

    set workload(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("A carga horária é obrigatória");
        }

        this.#workload = value.trim();
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

    get description() {
        return this.#description;
    }

    set description(value) {
        this.#description = value === null ? null : String(value).trim();
    }

    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            companyName: this.companyName,
            cnpj: this.cnpj,
            location: this.location,
            industry: this.industry,
            salaryOffer: this.salaryOffer,
            workload: this.workload,
            workModel: this.workModel,
            employmentType: this.employmentType,
            description: this.description
        };
    }
}

