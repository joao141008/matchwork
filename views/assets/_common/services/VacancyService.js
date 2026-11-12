
import HttpClientBase from "../classes/HttpClientBase.js";

export default class VacancyService extends HttpClientBase {

    // Lista as vagas disponíveis para candidatos.
    async list(params = {}) {
        return super.get("/vacancies/list", params);
    }

    // Busca uma vaga pelo ID.
    async listById(vacancyId) {
        this.#validateId(vacancyId);

        return super.get(`/vacancies/list/${Number(vacancyId)}`);
    }

    // Lista as vagas pertencentes à empresa autenticada.
    async listByCompany() {
        return super.get("/vacancies/company/list");
    }

    // Cadastra uma nova vaga.
    async register(data = {}) {
        const formData = this.#buildFormData(data);

        return super.postForm("/vacancies/insert", formData);
    }

    // Atualiza uma vaga existente.
    async update(vacancyId, data = {}) {
        this.#validateId(vacancyId);

        const formData = this.#buildFormData(data);

        return super.put(
            `/vacancies/update/${Number(vacancyId)}`,
            formData
        );
    }

    // Envia várias imagens para uma vaga já cadastrada.
    async uploadImages(vacancyId, files = []) {
        this.#validateId(vacancyId);

        if (!Array.isArray(files) || files.length === 0) {
            throw new TypeError("Selecione pelo menos uma imagem para enviar.");
        }

        const formData = new FormData();

        files.forEach((file) => {
            if (!(file instanceof Blob)) {
                throw new TypeError("Todos os arquivos enviados precisam ser imagens válidas.");
            }

            formData.append("images[]", file, file.name || "imagem");
        });

        return super.postForm(
            `/vacancies/${Number(vacancyId)}/images`,
            formData
        );
    }

    // Remove uma imagem específica de uma vaga.
    async deleteImage(vacancyId, imageId) {
        this.#validateId(vacancyId);

        const numericImageId = Number(imageId);

        if (!Number.isInteger(numericImageId) || numericImageId < 1) {
            throw new TypeError("O ID da imagem deve ser um número inteiro positivo.");
        }

        return super.delete(
            `/vacancies/${Number(vacancyId)}/images/${numericImageId}`
        );
    }

    // Encerra uma vaga.
    async delete(vacancyId) {
        this.#validateId(vacancyId);

        return super.delete(
            `/vacancies/delete/${Number(vacancyId)}`
        );
    }

    #validateId(id) {
        const numericId = Number(id);

        if (!Number.isInteger(numericId) || numericId < 1) {
            throw new TypeError(
                "O ID da vaga deve ser um número inteiro positivo."
            );
        }
    }

    #buildFormData(data = {}) {
        if (data instanceof FormData) {
            return data;
        }

        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (value === undefined || value === null) {
                return;
            }

            // O backend espera uma lista de objetos:
            // areas[0][area_id], areas[0][custom_area], etc.
            if (key === "areas") {
                if (!Array.isArray(value)) {
                    throw new TypeError(
                        "O campo areas deve ser uma lista."
                    );
                }

                value.forEach((area, index) => {
                    if (!area || typeof area !== "object") {
                        throw new TypeError(
                            "Cada área precisa conter area_id."
                        );
                    }

                    const areaId = area.area_id ?? area.areaId;
                    const customArea =
                        area.custom_area ?? area.customArea ?? "";

                    if (
                        !Number.isInteger(Number(areaId)) ||
                        Number(areaId) < 1
                    ) {
                        throw new TypeError(
                            `ID inválido na área ${index + 1}.`
                        );
                    }

                    formData.append(
                        `areas[${index}][area_id]`,
                        String(Number(areaId))
                    );

                    formData.append(
                        `areas[${index}][custom_area]`,
                        String(customArea)
                    );
                });

                return;
            }

            formData.append(key, String(value));
        });

        return formData;
    }
}
