
import HttpClientBase from "../classes/HttpClientBase.js";

export default class CandidateService extends HttpClientBase {

    async register(data = {}) {
        const formData = this.#buildFormData(data);

        return super.postForm("/candidates/register", formData);
    }

    async update(data = {}) {
        const formData = this.#buildFormData(data);

        return super.put("/candidates/update", formData);
    }

    async delete() {
        return super.delete("/candidates/delete");
    }

    async list(data = {}) {
        return super.get("/candidates/list", data);
    }

    async listById(candidateId) {
        const id = Number(candidateId);

        if (!Number.isInteger(id) || id < 1) {
            throw new TypeError("ID do candidato inválido.");
        }

        return super.get(`/candidates/list/${id}`);
    }

    #buildFormData(data = {}) {
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
                        "As áreas de interesse devem ser enviadas em uma lista."
                    );
                }

                formData.append("areas_present", "1");

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
