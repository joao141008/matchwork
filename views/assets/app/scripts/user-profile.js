import UsersService from "../../_common/services/UsersService.js";
import ReportsService from "../../_common/services/ReportsService.js";
import { pegarToken, pegarTipo, TIPO, limparSessao } from "../../_common/scripts/sessao.js";

const token = pegarToken();
let currentType = pegarTipo();
const params = new URLSearchParams(window.location.search);
const targetUserId = Number(params.get("userId"));

const usersService = new UsersService();
const reportsService = new ReportsService();

const loading = document.querySelector("#publicProfileLoading");
const card = document.querySelector("#publicProfileCard");
const notFound = document.querySelector("#publicProfileNotFound");
const pageFeedback = document.querySelector("#publicProfileFeedback");
const photo = document.querySelector("#publicProfilePhoto");
const initials = document.querySelector("#publicProfileInitials");
const profileType = document.querySelector("#publicProfileType");
const profileName = document.querySelector("#publicProfileName");
const profileLocation = document.querySelector("#publicProfileLocation");
const profileSections = document.querySelector("#publicProfileSections");

const reportButton = document.querySelector("#reportProfileButton");
const reportDialog = document.querySelector("#reportProfileDialog");
const reportForm = document.querySelector("#reportProfileForm");
const reportPersonLabel = document.querySelector("#reportedPersonLabel");
const reportFeedback = document.querySelector("#reportFormFeedback");
const submitReportButton = document.querySelector("#submitReportButton");

let currentUser = null;
let viewedProfile = null;

function isApiError(response) {
    return response?.type === "error"
        || response?.status === "error"
        || Number(response?.code) >= 400;
}

function showPageFeedback(message, type = "success") {
    pageFeedback.textContent = message;
    pageFeedback.className = `page-feedback ${type}`;
    pageFeedback.hidden = false;
}

function showReportFeedback(message, type = "error") {
    reportFeedback.textContent = message;
    reportFeedback.className = `form-feedback ${type}`;
    reportFeedback.hidden = false;
}

function createSection(title, fullWidth = false) {
    const section = document.createElement("section");
    section.className = `profile-section${fullWidth ? " full-width" : ""}`;

    const heading = document.createElement("h2");
    heading.textContent = title;
    section.appendChild(heading);

    return section;
}

function createDetail(label, value) {
    if (value === null || value === undefined || String(value).trim() === "") {
        return null;
    }

    const row = document.createElement("div");
    row.className = "profile-detail";

    const labelElement = document.createElement("span");
    labelElement.className = "profile-detail-label";
    labelElement.textContent = label;

    const valueElement = document.createElement("span");
    valueElement.className = "profile-detail-value";
    valueElement.textContent = String(value);

    row.append(labelElement, valueElement);
    return row;
}

function appendDetails(section, entries) {
    const list = document.createElement("div");
    list.className = "profile-detail-list";

    entries.forEach(([label, value]) => {
        const row = createDetail(label, value);
        if (row) list.appendChild(row);
    });

    if (list.childElementCount) {
        section.appendChild(list);
        profileSections.appendChild(section);
    }
}

function appendDescription(title, value) {
    if (!value || !String(value).trim()) return;

    const section = createSection(title, true);
    const paragraph = document.createElement("p");
    paragraph.textContent = String(value);
    section.appendChild(paragraph);
    profileSections.appendChild(section);
}

function appendAreas(areas) {
    if (!Array.isArray(areas) || areas.length === 0) return;

    const section = createSection("Áreas profissionais", true);
    const list = document.createElement("div");
    list.className = "profile-area-list";

    areas.forEach((area) => {
        const label = area.display_name
            || area.area_name
            || area.name
            || area.custom_area
            || "Área profissional";

        const chip = document.createElement("span");
        chip.className = "profile-area-chip";
        chip.textContent = label;
        list.appendChild(chip);
    });

    section.appendChild(list);
    profileSections.appendChild(section);
}

function appendWebsite(website) {
    if (!website || !String(website).trim()) return null;

    let url;
    try {
        url = new URL(String(website));
    } catch {
        return createDetail("Site", website);
    }

    if (!["http:", "https:"].includes(url.protocol)) {
        return createDetail("Site", website);
    }

    const row = document.createElement("div");
    row.className = "profile-detail";

    const label = document.createElement("span");
    label.className = "profile-detail-label";
    label.textContent = "Site";

    const value = document.createElement("span");
    value.className = "profile-detail-value";

    const link = document.createElement("a");
    link.href = url.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = url.hostname;
    value.appendChild(link);

    row.append(label, value);
    return row;
}

function renderPhoto(photoUrl, name) {
    const fallback = String(name || "MatchWork")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part.charAt(0).toLocaleUpperCase("pt-BR"))
        .join("") || "MW";

    initials.textContent = fallback;
    initials.hidden = false;
    photo.hidden = true;

    if (!photoUrl) return;

    const url = new URL(photoUrl, window.location.href);
    url.searchParams.set("mwv", String(Date.now()));

    photo.onload = () => {
        photo.hidden = false;
        initials.hidden = true;
    };

    photo.onerror = () => {
        photo.hidden = true;
        initials.hidden = false;
    };

    photo.src = url.href;
    photo.alt = `Foto de perfil de ${name}`;
}

function renderProfile(data) {
    const profile = data.profile || {};
    viewedProfile = data;

    const isCandidate = Number(data.type_id) === TIPO.CANDIDATO;
    const name = isCandidate
        ? (profile.full_name || "Candidato")
        : (profile.company_name || "Empresa");

    profileType.textContent = isCandidate ? "CANDIDATO MATCHWORK" : "EMPRESA MATCHWORK";
    profileName.textContent = name;
    profileLocation.textContent = profile.location || "Localização não informada";

    renderPhoto(data.photo_url, name);
    profileSections.replaceChildren();

    if (isCandidate) {
        appendDetails(createSection("Informações profissionais"), [
            ["Área de interesse", profile.interest_area],
            ["Pretensão salarial", profile.salary_expectation],
            ["Turno", profile.shift],
            ["Modelo de trabalho", profile.work_model],
            ["Tipo de contratação", profile.employment_type],
            ["Localização", profile.location]
        ]);
        appendDescription("Sobre o candidato", profile.about);
    } else {
        const section = createSection("Informações da empresa");
        const list = document.createElement("div");
        list.className = "profile-detail-list";

        [
            ["Área de atuação", profile.industry],
            ["Porte", profile.company_size],
            ["Localização", profile.location]
        ].forEach(([label, value]) => {
            const row = createDetail(label, value);
            if (row) list.appendChild(row);
        });

        const websiteRow = appendWebsite(profile.website);
        if (websiteRow) list.appendChild(websiteRow);

        if (list.childElementCount) {
            section.appendChild(list);
            profileSections.appendChild(section);
        }

        appendDescription("Sobre a empresa", profile.description);
    }

    appendAreas(profile.areas);

    if (!profileSections.childElementCount) {
        const section = createSection("Informações");
        const paragraph = document.createElement("p");
        paragraph.textContent = "Este perfil ainda não possui informações adicionais.";
        section.appendChild(paragraph);
        profileSections.appendChild(section);
    }

    const viewedType = Number(data.type_id);
    const viewedUserId = Number(data.user_id ?? data.id);
    const currentUserId = Number(currentUser?.id);
    const canReport =
        viewedUserId > 0 &&
        currentUserId > 0 &&
        viewedUserId !== currentUserId &&
        (
            (currentType === TIPO.EMPRESA && viewedType === TIPO.CANDIDATO) ||
            (currentType === TIPO.CANDIDATO && viewedType === TIPO.EMPRESA)
        );

    reportButton.hidden = !canReport;
    reportButton.disabled = !canReport;
    if (canReport) {
        const actionLabel = currentType === TIPO.EMPRESA
            ? "Denunciar candidato"
            : "Denunciar empresa";
        reportButton.innerHTML = `<i class="fa-solid fa-flag"></i> ${actionLabel}`;
    }
    reportPersonLabel.querySelector("span").textContent = name;
}

async function loadPublicProfile() {
    if (!token || !Number.isInteger(targetUserId) || targetUserId < 1) {
        window.location.href = "../public/login.html";
        return;
    }

    usersService.setAuthToken(token);
    reportsService.setAuthToken(token);

    try {
        const [meResponse, profileResponse] = await Promise.all([
            usersService.me(),
            usersService.publicProfile(targetUserId)
        ]);

        if (isApiError(meResponse)) {
            throw new Error(meResponse?.message || "Sua sessão não está disponível.");
        }
        if (isApiError(profileResponse)) {
            throw new Error(profileResponse?.message || "Não foi possível carregar este perfil.");
        }

        currentUser = meResponse?.data || null;
        if (!currentUser?.id) {
            throw new Error("Não foi possível identificar sua sessão.");
        }

        // A API é a fonte confiável para o tipo de conta: localStorage pode estar antigo.
        currentType = Number(currentUser.type_id ?? currentType);

        renderProfile(profileResponse?.data || {});
        card.hidden = false;
    } catch (error) {
        console.error("Erro ao carregar perfil público:", error);
        notFound.hidden = false;
        showPageFeedback(error.message || "Não foi possível carregar este perfil.", "error");
    } finally {
        loading.hidden = true;
    }
}

document.querySelector("#profileBackButton")?.addEventListener("click", () => {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = "./dashboard.html";
    }
});

function openReportDialog() {
    if (!viewedProfile) {
        showPageFeedback("O perfil ainda não foi carregado. Atualize a página e tente novamente.", "error");
        return;
    }

    if (reportButton.hidden || reportButton.disabled) {
        showPageFeedback("Sua conta não pode denunciar este tipo de perfil.", "error");
        return;
    }

    reportFeedback.hidden = true;
    reportForm.reset();

    // Usa o diálogo nativo quando disponível e mantém um fallback visual.
    try {
        if (typeof reportDialog.showModal === "function") {
            if (!reportDialog.open) {
                reportDialog.showModal();
            }
            return;
        }
    } catch (error) {
        console.warn("Não foi possível abrir o diálogo nativo de denúncia; usando fallback.", error);
    }

    reportDialog.classList.add("report-dialog-fallback-open");
    reportDialog.setAttribute("open", "");
    document.body.classList.add("report-dialog-fallback-active");
}

reportButton.addEventListener("click", (event) => {
    event.preventDefault();
    openReportDialog();
});

function closeReportDialog() {
    try {
        if (reportDialog.open && typeof reportDialog.close === "function") {
            reportDialog.close();
        }
    } catch (error) {
        console.warn("Não foi possível fechar o diálogo nativo de denúncia.", error);
    }

    reportDialog.classList.remove("report-dialog-fallback-open");
    reportDialog.removeAttribute("open");
    document.body.classList.remove("report-dialog-fallback-active");
}

document.querySelector("#closeReportDialog")?.addEventListener("click", closeReportDialog);
document.querySelector("#cancelReportButton")?.addEventListener("click", closeReportDialog);

reportDialog.addEventListener("click", (event) => {
    if (event.target === reportDialog) closeReportDialog();
});

reportDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeReportDialog();
});

reportForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!viewedProfile || !reportForm.reportValidity()) return;

    const reportedUserId = Number(viewedProfile.user_id ?? viewedProfile.id);
    if (!Number.isInteger(reportedUserId) || reportedUserId < 1) {
        showReportFeedback("Não foi possível identificar o usuário deste perfil. Atualize a página e tente novamente.");
        return;
    }

    if (reportedUserId === Number(currentUser?.id)) {
        showReportFeedback("Você não pode denunciar o próprio perfil.");
        return;
    }

    const formData = new FormData(reportForm);
    const payload = {
        reported_user_id: reportedUserId,
        reason: String(formData.get("reason") || "").trim(),
        description: String(formData.get("description") || "").trim()
    };

    if (!payload.reason) {
        showReportFeedback("Selecione o motivo da denúncia.");
        return;
    }

    submitReportButton.disabled = true;
    submitReportButton.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Enviando...';

    try {
        const response = await reportsService.register(payload);
        if (isApiError(response)) {
            throw new Error(response?.message || "Não foi possível registrar a denúncia.");
        }

        closeReportDialog();
        reportForm.reset();
        showPageFeedback(
            "Denúncia enviada. A equipe MatchWork analisará o perfil informado.",
            "success"
        );
    } catch (error) {
        console.error("Erro ao registrar denúncia:", error);
        showReportFeedback(error.message || "Não foi possível registrar a denúncia.");
    } finally {
        submitReportButton.disabled = false;
        submitReportButton.innerHTML = '<i class="fa-solid fa-flag"></i> Enviar denúncia';
    }
});

await loadPublicProfile();
