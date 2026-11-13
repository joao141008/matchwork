import UserMatchService from "../../_common/services/UserMatchService.js";
import ConversationService from "../../_common/services/ConversationService.js";
import MessageService from "../../_common/services/MessageService.js";
import UserMatch from "../../_common/classes/UserMatch.js";
import Message from "../../_common/classes/Message.js";
import { pegarToken, pegarTipo, TIPO, limparSessao } from "../../_common/scripts/sessao.js";

const token = pegarToken();
const userType = pegarTipo();
const matchId = Number(new URLSearchParams(window.location.search).get("matchId"));
const matchService = new UserMatchService();
const conversationService = new ConversationService();
const messageService = new MessageService();

const chatMessages = document.querySelector("#chat-messages");
const chatName = document.querySelector("#chat-contact-name");
const chatStatus = document.querySelector("#chat-contact-status");
const chatImage = document.querySelector("#chat-image");
const chatProfileLink = document.querySelector("#chat-profile-link");
const chatForm = document.querySelector("#chat-form");
const chatInput = document.querySelector("#chat-input");
const sendButton = chatForm?.querySelector('button[type="submit"]');

let conversationId = null;
let currentUserId = null;
let contactUserId = null;
let polling = null;
let loadedMessageIds = new Set();

if (!token || ![TIPO.CANDIDATO, TIPO.EMPRESA].includes(userType) || !Number.isInteger(matchId) || matchId < 1) {
    window.location.href = "./matches.html";
} else {
    [matchService, conversationService, messageService].forEach((service) => service.setAuthToken(token));
    inicializarChat();
}

async function inicializarChat() {
    try {
        atualizarEstado("Carregando conversa...");

        const response = await matchService.list();
        if (response?.type === "error") {
            throw new Error(response.message || "Não foi possível carregar seus matches.");
        }

        const rawMatch = (response?.data || []).find((item) => Number(item.id) === matchId);
        if (!rawMatch) {
            throw new Error("Este match não foi encontrado ou não pertence à sua conta.");
        }

        const match = UserMatch.fromJSON(rawMatch);
        currentUserId = userType === TIPO.CANDIDATO ? match.candidateUserId : match.companyUserId;
        contactUserId = Number(match.contactUserId);

        chatName.textContent = match.contactName || "Conversa MatchWork";
        chatStatus.textContent = "Match realizado · você já pode conversar";

        const hasContactProfile = Number.isInteger(contactUserId) && contactUserId > 0;
        chatProfileLink.disabled = !hasContactProfile;
        chatName.disabled = !hasContactProfile;

        if (hasContactProfile) {
            const profileLabel = `Ver perfil de ${match.contactName || "contato"}`;
            chatProfileLink.title = profileLabel;
            chatProfileLink.setAttribute("aria-label", profileLabel);
            chatName.title = profileLabel;
        } else {
            chatProfileLink.title = "Perfil indisponível";
            chatName.title = "Perfil indisponível";
        }

        if (match.contactPhoto) {
            chatImage.alt = `Foto de ${match.contactName}`;
            chatImage.addEventListener(
                "error",
                () => mostrarAvatarFallback(match.contactName),
                { once: true }
            );

            const photoUrl = new URL(match.contactPhoto, window.location.href);
            photoUrl.searchParams.set("mwv", String(Date.now()));
            chatImage.src = photoUrl.href;
        } else {
            mostrarAvatarFallback(match.contactName);
        }

        // A API retorna a conversa existente ou cria uma vinculada ao match.
        const conversationResponse = await conversationService.register({ match_id: matchId });
        if (conversationResponse?.type === "error") {
            throw new Error(conversationResponse.message || "Não foi possível abrir a conversa.");
        }

        conversationId = Number(conversationResponse?.data?.id);
        if (!Number.isInteger(conversationId) || conversationId < 1) {
            throw new Error("A API não retornou um identificador válido para a conversa.");
        }

        await carregarMensagens(true);
        polling = window.setInterval(() => carregarMensagens(false), 4000);
    } catch (error) {
        console.error("Erro ao iniciar chat:", error);
        atualizarEstado(error.message || "Não foi possível abrir o chat.");
    }
}

async function carregarMensagens(initial = false) {
    if (!conversationId) return;

    try {
        const response = await messageService.list(conversationId);
        if (response?.type === "error") {
            throw new Error(response.message || "Não foi possível carregar as mensagens.");
        }

        const messages = (response?.data || []).map((item) => Message.fromJSON(item));
        if (initial) {
            chatMessages.replaceChildren();
            loadedMessageIds.clear();
        }

        const shouldScroll = initial || chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight < 90;
        messages.forEach((message) => {
            if (loadedMessageIds.has(message.id)) return;
            loadedMessageIds.add(message.id);
            chatMessages.appendChild(criarMensagem(message));
        });

        if (!messages.length && initial) {
            const empty = document.createElement("p");
            empty.className = "chat-empty-message";
            empty.textContent = "Esta conversa começou agora. Envie a primeira mensagem!";
            chatMessages.appendChild(empty);
        }

        if (shouldScroll) chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        if (initial) atualizarEstado(error.message);
        console.error("Erro ao atualizar mensagens:", error);
    }
}

function criarMensagem(message) {
    const own = Number(message.senderId) === Number(currentUserId);
    const wrapper = document.createElement("article");
    wrapper.className = `message ${own ? "message-own" : "message-other"}`;

    const content = document.createElement("div");
    content.className = "message-content";

    const text = document.createElement("p");
    text.textContent = message.message;

    const time = document.createElement("span");
    time.className = "message-time";
    time.textContent = formatarHora(message.createdAt);

    content.append(text, time);
    wrapper.appendChild(content);
    return wrapper;
}

async function enviarMensagem(event) {
    event.preventDefault();
    const text = chatInput.value.trim();
    if (!text || !conversationId) return;

    chatInput.disabled = true;
    sendButton.disabled = true;

    try {
        const response = await messageService.register({
            conversation_id: conversationId,
            message: text
        });

        if (response?.type === "error") {
            throw new Error(response.message || "Não foi possível enviar a mensagem.");
        }

        chatInput.value = "";
        await carregarMensagens(false);
        chatInput.focus();
    } catch (error) {
        alert(error.message || "Não foi possível enviar a mensagem.");
    } finally {
        chatInput.disabled = false;
        sendButton.disabled = false;
    }
}

function atualizarEstado(message) {
    chatMessages.replaceChildren();
    const state = document.createElement("p");
    state.className = "chat-empty-message";
    state.textContent = message;
    chatMessages.appendChild(state);
}

function mostrarAvatarFallback(name) {
    const initials = String(name || "MW").trim().split(/\s+/).slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase()).join("") || "MW";
    const fallback = document.createElement("span");
    fallback.className = "chat-avatar-fallback";
    fallback.textContent = initials;
    chatImage.replaceWith(fallback);
}

function formatarHora(value) {
    if (!value) return "Agora";
    const date = new Date(String(value).replace(" ", "T"));
    return Number.isNaN(date.getTime()) ? "Agora" : date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function abrirPerfilDoContato() {
    if (!Number.isInteger(contactUserId) || contactUserId < 1) {
        return;
    }

    window.location.href = `./user-profile.html?userId=${encodeURIComponent(contactUserId)}`;
}

chatProfileLink?.addEventListener("click", abrirPerfilDoContato);
chatName?.addEventListener("click", abrirPerfilDoContato);
chatForm?.addEventListener("submit", enviarMensagem);

document.querySelector("#btn-back")?.addEventListener("click", () => {
    if (polling) window.clearInterval(polling);
    window.location.href = "./matches.html";
});

document.querySelector("#btn-logout")?.addEventListener("click", () => {
    if (polling) window.clearInterval(polling);
    limparSessao();
    window.location.href = "../public/login.html";
});

window.addEventListener("beforeunload", () => {
    if (polling) window.clearInterval(polling);
});
