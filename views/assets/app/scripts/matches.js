
import UserMatch from "../../_common/classes/UserMatch.js";
import UserMatchService from "../../_common/services/UserMatchService.js";
import { pegarToken, pegarTipo, limparSessao } from "../../_common/scripts/sessao.js";

const matchesGrid = document.querySelector(".matches-grid");
const matchTemplate = matchesGrid?.querySelector(".match-card")?.cloneNode(true);
const matchesService = new UserMatchService();

const token = pegarToken();
const userType = pegarTipo();

if (!token || ![3, 4].includes(userType)) {
    window.location.href = "../public/login.html";
} else {
    matchesService.setAuthToken(token);
    carregarMatches();
}

async function carregarMatches() {
    try {
        const response = await matchesService.list();

        if (response?.status !== "success") {
            throw new Error(response?.message || "Não foi possível carregar os matches.");
        }

        const matches = (response.data || []).map((item) => UserMatch.fromJSON(item));
        matchesGrid.replaceChildren();

        if (matches.length === 0) {
            mostrarEstado(
                "Você ainda não possui matches",
                "Quando houver interesse mútuo, os matches aparecerão aqui."
            );
            return;
        }

        matches.forEach((match) => {
            const card = matchTemplate.cloneNode(true);
            const image = card.querySelector(".match-image");
            const imageContainer = card.querySelector(".match-image-container");

            card.dataset.matchId = match.id;
            card.dataset.profileUserId = match.contactUserId || "";
            card.removeAttribute("data-chat");
            card.querySelector(".online-indicator")?.remove();

            const profileLink = card.querySelector(".match-profile-link");
            profileLink.textContent = match.contactName || "Perfil sem nome";

            if (Number.isInteger(Number(match.contactUserId)) && Number(match.contactUserId) > 0) {
                profileLink.dataset.userId = String(match.contactUserId);
                profileLink.disabled = false;
                profileLink.title = `Ver perfil de ${match.contactName || "contato"}`;
            } else {
                profileLink.disabled = true;
                profileLink.title = "Perfil indisponível";
                profileLink.setAttribute("aria-disabled", "true");
            }

            card.querySelector(".match-type").textContent =
                match.contactType === "company" ? "Empresa" : "Candidato";

            card.querySelector(".match-status").textContent =
                formatarData(match.createdAt);

            if (match.contactPhoto) {
                image.alt = `Foto de ${match.contactName}`;

                image.addEventListener(
                    "error",
                    () => mostrarIniciais(imageContainer, match.contactName),
                    { once: true }
                );

                // Atualiza a imagem mesmo quando o navegador já possui uma versão em cache.
                const photoUrl = new URL(match.contactPhoto, window.location.href);
                photoUrl.searchParams.set("mwv", String(Date.now()));
                image.src = photoUrl.href;
            } else {
                mostrarIniciais(imageContainer, match.contactName);
            }

            matchesGrid.appendChild(card);
        });

    } catch (error) {
        console.error("Erro ao carregar matches:", error);

        mostrarEstado(
            "Não foi possível carregar seus matches",
            error.message
        );
    }
}

function mostrarIniciais(container, name) {
    const initials = String(name || "MatchWork")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "MW";

    const avatar = document.createElement("span");

    avatar.className = "match-image";
    avatar.textContent = initials;

    Object.assign(avatar.style, {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#446368",
        color: "#D8AF87",
        fontSize: "2rem",
        fontWeight: "700"
    });

    container.replaceChildren(avatar);
}

function mostrarEstado(title, message) {
    const state = document.createElement("article");
    const heading = document.createElement("h2");
    const description = document.createElement("p");

    state.className = "empty-state";
    state.style.gridColumn = "1 / -1";

    heading.textContent = title;
    description.textContent = message || "Tente novamente mais tarde.";

    state.append(heading, description);
    matchesGrid.replaceChildren(state);
}

function formatarData(value) {
    if (!value) return "Match realizado";

    const date = new Date(String(value).replace(" ", "T"));

    return Number.isNaN(date.getTime())
        ? "Match realizado"
        : `Match realizado em ${date.toLocaleDateString("pt-BR")}`;
}

// Usa o ID real do match. A integração da conversa será feita no próximo passo.
matchesGrid?.addEventListener("click", (event) => {
    const profileLink = event.target.closest(".match-profile-link");

    // O nome abre o perfil público; o restante do card continua abrindo a conversa.
    if (profileLink) {
        event.preventDefault();
        event.stopPropagation();

        const userId = Number(profileLink.dataset.userId);
        if (!Number.isInteger(userId) || userId < 1) {
            return;
        }

        window.location.href = `./user-profile.html?userId=${encodeURIComponent(userId)}`;
        return;
    }

    const card = event.target.closest(".match-card");
    if (!card) return;

    localStorage.setItem("matchSelecionado", card.dataset.matchId);
    window.location.href = `./chat.html?matchId=${encodeURIComponent(card.dataset.matchId)}`;
});

// BOTÕES

document.querySelector("#btn-back")?.addEventListener("click", () => {
    window.location.href = "./dashboard";
});

document.querySelector("#btn-profile")?.addEventListener("click", () => {
    window.location.href = "./profile";
});

document.querySelector("#btn-logout")?.addEventListener("click", () => {
    limparSessao();
    window.location.href = "../public/";
});
