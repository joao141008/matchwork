import InteractionService from "../../_common/services/InteractionService.js";
import UserMatchService from "../../_common/services/UserMatchService.js";
import { pegarToken, pegarTipo, TIPO, limparSessao } from "../../_common/scripts/sessao.js";

const token = pegarToken();
const type = pegarTipo();
const list = document.querySelector("#interestedList");
const empty = document.querySelector("#interestedEmpty");
const feedback = document.querySelector("#interestedFeedback");
const interactionService = new InteractionService();
const matchesService = new UserMatchService();

if (!token || type !== TIPO.EMPRESA) {
    window.location.href = "../public/login.html";
} else {
    interactionService.setAuthToken(token);
    matchesService.setAuthToken(token);
    carregarInteressados();
}

async function carregarInteressados() {
    list.replaceChildren(estadoCarregando());
    empty.hidden = true;

    try {
        const [response, matchResponse] = await Promise.all([
            interactionService.listCompanyLikes(),
            matchesService.list()
        ]);

        if (response?.type === "error") {
            throw new Error(response.message || "Não foi possível carregar os candidatos.");
        }
        if (matchResponse?.type === "error") {
            throw new Error(matchResponse.message || "Não foi possível consultar os matches.");
        }

        const vacancies = response?.data || [];
        const matches = matchResponse?.data || [];
        list.replaceChildren();

        let total = 0;
        vacancies.forEach((group) => {
            const candidates = group.interested_candidates || [];
            if (!candidates.length) return;
            total += candidates.length;
            list.appendChild(criarGrupoVaga(group, matches));
        });

        empty.hidden = total > 0;
        if (total === 0) list.replaceChildren();
    } catch (error) {
        console.error("Erro ao carregar candidatos interessados:", error);
        list.replaceChildren();
        mostrarFeedback(error.message, "error");
    }
}

function criarGrupoVaga(group, matches) {
    const vacancy = group.vacancy || {};
    const candidates = group.interested_candidates || [];

    const section = document.createElement("section");
    section.className = "vacancy-group";

    const header = document.createElement("header");
    header.className = "vacancy-group-header";

    const heading = document.createElement("div");
    const title = document.createElement("h2");
    title.textContent = vacancy.title || "Vaga sem título";
    const description = document.createElement("p");
    description.textContent = [vacancy.location, vacancy.work_model, vacancy.employment_type]
        .filter(Boolean).join(" · ") || "Oportunidade publicada pela sua empresa";
    heading.append(title, description);

    const count = document.createElement("span");
    count.className = "candidate-count";
    count.textContent = `${candidates.length} interessado${candidates.length === 1 ? "" : "s"}`;
    header.append(heading, count);

    const grid = document.createElement("div");
    grid.className = "candidate-grid";
    candidates.forEach((item) => grid.appendChild(criarCardCandidato(item, vacancy, matches)));

    section.append(header, grid);
    return section;
}

function criarCardCandidato(item, vacancy, matches) {
    const candidate = item.candidate || {};
    const vacancyId = Number(vacancy.id);
    const userId = Number(candidate.user_id);
    const existingMatch = matches.find((match) =>
        Number(match.candidate_user_id ?? match.candidateUserId) === userId &&
        Number(match.vacancy_id ?? match.vacancyId) === vacancyId
    );
    const matched = Boolean(existingMatch);

    const card = document.createElement("article");
    card.className = "candidate-card";

    const header = document.createElement("header");
    header.className = "candidate-header";

    const fallback = iniciais(candidate.full_name);
    let avatar;
    if (candidate.photo) {
        avatar = document.createElement("img");
        avatar.className = "candidate-avatar";
        avatar.alt = `Foto de ${candidate.full_name || "candidato"}`;
        avatar.src = candidate.photo;
        avatar.addEventListener("error", () => {
            avatar.replaceWith(criarIniciais(fallback));
        }, { once: true });
    } else {
        avatar = criarIniciais(fallback);
    }

    const title = document.createElement("div");
    title.className = "candidate-title";
    const name = document.createElement("h3");
    const profileLink = document.createElement(candidate.user_id ? "a" : "span");
    profileLink.textContent = candidate.full_name || "Candidato sem nome";

    if (candidate.user_id) {
        profileLink.href = `./user-profile.html?userId=${encodeURIComponent(candidate.user_id)}`;
        profileLink.className = "candidate-profile-link";
        profileLink.setAttribute("aria-label", `Ver perfil de ${candidate.full_name || "candidato"}`);
        profileLink.title = "Ver perfil do candidato";
    }

    name.appendChild(profileLink);

    const location = document.createElement("p");
    location.textContent = candidate.location || "Localização não informada";
    title.append(name, location);
    header.append(avatar, title);

    const about = document.createElement("p");
    about.className = "candidate-about";
    about.textContent = candidate.about || "Este candidato ainda não adicionou uma apresentação.";

    const meta = document.createElement("div");
    meta.className = "candidate-meta";
    [candidate.salary_expectation, candidate.work_schedule, candidate.shift,
        candidate.work_model, candidate.employment_type]
        .filter(Boolean)
        .forEach((value) => {
            const tag = document.createElement("span");
            tag.textContent = value;
            meta.appendChild(tag);
        });

    const areas = document.createElement("div");
    areas.className = "candidate-areas";
    (candidate.areas || []).forEach((area) => {
        const tag = document.createElement("span");
        tag.className = "candidate-area";
        tag.textContent = area.display_name || area.area_name || area.name || area.custom_area || "Área";
        areas.appendChild(tag);
    });

    const action = document.createElement("button");
    action.type = "button";
    action.className = "btn-primary candidate-action";

    if (matched) {
        action.textContent = "Abrir conversa";
        action.addEventListener("click", () => {
            window.location.href = `./chat.html?matchId=${encodeURIComponent(existingMatch.id)}`;
        });
    } else if (item.company_liked) {
        action.textContent = "Interesse enviado";
        action.disabled = true;
    } else if (vacancy.status !== "active") {
        action.textContent = "Vaga encerrada";
        action.disabled = true;
    } else {
        action.innerHTML = '<i class="fa-solid fa-heart"></i> Tenho interesse';
        action.addEventListener("click", () => demonstrarInteresse(vacancyId, userId, action));
    }

    card.append(header, about, meta, areas, action);
    return card;
}

async function demonstrarInteresse(vacancyId, candidateUserId, button) {
    button.disabled = true;
    button.textContent = "Enviando interesse...";

    try {
        const response = await interactionService.registerCompanyLike(vacancyId, candidateUserId);
        if (response?.type === "error") {
            throw new Error(response.message || "Não foi possível demonstrar interesse.");
        }

        mostrarFeedback("Match realizado! Agora vocês podem conversar. Acesse Meus matches para abrir o chat.", "success");
        button.textContent = "Match realizado!";
        button.disabled = true;

        const group = button.closest(".vacancy-group");
        const link = document.createElement("a");
        link.className = "btn-outline";
        link.href = "./matches.html";
        link.textContent = "Abrir meus matches";
        link.style.marginTop = "8px";
        button.after(link);
    } catch (error) {
        mostrarFeedback(error.message, "error");
        button.disabled = false;
        button.textContent = "Tenho interesse";
    }
}

function estadoCarregando() {
    const state = document.createElement("div");
    state.className = "loading-state";
    state.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Carregando candidatos...';
    return state;
}

function mostrarFeedback(message, type = "success") {
    feedback.textContent = message;
    feedback.className = `feedback ${type}`;
    feedback.hidden = false;
}

function iniciais(name) {
    return String(name || "MW").trim().split(/\s+/).slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase()).join("") || "MW";
}

function criarIniciais(value) {
    const element = document.createElement("span");
    element.className = "candidate-avatar";
    element.textContent = value;
    return element;
}
