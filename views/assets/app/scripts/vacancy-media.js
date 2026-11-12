import VacancyService from "../../_common/services/VacancyService.js";
import { pegarToken, pegarTipo, TIPO } from "../../_common/scripts/sessao.js";

const dialog = document.querySelector("#vacancyDialog");
const form = document.querySelector("#vacancyForm");
const vacancyIdInput = document.querySelector("#vacancyId");
const fileInput = document.querySelector("#vacancyImagesInput");
const chooseButton = document.querySelector("#btnChooseVacancyImages");
const preview = document.querySelector("#vacancyImagePreview");
const counter = document.querySelector("#vacancyImageCount");
const feedback = document.querySelector("#vacancyFormFeedback");
const saveButton = document.querySelector("#btnSaveVacancy");

const MAX_IMAGES = 6;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const service = new VacancyService();
const token = pegarToken();

let currentVacancyId = null;
let existingImages = [];
let pendingFiles = [];
let previewObjectUrls = [];
let loadingImages = false;

if (token && pegarTipo() === TIPO.EMPRESA && dialog && form) {
    service.setAuthToken(token);
    configurarSelecao();
    configurarModal();
    configurarSalvamento();
}

function configurarSelecao() {
    chooseButton?.addEventListener("click", () => fileInput?.click());

    fileInput?.addEventListener("change", () => {
        const files = Array.from(fileInput.files || []);
        fileInput.value = "";

        for (const file of files) {
            if (! ["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                mostrarErro("Utilize somente imagens JPEG, PNG ou WebP.");
                continue;
            }

            if (file.size > MAX_FILE_SIZE) {
                mostrarErro(`A imagem ${file.name} ultrapassa 5 MB.`);
                continue;
            }

            if (existingImages.length + pendingFiles.length >= MAX_IMAGES) {
                mostrarErro("Cada vaga pode possuir no máximo 6 imagens.");
                break;
            }

            pendingFiles.push(file);
        }

        renderizarPrevia();
    });
}

function configurarModal() {
    const observer = new MutationObserver(() => {
        if (!dialog.open) return;

        const id = Number(vacancyIdInput.value || 0) || null;
        if (id === currentVacancyId) return;

        currentVacancyId = id;
        existingImages = [];
        pendingFiles = [];
        renderizarPrevia();

        if (id) carregarImagensExistentes(id);
    });

    observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });

    dialog.addEventListener("close", () => {
        currentVacancyId = null;
        existingImages = [];
        limparArquivosPendentes();
        renderizarPrevia();
    });
}

async function carregarImagensExistentes(vacancyId) {
    loadingImages = true;
    renderizarPrevia();

    try {
        const response = await service.listById(vacancyId);
        if (response?.type === "error") {
            throw new Error(response.message || "Não foi possível carregar as imagens da vaga.");
        }

        if (currentVacancyId !== vacancyId) return;
        existingImages = Array.isArray(response?.data?.images) ? response.data.images : [];
        renderizarPrevia();
    } catch (error) {
        mostrarErro(error.message);
    } finally {
        loadingImages = false;
        renderizarPrevia();
    }
}

function renderizarPrevia() {
    if (!preview || !counter) return;

    previewObjectUrls.forEach((url) => URL.revokeObjectURL(url));
    previewObjectUrls = [];
    preview.replaceChildren();
    counter.textContent = `${existingImages.length + pendingFiles.length} / ${MAX_IMAGES}`;

    if (loadingImages) {
        const loading = document.createElement("p");
        loading.className = "image-preview-empty";
        loading.textContent = "Carregando imagens atuais...";
        preview.appendChild(loading);
    }

    existingImages.forEach((image) => {
        preview.appendChild(criarItemPrevia(
            image.image_url || image.image_path,
            "Remover imagem existente",
            () => removerImagemExistente(image)
        ));
    });

    pendingFiles.forEach((file, index) => {
        const url = URL.createObjectURL(file);
        previewObjectUrls.push(url);
        const item = criarItemPrevia(
            url,
            `Remover ${file.name}`,
            () => {
                pendingFiles.splice(index, 1);
                renderizarPrevia();
            }
        );
        item.dataset.pending = "true";
        preview.appendChild(item);
    });

    if (!existingImages.length && !pendingFiles.length && !loadingImages) {
        const empty = document.createElement("p");
        empty.className = "image-preview-empty";
        empty.textContent = "Nenhuma imagem selecionada.";
        preview.appendChild(empty);
    }

    if (chooseButton) {
        chooseButton.disabled = existingImages.length + pendingFiles.length >= MAX_IMAGES;
    }
}

function criarItemPrevia(src, label, onRemove) {
    const item = document.createElement("figure");
    item.className = "vacancy-image-preview-item";

    const image = document.createElement("img");
    image.src = src;
    image.alt = "Pré-visualização da imagem da vaga";

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "vacancy-image-remove";
    remove.title = label;
    remove.setAttribute("aria-label", label);
    remove.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    remove.addEventListener("click", onRemove);

    item.append(image, remove);
    return item;
}

async function removerImagemExistente(image) {
    if (!currentVacancyId || !image?.id) return;

    try {
        const response = await service.deleteImage(currentVacancyId, image.id);
        if (response?.type === "error") {
            throw new Error(response.message || "Não foi possível remover a imagem.");
        }

        existingImages = existingImages.filter((item) => Number(item.id) !== Number(image.id));
        renderizarPrevia();
    } catch (error) {
        mostrarErro(error.message);
    }
}

function configurarSalvamento() {
    // Intercepta o submit para salvar a vaga e, em seguida, enviar os arquivos.
    // O listener principal do dashboard não é executado para evitar dois salvamentos.
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        if (loadingImages) {
            mostrarErro("Aguarde o carregamento das imagens atuais.");
            return;
        }

        const payload = coletarDados();
        if (!validarDados(payload)) return;

        const editingId = Number(vacancyIdInput.value || 0) || null;
        const originalLabel = saveButton.textContent;
        saveButton.disabled = true;
        saveButton.textContent = editingId ? "Salvando..." : "Publicando...";
        feedback.hidden = true;

        try {
            const response = editingId
                ? await service.update(editingId, payload)
                : await service.register(payload);

            if (response?.type === "error") {
                throw new Error(response.message || "Não foi possível salvar a vaga.");
            }

            const vacancyId = editingId || Number(response?.data?.id);
            if (!Number.isInteger(vacancyId) || vacancyId < 1) {
                throw new Error("A vaga foi salva, mas a API não retornou um ID válido.");
            }

            // Se o upload falhar, conserva o ID para que uma nova tentativa edite
            // a vaga já criada, em vez de cadastrar outra igual.
            currentVacancyId = vacancyId;
            vacancyIdInput.value = String(vacancyId);

            if (pendingFiles.length) {
                saveButton.textContent = "Enviando imagens...";
                const uploadResponse = await service.uploadImages(vacancyId, pendingFiles);
                if (uploadResponse?.type === "error") {
                    throw new Error(uploadResponse.message || "A vaga foi salva, mas não foi possível enviar as imagens.");
                }
                limparArquivosPendentes();
            }

            dialog.close();
            window.location.reload();
        } catch (error) {
            mostrarErro(error.message || "Não foi possível concluir o salvamento.");
            if (Number(vacancyIdInput.value || 0) > 0) {
                const title = document.querySelector("#vacancyDialogTitle");
                if (title) title.textContent = "Editar vaga";
            }
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = Number(vacancyIdInput.value || 0) > 0
                ? "Tentar novamente"
                : originalLabel;
        }
    }, true);
}

function coletarDados() {
    const formData = new FormData(form);
    const fields = [
        "title", "description", "requirements", "salary_offer", "workload",
        "work_schedule", "shift", "work_model", "employment_type", "location", "benefits"
    ];

    const payload = {};
    fields.forEach((field) => {
        payload[field] = String(formData.get(field) || "").trim();
    });

    payload.areas = Array.from(
        document.querySelectorAll('#vacancyAreas input[name="areaId"]:checked')
    ).map((checkbox) => {
        const customInput = checkbox.closest(".area-option")?.querySelector('input[name="customArea"]');
        return {
            area_id: Number(checkbox.value),
            custom_area: customInput?.value.trim() || ""
        };
    });

    return payload;
}

function validarDados(payload) {
    if (!payload.title || !payload.description) {
        mostrarErro("Preencha o título e a descrição da vaga.");
        return false;
    }

    if (!payload.areas.length) {
        mostrarErro("Selecione pelo menos uma área profissional.");
        return false;
    }

    const otherCheckbox = Array.from(
        document.querySelectorAll('#vacancyAreas .area-option')
    ).find((element) => element.textContent.trim().toLocaleLowerCase("pt-BR").startsWith("outras"))
        ?.querySelector('input[name="areaId"]:checked');

    if (otherCheckbox) {
        const custom = otherCheckbox.closest(".area-option")?.querySelector('input[name="customArea"]');
        if (!custom?.value.trim()) {
            mostrarErro('Informe a área personalizada ao selecionar "Outras".');
            return false;
        }
    }

    return true;
}

function mostrarErro(message) {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.hidden = false;
}

function limparArquivosPendentes() {
    previewObjectUrls.forEach((url) => URL.revokeObjectURL(url));
    previewObjectUrls = [];
    pendingFiles = [];
}
