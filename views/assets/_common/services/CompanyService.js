
import HttpClientBase from "../classes/HttpClientBase.js";

export default class Company extends HttpClientBase {

    async register(data = {}) {
        const formData = this.#buildRegisterFormData(data);

        return super.postForm("/companies/register", formData);
    }

    async update(data) {
        return this.put("/companies/update", data);
    }

    async delete() {
        return super.delete("/companies/delete");
    }

    async list(data = {}) {
        return this.get("/companies/list", data);
    }

    async listById(companyId) {
        return this.get(`/companies/list/${companyId}`);
    }

    // TRANSFORMAR DADOS DO CADASTRO EM FORMDATA

    #buildRegisterFormData(data = {}) {
        if (typeof FormData !== "undefined" && data instanceof FormData) {
            return data;
        }

        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (value === undefined || value === null) {
                return;
            }

            if (key === "areas") {
                if (!Array.isArray(value)) {
                    throw new TypeError(
                        "As áreas de atuação devem ser enviadas em uma lista."
                    );
                }

                value.forEach((area, index) => {
                    const areaId = Number(area?.area_id);

                    if (!Number.isInteger(areaId) || areaId < 1) {
                        throw new TypeError(
                            `ID inválido na área selecionada (${index + 1}).`
                        );
                    }

                    formData.append(
                        `areas[${index}][area_id]`,
                        String(areaId)
                    );

                    formData.append(
                        `areas[${index}][custom_area]`,
                        String(area.custom_area ?? "")
                    );
                });

                return;
            }

            if (typeof Blob !== "undefined" && value instanceof Blob) {
                formData.append(key, value);
                return;
            }

            formData.append(key, String(value));
        });

        return formData;
    }
}
