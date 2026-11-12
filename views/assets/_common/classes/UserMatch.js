
export default class UserMatch {

    #id;
    #candidateUserId;
    #companyUserId;
    #vacancyId;
    #createdAt;
    #contactUserId;
    #contactName;
    #contactType;
    #contactPhoto;

    constructor({
        id = null,
        candidateUserId = null,
        companyUserId = null,
        vacancyId = null,
        createdAt = null,
        contactUserId = null,
        contactName = "",
        contactType = "",
        contactPhoto = null
    } = {}) {
        this.id = id;
        this.candidateUserId = candidateUserId;
        this.companyUserId = companyUserId;
        this.vacancyId = vacancyId;
        this.createdAt = createdAt;
        this.contactUserId = contactUserId;
        this.contactName = contactName;
        this.contactType = contactType;
        this.contactPhoto = contactPhoto;
    }

    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value === null || value === undefined ? null : Number(value);
    }

    get candidateUserId() {
        return this.#candidateUserId;
    }

    set candidateUserId(value) {
        if (value === null || value === undefined) {
            this.#candidateUserId = null;
            return;
        }

        const number = Number(value);

        if (!Number.isInteger(number) || number <= 0) {
            throw new TypeError(
                "O ID do candidato deve ser um número inteiro positivo"
            );
        }

        this.#candidateUserId = number;
    }

    get companyUserId() {
        return this.#companyUserId;
    }

    set companyUserId(value) {
        if (value === null || value === undefined) {
            this.#companyUserId = null;
            return;
        }

        const number = Number(value);

        if (!Number.isInteger(number) || number <= 0) {
            throw new TypeError(
                "O ID da empresa deve ser um número inteiro positivo"
            );
        }

        this.#companyUserId = number;
    }

    get vacancyId() {
        return this.#vacancyId;
    }

    set vacancyId(value) {
        this.#vacancyId = value === null || value === undefined
            ? null
            : Number(value);
    }

    get createdAt() {
        return this.#createdAt;
    }

    set createdAt(value) {
        this.#createdAt = value === null || value === undefined
            ? null
            : String(value).trim();
    }

    get contactUserId() {
        return this.#contactUserId;
    }

    set contactUserId(value) {
        this.#contactUserId = value === null || value === undefined
            ? null
            : Number(value);
    }

    get contactName() {
        return this.#contactName;
    }

    set contactName(value) {
        this.#contactName = value === null || value === undefined
            ? ""
            : String(value).trim();
    }

    get contactType() {
        return this.#contactType;
    }

    set contactType(value) {
        this.#contactType = value === null || value === undefined
            ? ""
            : String(value).trim().toLowerCase();
    }

    get contactPhoto() {
        return this.#contactPhoto;
    }

    set contactPhoto(value) {
        this.#contactPhoto = value === null || value === undefined || value === ""
            ? null
            : String(value).trim();
    }

    static fromJSON(data = {}) {
        return new UserMatch({
            id: data.id ?? null,
            candidateUserId: data.candidateUserId ?? data.candidate_user_id ?? null,
            companyUserId: data.companyUserId ?? data.company_user_id ?? null,
            vacancyId: data.vacancyId ?? data.vacancy_id ?? null,
            createdAt: data.createdAt ?? data.created_at ?? null,
            contactUserId: data.contactUserId ?? data.contact_user_id ?? null,
            contactName: data.contactName ?? data.contact_name ?? "",
            contactType: data.contactType ?? data.contact_type ?? "",
            contactPhoto: data.contactPhoto ?? data.contact_photo ?? null
        });
    }

    toJSON() {
        return {
            id: this.id,
            candidateUserId: this.candidateUserId,
            companyUserId: this.companyUserId,
            vacancyId: this.vacancyId,
            createdAt: this.createdAt,
            contactUserId: this.contactUserId,
            contactName: this.contactName,
            contactType: this.contactType,
            contactPhoto: this.contactPhoto
        };
    }
}
