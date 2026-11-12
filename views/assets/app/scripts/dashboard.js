
import Vacancy from "../../_common/classes/Vacancy.js";
import Area from "../../_common/classes/Area.js";

import VacancyService from "../../_common/services/VacancyService.js";
import AreaService from "../../_common/services/AreaService.js";
import InteractionService from "../../_common/services/InteractionService.js";

import {
    TIPO,
    pegarToken,
    pegarTipo,
    limparSessao
} from "../../_common/scripts/sessao.js";

const token = pegarToken();
const tipoUsuario = pegarTipo();

const vacancyService = new VacancyService();
const areaService = new AreaService();
const interactionService = new InteractionService();

const headerFilters = document.querySelector("#headerFilters");
const avatarInitial = document.querySelector("#profileAvatarInitial");
const avatarImage = document.querySelector("#profileAvatarImage");
const loadingPanel = document.querySelector("#dashboardLoading");

const candidateDashboard = document.querySelector("#candidateDashboard");
const candidateVacancyGrid = document.querySelector("#candidateVacancyGrid");
const candidateEmptyState = document.querySelector("#candidateEmptyState");
const candidateFeedback = document.querySelector("#candidateFeedback");
const candidateVacancyCount = document.querySelector("#candidateVacancyCount");

const companyDashboard = document.querySelector("#companyDashboard");
const companyVacancyList = document.querySelector("#companyVacancyList");
const companyEmptyState = document.querySelector("#companyEmptyState");
const companyFeedback = document.querySelector("#companyFeedback");

const vacancyDialog = document.querySelector("#vacancyDialog");
const vacancyForm = document.querySelector("#vacancyForm");
const vacancyAreasContainer = document.querySelector("#vacancyAreas");
const vacancyFormFeedback = document.querySelector("#vacancyFormFeedback");
const vacancyDialogTitle = document.querySelector("#vacancyDialogTitle");
const vacancyIdInput = document.querySelector("#vacancyId");
const btnSaveVacancy = document.querySelector("#btnSaveVacancy");

let areasDisponiveis = [];
let vagasCandidato = [];
let vagasEmpresa = [];
let interessesCandidato = new Set();
let vagasIgnoradasCandidato = new Set();
let vagaEmEdicao = null;

async function inicializarDashboard() {
    if (!token || ![TIPO.CANDIDATO, TIPO.EMPRESA].includes(tipoUsuario)) {
        window.location.href = "../public/login.html";
        return;
    }

    vacancyService.setAuthToken(token);
    areaService.setAuthToken(token);
    interactionService.setAuthToken(token);

    configurarNavegacao();
    configurarAvatar();

    if (tipoUsuario === TIPO.CANDIDATO) {
        candidateDashboard.hidden = false;
        companyDashboard.hidden = true;
        headerFilters.hidden = false;
    } else {
        candidateDashboard.hidden = true;
        companyDashboard.hidden = false;
        headerFilters.hidden = true;
    }

    try {
        await carregarAreas();

        if (tipoUsuario === TIPO.CANDIDATO) {
            montarFiltrosCandidato();
            await carregarVagasCandidato();
        } else {
            await carregarVagasEmpresa();
        }
    } catch (error) {
        console.error("Erro ao inicializar dashboard:", error);

        mostrarFeedback(
            tipoUsuario === TIPO.CANDIDATO ? candidateFeedback : companyFeedback,
            error.message || "Não foi possível carregar o dashboard.",
            "error"
        );
    } finally {
        loadingPanel.hidden = true;
    }
}

function configurarNavegacao() {
    document.querySelector("#btnSair")?.addEventListener("click", () => {
        limparSessao();
        window.location.href = "../public/login.html";
    });

    document.querySelector("#btnPerfil")?.addEventListener("click", () => {
        window.location.href = "./profile.html";
    });

    document.querySelector("#btnChats")?.addEventListener("click", () => {
        window.location.href = "./matches.html";
    });

    document.querySelectorAll("#btnNovaVaga, #btnNovaVagaEmpty").forEach((button) => {
        button.addEventListener("click", abrirFormularioNovaVaga);
    });

    document.querySelector("#btnCloseVacancyDialog")?.addEventListener("click", fecharFormularioVaga);
    document.querySelector("#btnCancelVacancy")?.addEventListener("click", fecharFormularioVaga);
    document.querySelector("#clearVacancyFilters")?.addEventListener("click", limparFiltrosCandidato);

    vacancyForm.addEventListener("submit", salvarVaga);

    vacancyDialog.addEventListener("click", (event) => {
        if (event.target === vacancyDialog) {
            fecharFormularioVaga();
        }
    });
}

function configurarAvatar() {
    const nome =
        localStorage.getItem("name") ||
        localStorage.getItem("full_name") ||
        localStorage.getItem("company_name") ||
        "Usuário";

    const partes = nome.trim().split(/\s+/).filter(Boolean);

    const iniciais = partes.length > 1
        ? partes[0][0] + partes[partes.length - 1][0]
        : (partes[0]?.[0] || "U");

    avatarInitial.textContent = iniciais.toLocaleUpperCase("pt-BR");

    const foto = localStorage.getItem("profile_photo") || localStorage.getItem("photo");

    if (!foto) return;

    avatarImage.src = foto;
    avatarImage.hidden = false;
    avatarInitial.hidden = true;

    avatarImage.addEventListener("error", () => {
        avatarImage.hidden = true;
        avatarInitial.hidden = false;
    }, { once: true });
}

async function carregarAreas() {
    const response = await areaService.list();

    if (response?.type === "error") {
        throw new Error(response.message || "Não foi possível carregar as áreas profissionais.");
    }

    areasDisponiveis = (response?.data || []).map((item) => Area.fromJSON(item));

    renderizarOpcoesDeAreas();
}

function renderizarOpcoesDeAreas(areasSelecionadas = []) {
    vacancyAreasContainer.replaceChildren();

    if (!areasDisponiveis.length) {
        const message = document.createElement("span");
        message.className = "muted-text";
        message.textContent = "Nenhuma área profissional foi cadastrada.";

        vacancyAreasContainer.appendChild(message);
        return;
    }

    const selectedMap = new Map(
        areasSelecionadas.map((area) => [
            Number(area.area_id ?? area.areaId ?? area.id),
            area
        ])
    );

    areasDisponiveis.forEach((area) => {
        const wrapper = document.createElement("div");
        wrapper.className = "area-option";

        const label = document.createElement("label");
        label.className = "area-checkbox-label";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "areaId";
        checkbox.value = String(area.id);
        checkbox.checked = selectedMap.has(area.id);

        const text = document.createElement("span");
        text.textContent = area.name;

        label.append(checkbox, text);
        wrapper.appendChild(label);

        if (area.name.toLocaleLowerCase("pt-BR") === "outras") {
            const custom = document.createElement("input");

            custom.type = "text";
            custom.name = "customArea";
            custom.className = "custom-area-input";
            custom.placeholder = "Informe a área profissional";
            custom.maxLength = 255;
            custom.value = selectedMap.get(area.id)?.custom_area || "";
            custom.hidden = !checkbox.checked;
            custom.disabled = !checkbox.checked;
            custom.setAttribute("aria-label", "Área profissional personalizada");

            checkbox.addEventListener("change", () => {
                custom.hidden = !checkbox.checked;
                custom.disabled = !checkbox.checked;

                if (!checkbox.checked) {
                    custom.value = "";
                }
            });

            wrapper.appendChild(custom);
        }

        vacancyAreasContainer.appendChild(wrapper);
    });
}

function montarFiltrosCandidato() {
    headerFilters.replaceChildren();

    const filters = [
        criarSelectFiltro(
            "filterArea",
            "Área profissional",
            areasDisponiveis.map((area) => ({
                value: area.id,
                label: area.name
            }))
        ),
        criarSelectFiltro(
            "filterWorkModel",
            "Modelo de trabalho",
            [
                { value: "Presencial", label: "Presencial" },
                { value: "Híbrido", label: "Híbrido" },
                { value: "Remoto", label: "Remoto" }
            ]
        ),
        criarSelectFiltro(
            "filterEmployment",
            "Contratação",
            ["CLT", "PJ", "Estágio", "Temporário", "Freelance", "Aprendiz"].map((value) => ({
                value,
                label: value
            }))
        )
    ];

    const location = document.createElement("input");
    location.type = "search";
    location.className = "filter filter-search";
    location.id = "filterLocation";
    location.placeholder = "Localização";
    location.setAttribute("aria-label", "Filtrar por localização");

    location.addEventListener("input", renderizarVagasCandidato);

    filters.forEach((select) => {
        select.addEventListener("change", renderizarVagasCandidato);
    });

    headerFilters.append(...filters, location);
}

function criarSelectFiltro(id, label, options) {
    const select = document.createElement("select");

    select.className = "filter";
    select.id = id;
    select.setAttribute("aria-label", label);

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = label;

    select.appendChild(placeholder);

    options.forEach(({ value, label: optionLabel }) => {
        const option = document.createElement("option");
        option.value = String(value);
        option.textContent = optionLabel;

        select.appendChild(option);
    });

    return select;
}

async function carregarVagasCandidato() {
    candidateVacancyGrid.replaceChildren();

    mostrarFeedback(
        candidateFeedback,
        "Buscando oportunidades disponíveis...",
        "info"
    );

    const [vacancyResponse, likesResponse, passesResponse] = await Promise.all([
        vacancyService.list(),
        interactionService.listCandidateLikes(),
        interactionService.listCandidatePasses()
    ]);

    if (vacancyResponse?.type === "error") {
        throw new Error(vacancyResponse.message || "Não foi possível carregar as vagas.");
    }

    if (likesResponse?.type === "error") {
        throw new Error(likesResponse.message || "Não foi possível consultar seus interesses.");
    }

    if (passesResponse?.type === "error") {
        throw new Error(passesResponse.message || "Não foi possível consultar as vagas dispensadas.");
    }

    vagasCandidato = (vacancyResponse?.data || []).map((item) => Vacancy.fromJSON(item));

    interessesCandidato = new Set(
        (likesResponse?.data || [])
            .map((item) => Number(
                item?.interaction?.vacancy_id ??
                item?.vacancy_id ??
                item?.vacancy?.id
            ))
            .filter((id) => Number.isInteger(id) && id > 0)
    );

    vagasIgnoradasCandidato = new Set(
        (passesResponse?.data || [])
            .map((item) => Number(item?.vacancy_id ?? item?.vacancyId ?? item?.id))
            .filter((id) => Number.isInteger(id) && id > 0)
    );

    candidateFeedback.hidden = true;

    renderizarVagasCandidato();
}

function renderizarVagasCandidato() {
    const areaId = Number(document.querySelector("#filterArea")?.value || 0);
    const workModel = document.querySelector("#filterWorkModel")?.value || "";
    const employment = document.querySelector("#filterEmployment")?.value || "";

    const location = (
        document.querySelector("#filterLocation")?.value || ""
    ).trim().toLocaleLowerCase("pt-BR");

    const filtered = vagasCandidato.filter((vacancy) => {
        const areaOk = !areaId || vacancy.areas.some((area) =>
            Number(area.area_id ?? area.areaId ?? area.id) === areaId
        );

        const modelOk = !workModel || vacancy.workModel === workModel;
        const employmentOk = !employment || vacancy.employmentType === employment;

        const locationText = (
            `${vacancy.location || ""} ${vacancy.companyName || ""}`
        ).toLocaleLowerCase("pt-BR");

        const alreadyEvaluated =
            interessesCandidato.has(vacancy.id) ||
            vagasIgnoradasCandidato.has(vacancy.id);

        return (
            !alreadyEvaluated &&
            areaOk &&
            modelOk &&
            employmentOk &&
            (!location || locationText.includes(location))
        );
    });

    candidateVacancyGrid.replaceChildren();
    candidateVacancyCount.textContent = String(filtered.length);
    candidateEmptyState.hidden = filtered.length > 0;

    // O feed apresenta somente uma oportunidade por vez, como um app de matching.
    if (filtered.length > 0) {
        candidateVacancyGrid.appendChild(criarCardVagaCandidato(filtered[0]));
    }
}

function criarCardVagaCandidato(vacancy) {
    const card = document.createElement("article");
    card.className = "vacancy-card tinder-card";
    card.dataset.vacancyId = String(vacancy.id);

    const header = document.createElement("header");
    header.className = "vacancy-card-header";

    const titleGroup = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = vacancy.title || "Vaga sem título";

    const company = document.createElement("p");
    company.className = "vacancy-company";
    company.textContent = vacancy.companyName || "Empresa MatchWork";

    titleGroup.append(title, company);

    header.append(
        titleGroup,
        criarBadgeStatus(vacancy.status)
    );

    const description = document.createElement("p");
    description.className = "vacancy-description";
    description.textContent = vacancy.description || "Descrição não informada.";

    const details = document.createElement("details");
    details.className = "vacancy-details";

    const summary = document.createElement("summary");
    summary.textContent = "Ver requisitos e benefícios";

    details.appendChild(summary);

    if (vacancy.requirements) {
        details.appendChild(criarBlocoDetalhe("Requisitos", vacancy.requirements));
    }

    if (vacancy.benefits) {
        details.appendChild(criarBlocoDetalhe("Benefícios", vacancy.benefits));
    }

    const schedule = [
        vacancy.workSchedule,
        vacancy.shift,
        vacancy.workload
    ].filter(Boolean).join(" · ");

    if (schedule) {
        details.appendChild(criarBlocoDetalhe("Jornada", schedule));
    }

    const footer = document.createElement("footer");
    footer.className = "vacancy-card-footer tinder-card-footer";

    const date = document.createElement("span");
    date.className = "vacancy-date";
    date.textContent = formatarData(vacancy.createdAt);

    const actions = document.createElement("div");
    actions.className = "candidate-swipe-actions";

    const passButton = document.createElement("button");
    passButton.type = "button";
    passButton.className = "swipe-action swipe-pass";
    passButton.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i><span>Não tenho interesse</span>';
    passButton.addEventListener("click", () => registrarDesinteresse(vacancy, passButton, likeButton));

    const likeButton = document.createElement("button");
    likeButton.type = "button";
    likeButton.className = "swipe-action swipe-like";
    likeButton.innerHTML = '<i class="fa-solid fa-heart" aria-hidden="true"></i><span>Tenho interesse</span>';
    likeButton.addEventListener("click", () => registrarInteresse(vacancy, likeButton, passButton));

    actions.append(passButton, likeButton);
    footer.append(date, actions);

    card.append(
        header,
        criarMetadadosVaga(vacancy),
        description,
        criarTagsAreas(vacancy.areas),
        details,
        footer
    );

    return card;
}

async function registrarInteresse(vacancy, button, alternateButton) {
    button.disabled = true;
    if (alternateButton) alternateButton.disabled = true;
    button.classList.add("is-loading");
    button.querySelector("span").textContent = "Enviando...";

    try {
        const response = await interactionService.registerCandidateLike(vacancy.id);

        if (response?.type === "error") {
            throw new Error(response.message || "Não foi possível registrar seu interesse.");
        }

        interessesCandidato.add(vacancy.id);

        mostrarFeedback(
            candidateFeedback,
            response.message || "Seu interesse foi registrado.",
            "success"
        );

        renderizarVagasCandidato();

    } catch (error) {
        console.error("Erro ao registrar interesse:", error);
        button.disabled = false;
        if (alternateButton) alternateButton.disabled = false;
        button.classList.remove("is-loading");
        button.querySelector("span").textContent = "Tenho interesse";
        mostrarFeedback(candidateFeedback, error.message, "error");
    }
}

async function registrarDesinteresse(vacancy, button, alternateButton) {
    button.disabled = true;
    if (alternateButton) alternateButton.disabled = true;
    button.classList.add("is-loading");
    button.querySelector("span").textContent = "Registrando...";

    try {
        const response = await interactionService.registerCandidatePass(vacancy.id);

        if (response?.type === "error") {
            throw new Error(response.message || "Não foi possível dispensar esta vaga.");
        }

        vagasIgnoradasCandidato.add(vacancy.id);
        renderizarVagasCandidato();

    } catch (error) {
        console.error("Erro ao dispensar vaga:", error);
        button.disabled = false;
        if (alternateButton) alternateButton.disabled = false;
        button.classList.remove("is-loading");
        button.querySelector("span").textContent = "Não tenho interesse";
        mostrarFeedback(candidateFeedback, error.message, "error");
    }
}

function limparFiltrosCandidato() {
    [
        "#filterArea",
        "#filterWorkModel",
        "#filterEmployment",
        "#filterLocation"
    ].forEach((selector) => {
        const element = document.querySelector(selector);

        if (element) {
            element.value = "";
        }
    });

    renderizarVagasCandidato();
}

async function carregarVagasEmpresa() {
    companyVacancyList.replaceChildren();

    mostrarFeedback(
        companyFeedback,
        "Carregando suas vagas...",
        "info"
    );

    const response = await vacancyService.listByCompany();

    if (response?.type === "error") {
        throw new Error(response.message || "Não foi possível carregar suas vagas.");
    }

    vagasEmpresa = (response?.data || []).map((item) => Vacancy.fromJSON(item));

    companyFeedback.hidden = true;

    atualizarIndicadoresEmpresa();
    renderizarVagasEmpresa();
}

function atualizarIndicadoresEmpresa() {
    document.querySelector("#statTotal").textContent = String(vagasEmpresa.length);

    document.querySelector("#statActive").textContent = String(
        vagasEmpresa.filter((item) => item.status === "active").length
    );

    document.querySelector("#statClosed").textContent = String(
        vagasEmpresa.filter((item) => item.status === "closed").length
    );
}

function renderizarVagasEmpresa() {
    companyVacancyList.replaceChildren();
    companyEmptyState.hidden = vagasEmpresa.length > 0;

    vagasEmpresa.forEach((vacancy) => {
        const card = document.createElement("article");
        card.className = "company-vacancy-card";

        const header = document.createElement("header");
        header.className = "company-vacancy-header";

        const title = document.createElement("h3");
        title.textContent = vacancy.title || "Vaga sem título";

        header.append(
            title,
            criarBadgeStatus(vacancy.status)
        );

        const description = document.createElement("p");
        description.className = "vacancy-description";
        description.textContent = vacancy.description || "Sem descrição.";

        const actions = document.createElement("footer");
        actions.className = "company-vacancy-actions";

        const editButton = criarBotao("Editar", "btn-secondary", "fa-pen");

        editButton.addEventListener("click", () => {
            abrirFormularioEdicao(vacancy);
        });

        actions.appendChild(editButton);

        if (vacancy.status !== "closed") {
            const closeButton = criarBotao(
                "Encerrar vaga",
                "btn-danger-outline",
                "fa-ban"
            );

            closeButton.addEventListener("click", () => {
                encerrarVaga(vacancy, closeButton);
            });

            actions.appendChild(closeButton);
        }

        card.append(
            header,
            description,
            criarMetadadosVaga(vacancy),
            criarTagsAreas(vacancy.areas),
            actions
        );

        companyVacancyList.appendChild(card);
    });
}

async function encerrarVaga(vacancy, button) {
    const confirmed = window.confirm(
        `Deseja encerrar a vaga "${vacancy.title}"? Ela deixará de aparecer para os candidatos.`
    );

    if (!confirmed) return;

    button.disabled = true;
    button.textContent = "Encerrando...";

    try {
        const response = await vacancyService.delete(vacancy.id);

        if (response?.type === "error") {
            throw new Error(response.message || "Não foi possível encerrar a vaga.");
        }

        mostrarFeedback(
            companyFeedback,
            response.message || "Vaga encerrada.",
            "success"
        );

        await carregarVagasEmpresa();

    } catch (error) {
        console.error("Erro ao encerrar vaga:", error);

        mostrarFeedback(companyFeedback, error.message, "error");

        button.disabled = false;
        button.textContent = "Encerrar vaga";
    }
}

function abrirFormularioNovaVaga() {
    vagaEmEdicao = null;

    vacancyForm.reset();
    vacancyIdInput.value = "";

    vacancyDialogTitle.textContent = "Publicar nova vaga";
    btnSaveVacancy.textContent = "Publicar vaga";
    vacancyFormFeedback.hidden = true;

    renderizarOpcoesDeAreas();

    vacancyDialog.showModal();
}

function abrirFormularioEdicao(vacancy) {
    vagaEmEdicao = vacancy;

    vacancyForm.reset();
    vacancyIdInput.value = String(vacancy.id);

    vacancyDialogTitle.textContent = "Editar vaga";
    btnSaveVacancy.textContent = "Salvar alterações";
    vacancyFormFeedback.hidden = true;

    const fields = [
        "title",
        "description",
        "requirements",
        "salary_offer",
        "workload",
        "work_schedule",
        "shift",
        "work_model",
        "employment_type",
        "location",
        "benefits"
    ];

    fields.forEach((field) => {
        const input = vacancyForm.elements.namedItem(field);

        if (input) {
            input.value = vacancy[field] ?? vacancy[snakeToCamel(field)] ?? "";
        }
    });

    renderizarOpcoesDeAreas(vacancy.areas);

    vacancyDialog.showModal();
}

function fecharFormularioVaga() {
    vacancyDialog.close();
    vacancyForm.reset();

    vagaEmEdicao = null;
    vacancyFormFeedback.hidden = true;
}

async function salvarVaga(event) {
    event.preventDefault();

    vacancyFormFeedback.hidden = true;

    const payload = coletarDadosFormulario();

    if (!validarDadosVaga(payload)) {
        return;
    }

    const editing = Boolean(vagaEmEdicao);

    btnSaveVacancy.disabled = true;
    btnSaveVacancy.textContent = editing ? "Salvando..." : "Publicando...";

    try {
        const response = editing
            ? await vacancyService.update(vagaEmEdicao.id, payload)
            : await vacancyService.register(payload);

        if (response?.type === "error") {
            throw new Error(response.message || "Não foi possível salvar a vaga.");
        }

        fecharFormularioVaga();

        mostrarFeedback(
            companyFeedback,
            response.message || "Vaga salva com sucesso.",
            "success"
        );

        await carregarVagasEmpresa();

    } catch (error) {
        console.error("Erro ao salvar vaga:", error);

        vacancyFormFeedback.textContent =
            error.message || "Não foi possível salvar a vaga.";

        vacancyFormFeedback.hidden = false;

    } finally {
        btnSaveVacancy.disabled = false;
        btnSaveVacancy.textContent = editing ? "Salvar alterações" : "Publicar vaga";
    }
}

function coletarDadosFormulario() {
    const formData = new FormData(vacancyForm);

    const fields = [
        "title",
        "description",
        "requirements",
        "salary_offer",
        "workload",
        "work_schedule",
        "shift",
        "work_model",
        "employment_type",
        "location",
        "benefits"
    ];

    const payload = {};

    fields.forEach((field) => {
        payload[field] = String(formData.get(field) || "").trim();
    });

    payload.areas = Array.from(
        vacancyAreasContainer.querySelectorAll('input[name="areaId"]:checked')
    ).map((checkbox) => {
        const customInput = checkbox
            .closest(".area-option")
            ?.querySelector('input[name="customArea"]');

        return {
            area_id: Number(checkbox.value),
            custom_area: customInput?.value.trim() || ""
        };
    });

    return payload;
}

function validarDadosVaga(payload) {
    if (!payload.title || !payload.description) {
        return mostrarErroFormulario("Preencha o título e a descrição da vaga.");
    }

    if (!payload.areas.length) {
        return mostrarErroFormulario("Selecione pelo menos uma área profissional.");
    }

    const other = areasDisponiveis.find(
        (area) => area.name.toLocaleLowerCase("pt-BR") === "outras"
    );

    const selectedOther = other && payload.areas.find(
        (area) => area.area_id === other.id
    );

    if (selectedOther && !selectedOther.custom_area) {
        return mostrarErroFormulario('Informe a área personalizada ao selecionar "Outras".');
    }

    return true;
}

function criarMetadadosVaga(vacancy) {
    const meta = document.createElement("div");
    meta.className = "vacancy-meta";

    [
        vacancy.location,
        vacancy.workModel,
        vacancy.employmentType,
        vacancy.workload,
        vacancy.salaryOffer
    ]
        .filter(Boolean)
        .forEach((value) => {
            const item = document.createElement("span");
            item.className = "meta-item";
            item.textContent = value;

            meta.appendChild(item);
        });

    return meta;
}

function criarTagsAreas(areas = []) {
    const container = document.createElement("div");
    container.className = "vacancy-area-tags";

    areas.forEach((area) => {
        const tag = document.createElement("span");
        tag.className = "vacancy-area-tag";

        tag.textContent =
            area.display_name ||
            area.area_name ||
            area.name ||
            area.custom_area ||
            "Área";

        container.appendChild(tag);
    });

    return container;
}

function criarBadgeStatus(status) {
    const badge = document.createElement("span");

    badge.className = `status-badge status-${status || "active"}`;

    badge.textContent = ({
        active: "Ativa",
        paused: "Pausada",
        closed: "Encerrada"
    })[status] || "Status não informado";

    return badge;
}

function criarBlocoDetalhe(title, text) {
    const wrapper = document.createElement("div");
    wrapper.className = "vacancy-detail-block";

    const heading = document.createElement("strong");
    heading.textContent = title;

    const paragraph = document.createElement("p");
    paragraph.textContent = text;

    wrapper.append(heading, paragraph);

    return wrapper;
}

function criarBotao(text, className, iconName) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;

    const icon = document.createElement("i");
    icon.className = `fa-solid ${iconName}`;

    button.append(
        icon,
        document.createTextNode(` ${text}`)
    );

    return button;
}

function mostrarFeedback(element, message, type = "info") {
    element.textContent = message;
    element.className = `dashboard-feedback feedback-${type}`;
    element.hidden = false;
}

function mostrarErroFormulario(message) {
    vacancyFormFeedback.textContent = message;
    vacancyFormFeedback.hidden = false;

    return false;
}

function formatarData(value) {
    if (!value) return "";

    const date = new Date(String(value).replace(" ", "T"));

    return Number.isNaN(date.getTime())
        ? ""
        : `Publicada em ${date.toLocaleDateString("pt-BR")}`;
}

function snakeToCamel(value) {
    return value.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

inicializarDashboard();
