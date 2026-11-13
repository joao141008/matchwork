import UsersService from "../../_common/services/UsersService.js";
import CandidateService from "../../_common/services/CandidateService.js";
import CompanyService from "../../_common/services/CompanyService.js";
import AreaService from "../../_common/services/AreaService.js";
import QuestionService from "../../_common/services/QuestionService.js";
import { pegarToken, pegarTipo, limparSessao, salvarSessao, TIPO } from "../../_common/scripts/sessao.js";

const tabs = document.querySelectorAll(".tab");
const contents = document.querySelectorAll(".tab-content");
const btnBack = document.getElementById("btn-back");
const btnMatches = document.getElementById("btn-matches");
const btnLogout = document.getElementById("btn-logout");
const profileForm = document.getElementById("profile-edit-form");
const editFields = document.getElementById("profile-edit-fields");
const supportForm = document.getElementById("support-form");
const supportHistory = document.getElementById("support-history");
const profileFeedback = document.getElementById("profile-feedback");
const profilePhoto = document.getElementById("profile-photo");
const photoInput = document.getElementById("profile-photo-input");
const photoBtn = document.querySelector(".photo-btn");
const photoPlaceholder = "../assets/app/images/icon-icons.png";

const token = pegarToken();
let tokenAtual = token;
const usersService = new UsersService();
const candidateService = new CandidateService();
const companyService = new CompanyService();
const areaService = new AreaService();
const questionService = new QuestionService();
const services = [usersService, candidateService, companyService, areaService, questionService];

if (!token || ![TIPO.CANDIDATO, TIPO.EMPRESA].includes(pegarTipo())) {
    window.location.href = "../public/login.html";
} else {
    services.forEach(service => service.setAuthToken(token));
}

let currentUser = null;
let currentProfile = null;
let availableAreas = [];
let currentPhotoUrl = null;

function escapeHTML(value = "") {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function showFeedback(message, type = "success") {
    if (!profileFeedback) return;
    profileFeedback.textContent = message;
    profileFeedback.className = `profile-feedback ${type}`;
    profileFeedback.hidden = false;
}

function setPhoto(url) {
    currentPhotoUrl = url || null;
    if (!profilePhoto) return;

    if (!currentPhotoUrl) {
        profilePhoto.src = photoPlaceholder;
        profilePhoto.alt = "Imagem padrão do perfil";
        return;
    }

    const versionedUrl = new URL(currentPhotoUrl, window.location.href);
    versionedUrl.searchParams.set("mwv", String(Date.now()));
    profilePhoto.src = versionedUrl.href;
    profilePhoto.alt = "Foto de perfil";
}

function activateTab(tabName) {
    tabs.forEach(tab => tab.classList.toggle("active", tab.dataset.tab === tabName));
    contents.forEach(content => content.classList.toggle("active", content.id === tabName));
}

tabs.forEach(tab => tab.addEventListener("click", () => activateTab(tab.dataset.tab)));

btnBack?.addEventListener("click", () => window.history.back());
btnMatches?.addEventListener("click", () => window.location.href = "./matches");
btnLogout?.addEventListener("click", () => {
    limparSessao();
    localStorage.removeItem("email");
    localStorage.removeItem("name");
    window.location.href = "../public/login.html";
});

function displayAreaNames(areas = []) {
    if (!Array.isArray(areas) || !areas.length) return "Não informado";
    return areas.map(area => area.display_name || area.area_name || area.custom_area || area.name || "").filter(Boolean).join(", ") || "Não informado";
}

function renderCandidateInfo(candidate) {
    const areas = displayAreaNames(candidate.areas);
    document.getElementById("profile-info-cards").innerHTML = `
      <article class="card">
        <h2>Dados pessoais</h2>
        <p><strong>Nome:</strong> ${escapeHTML(candidate.full_name || "Não informado")}</p>
        <p><strong>E-mail:</strong> ${escapeHTML(currentUser.email || "Não informado")}</p>
        <p><strong>CPF:</strong> ${escapeHTML(candidate.cpf || "Não informado")}</p>
        <p><strong>Localização:</strong> ${escapeHTML(candidate.location || "Não informado")}</p>
      </article>
      <article class="card">
        <h2>Preferências profissionais</h2>
        <p><strong>Área principal:</strong> ${escapeHTML(candidate.interest_area || "Não informado")}</p>
        <p><strong>Áreas selecionadas:</strong> ${escapeHTML(areas)}</p>
        <p><strong>Expectativa salarial:</strong> ${escapeHTML(candidate.salary_expectation || "Não informado")}</p>
        <p><strong>Turno:</strong> ${escapeHTML(candidate.shift || "Não informado")}</p>
        <p><strong>Modelo de trabalho:</strong> ${escapeHTML(candidate.work_model || "Não informado")}</p>
        <p><strong>Tipo de contratação:</strong> ${escapeHTML(candidate.employment_type || "Não informado")}</p>
      </article>
      <article class="card">
        <h2>Sobre</h2>
        <p class="profile-about">${escapeHTML(candidate.about || "Você ainda não adicionou uma descrição ao seu perfil.")}</p>
      </article>`;
}

function renderCompanyInfo(company) {
    document.getElementById("profile-info-cards").innerHTML = `
      <article class="card">
        <h2>Dados da empresa</h2>
        <p><strong>Nome:</strong> ${escapeHTML(company.company_name || "Não informado")}</p>
        <p><strong>E-mail:</strong> ${escapeHTML(currentUser.email || "Não informado")}</p>
        <p><strong>CNPJ:</strong> ${escapeHTML(company.cnpj || "Não informado")}</p>
        <p><strong>Localização:</strong> ${escapeHTML(company.location || "Não informado")}</p>
      </article>
      <article class="card">
        <h2>Informações institucionais</h2>
        <p><strong>Área de atuação:</strong> ${escapeHTML(company.industry || "Não informado")}</p>
        <p><strong>Áreas selecionadas:</strong> ${escapeHTML(displayAreaNames(company.areas))}</p>
        <p><strong>Porte:</strong> ${escapeHTML(company.company_size || "Não informado")}</p>
        <p><strong>Site:</strong> ${company.website ? `<a href="${escapeHTML(company.website)}" target="_blank" rel="noopener noreferrer">${escapeHTML(company.website)}</a>` : "Não informado"}</p>
      </article>
      <article class="card">
        <h2>Sobre a empresa</h2>
        <p class="profile-about">${escapeHTML(company.description || "A empresa ainda não adicionou uma descrição.")}</p>
      </article>`;
}

function renderAreaSelect(selectedAreas = []) {
    const selectedIds = new Set(selectedAreas.map(area => String(area.area_id ?? area.areaId)));
    const options = availableAreas.map(area => `
      <option value="${Number(area.id)}" ${selectedIds.has(String(area.id)) ? "selected" : ""}>${escapeHTML(area.name)}</option>
    `).join("");
    const custom = selectedAreas.find(area => (area.area_name || "").toLowerCase() === "outras" || String(area.area_id) === String(availableAreas.find(item => item.name === "Outras")?.id));
    return `
      <label for="profile-areas">Áreas de atuação / interesse</label>
      <select id="profile-areas" name="areas" multiple size="5">${options}</select>
      <small class="field-hint">Use Ctrl (Windows) ou Command (Mac) para selecionar mais de uma área.</small>
      <div id="profile-custom-area-wrap" class="custom-area-wrap" ${custom ? "" : "hidden"}>
        <label for="profile-custom-area">Especifique a outra área</label>
        <input id="profile-custom-area" type="text" maxlength="255" value="${escapeHTML(custom?.custom_area || "")}" placeholder="Informe sua área">
      </div>`;
}

function renderEditForm() {
    if (!currentUser || !currentProfile || !editFields) return;
    const isCandidate = Number(currentUser.type_id) === TIPO.CANDIDATO;
    const email = escapeHTML(currentUser.email || "");

    if (isCandidate) {
        const p = currentProfile;
        editFields.innerHTML = `
          <div class="form-grid">
            <div class="form-field"><label for="edit-full-name">Nome completo</label><input id="edit-full-name" name="full_name" type="text" maxlength="255" required value="${escapeHTML(p.full_name)}"></div>
            <div class="form-field"><label for="edit-cpf">CPF</label><input id="edit-cpf" name="cpf" type="text" maxlength="14" required value="${escapeHTML(p.cpf)}"></div>
            <div class="form-field"><label for="edit-email">E-mail</label><input id="edit-email" name="email" type="email" required value="${email}"></div>
            <div class="form-field"><label for="edit-location">Localização</label><input id="edit-location" name="location" type="text" maxlength="255" value="${escapeHTML(p.location)}" placeholder="Cidade, estado"></div>
            <div class="form-field"><label for="edit-interest-area">Área principal de interesse</label><input id="edit-interest-area" name="interest_area" type="text" maxlength="255" required value="${escapeHTML(p.interest_area)}"></div>
            <div class="form-field"><label for="edit-salary">Expectativa salarial</label><input id="edit-salary" name="salary_expectation" type="text" maxlength="100" value="${escapeHTML(p.salary_expectation)}" placeholder="Ex.: A combinar"></div>
            <div class="form-field"><label for="edit-shift">Turno de preferência</label><select id="edit-shift" name="shift">${optionList(["", "Manhã", "Tarde", "Noite", "Integral", "A combinar"], p.shift, "Não tenho preferência")}</select></div>
            <div class="form-field"><label for="edit-work-model">Modelo de trabalho</label><select id="edit-work-model" name="work_model">${optionList(["", "Presencial", "Híbrido", "Remoto"], p.work_model, "Não tenho preferência")}</select></div>
            <div class="form-field"><label for="edit-employment-type">Tipo de contratação</label><select id="edit-employment-type" name="employment_type">${optionList(["", "CLT", "PJ", "Estágio", "Temporário", "Freelance", "Aprendiz"], p.employment_type, "Não tenho preferência")}</select></div>
          </div>
          <div class="form-field">${renderAreaSelect(p.areas || [])}</div>
          <div class="form-field"><label for="edit-about">Sobre você</label><textarea id="edit-about" name="about" rows="5" maxlength="5000" placeholder="Conte um pouco sobre sua experiência e seus objetivos...">${escapeHTML(p.about)}</textarea></div>`;
    } else {
        const p = currentProfile;
        editFields.innerHTML = `
          <div class="form-grid">
            <div class="form-field"><label for="edit-company-name">Nome da empresa</label><input id="edit-company-name" name="company_name" type="text" maxlength="255" required value="${escapeHTML(p.company_name)}"></div>
            <div class="form-field"><label for="edit-cnpj">CNPJ</label><input id="edit-cnpj" name="cnpj" type="text" maxlength="18" required value="${escapeHTML(p.cnpj)}"></div>
            <div class="form-field"><label for="edit-email">E-mail</label><input id="edit-email" name="email" type="email" required value="${email}"></div>
            <div class="form-field"><label for="edit-location">Localização</label><input id="edit-location" name="location" type="text" maxlength="255" value="${escapeHTML(p.location)}" placeholder="Cidade, estado"></div>
            <div class="form-field"><label for="edit-industry">Área de atuação principal</label><input id="edit-industry" name="industry" type="text" maxlength="255" required value="${escapeHTML(p.industry)}"></div>
            <div class="form-field"><label for="edit-company-size">Porte da empresa</label><select id="edit-company-size" name="company_size">${optionList(["", "Microempresa", "Pequena empresa", "Média empresa", "Grande empresa"], p.company_size, "Não informado")}</select></div>
            <div class="form-field form-field-full"><label for="edit-website">Site</label><input id="edit-website" name="website" type="url" maxlength="255" value="${escapeHTML(p.website)}" placeholder="https://www.suaempresa.com.br"></div>
          </div>
          <div class="form-field">${renderAreaSelect(p.areas || [])}</div>
          <div class="form-field"><label for="edit-description">Descrição da empresa</label><textarea id="edit-description" name="description" rows="5" maxlength="5000" placeholder="Apresente sua empresa...">${escapeHTML(p.description)}</textarea></div>`;
    }

    const areaSelect = document.getElementById("profile-areas");
    areaSelect?.addEventListener("change", toggleCustomAreaField);
    toggleCustomAreaField();
}

function optionList(values, selected, placeholder) {
    return values.map(value => {
        const label = value || placeholder;
        return `<option value="${escapeHTML(value)}" ${String(value) === String(selected ?? "") ? "selected" : ""}>${escapeHTML(label)}</option>`;
    }).join("");
}

function toggleCustomAreaField() {
    const select = document.getElementById("profile-areas");
    const wrap = document.getElementById("profile-custom-area-wrap");
    if (!select || !wrap) return;
    const otherId = availableAreas.find(area => area.name === "Outras")?.id;
    const hasOther = Array.from(select.selectedOptions).some(option => Number(option.value) === Number(otherId));
    wrap.hidden = !hasOther;
    const customInput = document.getElementById("profile-custom-area");
    if (customInput) customInput.required = hasOther;
}

async function loadProfile() {
    if (!tokenAtual) return;
    try {
        const [userResponse, areasResponse] = await Promise.all([usersService.me(), areaService.list()]);
        if (userResponse?.type !== "success" || !userResponse.data) {
            throw new Error(userResponse?.message || "Não foi possível carregar os dados do perfil.");
        }

        currentUser = userResponse.data;
        currentProfile = Number(currentUser.type_id) === TIPO.CANDIDATO
            ? currentUser.candidate
            : currentUser.company;
        availableAreas = areasResponse?.data || [];

        if (!currentProfile) {
            throw new Error("Não encontramos os dados complementares do seu perfil. Verifique se o cadastro foi concluído.");
        }

        const displayName = Number(currentUser.type_id) === TIPO.CANDIDATO
            ? currentProfile.full_name
            : currentProfile.company_name;

        document.getElementById("profile-name").textContent = displayName || "Meu perfil";
        document.getElementById("profile-type").textContent = Number(currentUser.type_id) === TIPO.CANDIDATO ? "Candidato" : "Empresa";
        document.getElementById("profile-location").textContent = currentProfile.location || "Localização não informada";
        setPhoto(currentUser.photo_url || null);

        if (Number(currentUser.type_id) === TIPO.CANDIDATO) renderCandidateInfo(currentProfile);
        else renderCompanyInfo(currentProfile);

        renderEditForm();
        localStorage.setItem("email", currentUser.email || "");
        localStorage.setItem("name", displayName || "");
    } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        showFeedback(error.message || "Não foi possível carregar seu perfil.", "error");
    }
}

function buildAreasPayload() {
    const select = document.getElementById("profile-areas");
    if (!select) return undefined;
    const otherId = availableAreas.find(area => area.name === "Outras")?.id;
    const customArea = document.getElementById("profile-custom-area")?.value.trim() || "";
    return Array.from(select.selectedOptions).map(option => ({
        area_id: Number(option.value),
        custom_area: Number(option.value) === Number(otherId) ? customArea : ""
    }));
}

function responseSucceeded(response) {
    return response?.type === "success" && response?.status === "success";
}

if (profileForm) {
    profileForm.addEventListener("submit", async event => {
        event.preventDefault();
        if (!profileForm.reportValidity()) return;

        const saveButton = document.getElementById("profile-save-button");
        const formData = new FormData(profileForm);
        const newEmail = String(formData.get("email") || "").trim();
        const newPassword = String(formData.get("password") || "");
        const confirmPassword = document.getElementById("profile-confirm-password")?.value || "";

        if (newPassword && newPassword !== confirmPassword) {
            showFeedback("A confirmação da senha não corresponde.", "error");
            return;
        }
        if (newPassword && newPassword.length < 6) {
            showFeedback("A nova senha precisa ter pelo menos 6 caracteres.", "error");
            return;
        }

        const areas = buildAreasPayload();
        const profilePayload = Number(currentUser.type_id) === TIPO.CANDIDATO
            ? {
                full_name: formData.get("full_name"),
                cpf: formData.get("cpf"),
                location: formData.get("location"),
                interest_area: formData.get("interest_area"),
                salary_expectation: formData.get("salary_expectation"),
                shift: formData.get("shift"),
                work_model: formData.get("work_model"),
                employment_type: formData.get("employment_type"),
                about: formData.get("about"),
                ...(areas ? { areas } : {})
            }
            : {
                company_name: formData.get("company_name"),
                cnpj: formData.get("cnpj"),
                location: formData.get("location"),
                website: formData.get("website"),
                company_size: formData.get("company_size"),
                industry: formData.get("industry"),
                description: formData.get("description"),
                ...(areas ? { areas } : {})
            };

        saveButton.disabled = true;
        saveButton.textContent = "Salvando...";

        try {
            const profileResponse = Number(currentUser.type_id) === TIPO.CANDIDATO
                ? await candidateService.update(profilePayload)
                : await companyService.update(profilePayload);

            if (!responseSucceeded(profileResponse)) {
                throw new Error(profileResponse?.message || "Não foi possível salvar os dados do perfil.");
            }

            const accountPayload = {};
            if (newEmail !== currentUser.email) accountPayload.email = newEmail;
            if (newPassword) accountPayload.password = newPassword;

            if (Object.keys(accountPayload).length) {
                const accountResponse = await usersService.update(accountPayload);
                if (!responseSucceeded(accountResponse)) {
                    throw new Error(accountResponse?.message || "Os dados do perfil foram salvos, mas não foi possível atualizar o acesso da conta.");
                }

                if (accountResponse.data?.token) {
                    tokenAtual = accountResponse.data.token;
                    salvarSessao(tokenAtual, currentUser.type_id);
                    services.forEach(service => service.setAuthToken(tokenAtual));
                }
                currentUser.email = accountResponse.data?.email || newEmail;
                localStorage.setItem("email", currentUser.email);
            }

            document.getElementById("profile-new-password").value = "";
            document.getElementById("profile-confirm-password").value = "";
            await loadProfile();
            showFeedback("Seu perfil foi atualizado com sucesso.", "success");
            activateTab("info");
        } catch (error) {
            console.error("Erro ao salvar perfil:", error);
            showFeedback(error.message || "Não foi possível salvar as alterações.", "error");
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = "Salvar alterações";
        }
    });
}

// Foto de perfil: upload pelo endpoint já existente.
photoBtn?.addEventListener("click", () => photoInput?.click());
photoInput?.addEventListener("change", async event => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
        showFeedback("Formato não permitido. Utilize JPEG, PNG ou WebP.", "error");
        photoInput.value = "";
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        showFeedback("A foto deve possuir no máximo 5 MB.", "error");
        photoInput.value = "";
        return;
    }

    const previousPhoto = currentPhotoUrl || photoPlaceholder;
    const tempUrl = URL.createObjectURL(file);
    profilePhoto.src = tempUrl;
    photoBtn.disabled = true;

    try {
        const response = await usersService.uploadPhoto(file);
        if (!responseSucceeded(response) || !response.data?.photo_url) {
            throw new Error(response?.message || "Não foi possível salvar a foto.");
        }
        setPhoto(response.data.photo_url);
        localStorage.setItem("matchwork_profile_photo_updated_at", String(Date.now()));
        showFeedback("Foto de perfil atualizada.", "success");
    } catch (error) {
        profilePhoto.src = previousPhoto;
        showFeedback(error.message || "Não foi possível atualizar a foto.", "error");
    } finally {
        URL.revokeObjectURL(tempUrl);
        photoBtn.disabled = false;
        photoInput.value = "";
    }
});

const requestTypeLabels = {
    question: "Pergunta",
    report: "Denúncia",
    bug: "Problema / Bug",
    suggestion: "Sugestão"
};

function formatDate(value) {
    if (!value) return "Data não informada";
    const date = new Date(String(value).replace(" ", "T"));
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString("pt-BR");
}

async function loadSupportHistory() {
    try {
        const response = await questionService.list();
        if (!responseSucceeded(response)) throw new Error(response?.message || "Não foi possível carregar suas solicitações.");
        const items = response.data || [];
        if (!items.length) {
            supportHistory.innerHTML = '<article class="support-history-empty">Você ainda não enviou solicitações.</article>';
            return;
        }
        supportHistory.innerHTML = items.map(item => `
          <article class="support-history-item">
            <div class="support-history-heading">
              <span class="support-type-label">${escapeHTML(requestTypeLabels[item.request_type] || "Solicitação")}</span>
              <span class="support-status ${item.status === "answered" ? "answered" : "open"}">${item.status === "answered" ? "Respondida" : "Em análise"}</span>
            </div>
            <h3>${escapeHTML(item.subject)}</h3>
            <p>${escapeHTML(item.question)}</p>
            ${item.answer ? `<div class="support-answer"><strong>Resposta da administração</strong><p>${escapeHTML(item.answer)}</p></div>` : ""}
            <small>${escapeHTML(formatDate(item.created_at))}</small>
          </article>`).join("");
    } catch (error) {
        console.error(error);
        supportHistory.innerHTML = '<article class="support-history-empty error">Não foi possível carregar o histórico de solicitações.</article>';
    }
}

if (supportForm) {
    supportForm.addEventListener("submit", async event => {
        event.preventDefault();
        if (!supportForm.reportValidity()) return;

        const submitButton = document.getElementById("support-submit-button");
        const payload = Object.fromEntries(new FormData(supportForm).entries());
        submitButton.disabled = true;
        submitButton.textContent = "Enviando...";

        try {
            const response = await questionService.register(payload);
            if (response?.status !== "success") {
                throw new Error(response?.message || "Não foi possível enviar sua solicitação.");
            }
            supportForm.reset();
            showFeedback("Solicitação enviada à equipe administrativa.", "success");
            await loadSupportHistory();
        } catch (error) {
            console.error("Erro ao enviar suporte:", error);
            showFeedback(error.message || "Não foi possível enviar a solicitação.", "error");
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Enviar solicitação";
        }
    });
}

await loadProfile();
await loadSupportHistory();
