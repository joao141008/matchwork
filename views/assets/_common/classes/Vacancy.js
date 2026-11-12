
export default class Vacancy {
    #id;
    #companyId;
    #title;
    #description;
    #requirements;
    #salaryOffer;
    #workload;
    #workSchedule;
    #shift;
    #workModel;
    #employmentType;
    #location;
    #benefits;
    #status;
    #createdAt;
    #updatedAt;
    #areas;
    #companyName;
    #companyIndustry;

    constructor({
        id = null,
        companyId = null,
        title = "",
        description = "",
        requirements = "",
        salaryOffer = "",
        workload = "",
        workSchedule = "",
        shift = "",
        workModel = "",
        employmentType = "",
        location = "",
        benefits = "",
        status = "active",
        createdAt = null,
        updatedAt = null,
        areas = [],
        companyName = "",
        companyIndustry = ""
    } = {}) {
        this.id = id;
        this.companyId = companyId;
        this.title = title;
        this.description = description;
        this.requirements = requirements;
        this.salaryOffer = salaryOffer;
        this.workload = workload;
        this.workSchedule = workSchedule;
        this.shift = shift;
        this.workModel = workModel;
        this.employmentType = employmentType;
        this.location = location;
        this.benefits = benefits;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.areas = areas;
        this.companyName = companyName;
        this.companyIndustry = companyIndustry;
    }

    get id() { return this.#id; }
    set id(value) {
        this.#id = value == null || value === "" ? null : Number(value);
    }

    get companyId() { return this.#companyId; }
    set companyId(value) {
        this.#companyId = value == null || value === "" ? null : Number(value);
    }

    get title() { return this.#title; }
    set title(value) {
        this.#title = value == null ? "" : String(value).trim();
    }

    get description() { return this.#description; }
    set description(value) {
        this.#description = value == null ? "" : String(value).trim();
    }

    get requirements() { return this.#requirements; }
    set requirements(value) {
        this.#requirements = value == null ? "" : String(value).trim();
    }

    get salaryOffer() { return this.#salaryOffer; }
    set salaryOffer(value) {
        this.#salaryOffer = value == null ? "" : String(value).trim();
    }

    get workload() { return this.#workload; }
    set workload(value) {
        this.#workload = value == null ? "" : String(value).trim();
    }

    get workSchedule() { return this.#workSchedule; }
    set workSchedule(value) {
        this.#workSchedule = value == null ? "" : String(value).trim();
    }

    get shift() { return this.#shift; }
    set shift(value) {
        this.#shift = value == null ? "" : String(value).trim();
    }

    get workModel() { return this.#workModel; }
    set workModel(value) {
        this.#workModel = value == null ? "" : String(value).trim();
    }

    get employmentType() { return this.#employmentType; }
    set employmentType(value) {
        this.#employmentType = value == null ? "" : String(value).trim();
    }

    get location() { return this.#location; }
    set location(value) {
        this.#location = value == null ? "" : String(value).trim();
    }

    get benefits() { return this.#benefits; }
    set benefits(value) {
        this.#benefits = value == null ? "" : String(value).trim();
    }

    get status() { return this.#status; }
    set status(value) {
        this.#status = value == null ? "active" : String(value).trim();
    }

    get createdAt() { return this.#createdAt; }
    set createdAt(value) {
        this.#createdAt = value == null ? null : String(value);
    }

    get updatedAt() { return this.#updatedAt; }
    set updatedAt(value) {
        this.#updatedAt = value == null ? null : String(value);
    }

    get areas() { return this.#areas; }
    set areas(value) {
        this.#areas = Array.isArray(value) ? value : [];
    }

    get companyName() { return this.#companyName; }
    set companyName(value) {
        this.#companyName = value == null ? "" : String(value).trim();
    }

    get companyIndustry() { return this.#companyIndustry; }
    set companyIndustry(value) {
        this.#companyIndustry = value == null ? "" : String(value).trim();
    }

    static fromJSON(data = {}) {
        return new Vacancy({
            id: data.id,
            companyId: data.companyId ?? data.company_id,
            title: data.title,
            description: data.description,
            requirements: data.requirements,
            salaryOffer: data.salaryOffer ?? data.salary_offer,
            workload: data.workload,
            workSchedule: data.workSchedule ?? data.work_schedule,
            shift: data.shift,
            workModel: data.workModel ?? data.work_model,
            employmentType: data.employmentType ?? data.employment_type,
            location: data.location,
            benefits: data.benefits,
            status: data.status,
            createdAt: data.createdAt ?? data.created_at,
            updatedAt: data.updatedAt ?? data.updated_at,
            areas: data.areas ?? [],
            companyName: data.companyName ?? data.company_name ?? "",
            companyIndustry: data.companyIndustry ?? data.company_industry ?? ""
        });
    }

    toJSON() {
        return {
            id: this.id,
            companyId: this.companyId,
            title: this.title,
            description: this.description,
            requirements: this.requirements,
            salaryOffer: this.salaryOffer,
            workload: this.workload,
            workSchedule: this.workSchedule,
            shift: this.shift,
            workModel: this.workModel,
            employmentType: this.employmentType,
            location: this.location,
            benefits: this.benefits,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            areas: this.areas,
            companyName: this.companyName,
            companyIndustry: this.companyIndustry
        };
    }
}
