import FaqService from "../../_common/services/FaqService.js";
import QuestionService from "../../_common/services/QuestionService.js";
import { pegarToken, pegarTipo } from "../../_common/scripts/sessao.js";

const faqService = new FaqService();
const questionService = new QuestionService();
const adminToken = pegarToken();

if (!adminToken || Number(pegarTipo()) !== 1) {
  window.location.href = "../public/login.html";
} else {
  faqService.setAuthToken(adminToken);
  questionService.setAuthToken(adminToken);
}

/* =========================================================
   UTILITÁRIOS
========================================================= */

function escapeHTML(value = "") {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toast(message) {
  const element = document.createElement("article");
  element.className = "toast";
  element.textContent = message;
  element.setAttribute("role", "status");
  document.body.appendChild(element);

  window.setTimeout(() => element.remove(), 2600);
}

function formatDate(value) {
  if (!value) return "Data não informada";

  const normalized = String(value).includes("T")
    ? String(value)
    : String(value).replace(" ", "T");

  const date = new Date(normalized);

  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
      });
}

/* =========================================================
   MODAL COMPARTILHADO
========================================================= */

function createModal(title, contentHTML, options = {}) {
  const {
    onSave,
    showActions = true,
    saveLabel = "Salvar",
    cancelLabel = "Fechar",
    busyLabel = "Salvando..."
  } = options;

  const overlay = document.createElement("article");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <article class="modal" role="dialog" aria-modal="true" aria-label="${escapeHTML(title)}">
      <header class="modal-header">
        <h2>${escapeHTML(title)}</h2>
        <button type="button" class="close-modal" aria-label="Fechar">
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </header>

      <section class="modal-body">
        ${contentHTML}
      </section>

      ${
        showActions
          ? `
            <footer class="modal-footer">
              <button type="button" class="cancel">${escapeHTML(cancelLabel)}</button>
              <button type="button" class="save">${escapeHTML(saveLabel)}</button>
            </footer>
          `
          : ""
      }
    </article>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();

  overlay.querySelector(".close-modal").addEventListener("click", close);

  overlay.addEventListener("click", event => {
    if (event.target === overlay) close();
  });

  const cancelButton = overlay.querySelector(".cancel");
  cancelButton?.addEventListener("click", close);

  if (showActions) {
    const saveButton = overlay.querySelector(".save");

    saveButton.addEventListener("click", async () => {
      saveButton.disabled = true;
      const originalLabel = saveButton.textContent;
      saveButton.textContent = busyLabel;

      try {
        const result = onSave ? await onSave(overlay) : true;
        if (result !== false) close();
      } catch (error) {
        console.error("Erro ao salvar modal:", error);
        toast("Não foi possível concluir a operação.");
      } finally {
        if (saveButton.isConnected) {
          saveButton.disabled = false;
          saveButton.textContent = originalLabel;
        }
      }
    });
  }

  const firstField = overlay.querySelector("input, textarea, select");
  firstField?.focus();

  return overlay;
}

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    document.querySelector(".modal-overlay")?.remove();
  }
});

/* =========================================================
   FAQ - LISTAGEM E GERENCIAMENTO
========================================================= */

function setFaqStatus(message) {
  const container = document.querySelector(".faq");
  if (!container) return;

  container.innerHTML = `<p class="faq-status">${escapeHTML(message)}</p>`;
}

function renderFaqItem({ id, faqs_category_id, question, answer }) {
  const container = document.querySelector(".faq");
  if (!container) return;

  container.querySelector(".faq-status")?.remove();

  const item = document.createElement("article");
  item.className = "faqItem";
  if (id) item.dataset.id = String(id);
  if (faqs_category_id) item.dataset.category = String(faqs_category_id);

  const content = document.createElement("article");
  const title = document.createElement("h3");
  title.textContent = question || "";
  const description = document.createElement("p");
  description.textContent = answer || "";
  content.append(title, description);

  const actions = document.createElement("article");
  actions.className = "faq-actions";
  actions.innerHTML = `
    <button type="button" class="faq-action-edit" aria-label="Editar pergunta" title="Editar">
      <i class="fa-solid fa-pen" aria-hidden="true"></i>
    </button>
    <button type="button" class="faq-action-delete" aria-label="Excluir pergunta" title="Excluir">
      <i class="fa-solid fa-trash" aria-hidden="true"></i>
    </button>
  `;

  item.append(content, actions);
  container.appendChild(item);
}

async function loadFaqs() {
  if (!adminToken) return;

  setFaqStatus("Carregando perguntas frequentes...");

  try {
    const response = await faqService.list();

    if (response?.type !== "success") {
      setFaqStatus(response?.message || "Não foi possível carregar as perguntas frequentes.");
      return;
    }

    const faqs = Array.isArray(response.data) ? response.data : [];
    const container = document.querySelector(".faq");
    container.replaceChildren();

    if (!faqs.length) {
      setFaqStatus("Nenhuma pergunta frequente cadastrada.");
      return;
    }

    faqs.forEach(renderFaqItem);
  } catch (error) {
    console.error("Erro ao carregar FAQs:", error);
    setFaqStatus("Erro de conexão ao carregar as perguntas frequentes.");
    toast("Não foi possível carregar as FAQs.");
  }
}

async function loadCategoryOptions(select, selectedId = null) {
  try {
    const response = await faqService.listCategories();
    const categories = Array.isArray(response?.data) ? response.data : [];

    if (!categories.length) {
      select.innerHTML = '<option value="">Nenhuma categoria cadastrada</option>';
      return;
    }

    select.innerHTML = `
      <option value="">Selecione uma categoria</option>
      ${categories.map(category => `
        <option value="${Number(category.id)}">${escapeHTML(category.name)}</option>
      `).join("")}
    `;

    if (selectedId) select.value = String(selectedId);
  } catch (error) {
    console.error("Erro ao carregar categorias de FAQ:", error);
    select.innerHTML = '<option value="">Erro ao carregar categorias</option>';
    toast("Não foi possível carregar as categorias.");
  }
}

function faqFormContent(values = {}) {
  return `
    <label for="faq-category">Categoria</label>
    <select id="faq-category">
      <option value="">Carregando...</option>
    </select>

    <label for="faq-q">Pergunta</label>
    <input id="faq-q" type="text" maxlength="255"
      value="${escapeHTML(values.question || "")}"
      placeholder="Digite a pergunta">

    <label for="faq-a">Resposta</label>
    <textarea id="faq-a" rows="5"
      placeholder="Digite a resposta">${escapeHTML(values.answer || "")}</textarea>
  `;
}

const addFaqButton = document.querySelector(".titulo button");

addFaqButton?.addEventListener("click", () => {
  const modal = createModal("Nova pergunta frequente", faqFormContent(), {
    saveLabel: "Adicionar pergunta",
    busyLabel: "Salvando...",
    onSave: async modalElement => {
      const categoryId = modalElement.querySelector("#faq-category").value;
      const question = modalElement.querySelector("#faq-q").value.trim();
      const answer = modalElement.querySelector("#faq-a").value.trim();

      if (!categoryId || !question || !answer) {
        toast("Preencha a categoria, a pergunta e a resposta.");
        return false;
      }

      const response = await faqService.register({
        faqs_category_id: categoryId,
        question,
        answer
      });

      if (response?.type !== "success") {
        toast(response?.message || "Não foi possível cadastrar a pergunta.");
        return false;
      }

      await loadFaqs();
      toast("Pergunta frequente adicionada.");
    }
  });

  loadCategoryOptions(modal.querySelector("#faq-category"));
});

document.querySelector(".faq")?.addEventListener("click", async event => {
  const item = event.target.closest(".faqItem");
  if (!item) return;

  const faqId = Number(item.dataset.id);
  if (!Number.isInteger(faqId) || faqId < 1) return;

  if (event.target.closest(".faq-action-delete")) {
    const question = item.querySelector("h3")?.textContent || "esta pergunta";

    createModal(
      "Excluir pergunta frequente",
      `<p>Tem certeza de que deseja excluir <strong>${escapeHTML(question)}</strong>?</p>`,
      {
        saveLabel: "Excluir",
        cancelLabel: "Cancelar",
        busyLabel: "Excluindo...",
        onSave: async () => {
          const response = await faqService.delete(faqId);

          if (response?.type !== "success") {
            toast(response?.message || "Não foi possível excluir a pergunta.");
            return false;
          }

          await loadFaqs();
          toast("Pergunta frequente excluída.");
        }
      }
    );
  }

  if (event.target.closest(".faq-action-edit")) {
    const oldQuestion = item.querySelector("h3")?.textContent || "";
    const oldAnswer = item.querySelector("p")?.textContent || "";
    const categoryId = item.dataset.category || "";

    const modal = createModal(
      "Editar pergunta frequente",
      faqFormContent({ question: oldQuestion, answer: oldAnswer }),
      {
        saveLabel: "Salvar alterações",
        busyLabel: "Salvando...",
        onSave: async modalElement => {
          const selectedCategory = modalElement.querySelector("#faq-category").value;
          const question = modalElement.querySelector("#faq-q").value.trim();
          const answer = modalElement.querySelector("#faq-a").value.trim();

          if (!selectedCategory || !question || !answer) {
            toast("Preencha a categoria, a pergunta e a resposta.");
            return false;
          }

          const response = await faqService.update(faqId, {
            faqs_category_id: selectedCategory,
            question,
            answer
          });

          if (response?.type !== "success") {
            toast(response?.message || "Não foi possível atualizar a pergunta.");
            return false;
          }

          await loadFaqs();
          toast("Pergunta frequente atualizada.");
        }
      }
    );

    loadCategoryOptions(modal.querySelector("#faq-category"), categoryId);
  }
});

loadFaqs();

/* =========================================================
   CENTRAL DE SUPORTE
   Os quatro tipos vêm de questions.request_type:
   question, report, suggestion e bug.
========================================================= */

const supportConfig = {
  question: {
    label: "Pergunta",
    plural: "Perguntas",
    icon: "fa-circle-question"
  },
  report: {
    label: "Denúncia",
    plural: "Denúncias",
    icon: "fa-flag"
  },
  suggestion: {
    label: "Sugestão",
    plural: "Sugestões",
    icon: "fa-lightbulb"
  },
  bug: {
    label: "Problema / Bug",
    plural: "Problemas / Bugs",
    icon: "fa-bug"
  }
};

const supportTypeNames = {
  all: "Todas as solicitações",
  question: "Perguntas",
  report: "Denúncias",
  suggestion: "Sugestões",
  bug: "Problemas / Bugs"
};

let supportRequests = [];
let selectedSupportType = "all";
let selectedSupportStatus = "all";
let supportSearchTerm = "";

const supportList = document.getElementById("support-ticket-list");
const supportTabs = document.querySelectorAll(".admin-tab");
const supportSearch = document.getElementById("support-search");
const supportStatusFilter = document.getElementById("support-status-filter");
const supportRefreshButton = document.getElementById("support-refresh-button");

function getRequestType(request) {
  const type = String(request?.request_type || "question").toLowerCase();
  return Object.hasOwn(supportConfig, type) ? type : "question";
}

function isAnswered(request) {
  return String(request?.status || "").toLowerCase() === "answered";
}

function updateSupportCounters() {
  const answered = supportRequests.filter(isAnswered).length;
  const open = supportRequests.length - answered;
  const countByType = Object.fromEntries(
    Object.keys(supportConfig).map(type => [
      type,
      supportRequests.filter(request => getRequestType(request) === type).length
    ])
  );

  const values = {
    "support-stat-total": supportRequests.length,
    "support-stat-open": open,
    "support-stat-answered": answered,
    "support-stat-reports": countByType.report,
    "support-count-all": supportRequests.length,
    "support-count-question": countByType.question,
    "support-count-report": countByType.report,
    "support-count-suggestion": countByType.suggestion,
    "support-count-bug": countByType.bug
  };

  Object.entries(values).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = String(value);
  });
}

function getFilteredRequests() {
  return supportRequests.filter(request => {
    const type = getRequestType(request);
    const answered = isAnswered(request);

    if (selectedSupportType !== "all" && type !== selectedSupportType) {
      return false;
    }

    if (selectedSupportStatus === "open" && answered) return false;
    if (selectedSupportStatus === "answered" && !answered) return false;

    if (supportSearchTerm) {
      const searchable = [
        request.subject,
        request.question,
        request.user_name,
        request.email
      ].join(" ").toLocaleLowerCase("pt-BR");

      if (!searchable.includes(supportSearchTerm)) return false;
    }

    return true;
  });
}

function renderSupportTicket(request) {
  const type = getRequestType(request);
  const config = supportConfig[type];
  const answered = isAnswered(request);
  const name = request.user_name || request.email || "Usuário";
  const message = String(request.question || "");
  const preview = message.length > 220 ? `${message.slice(0, 220)}…` : message;

  return `
    <article class="ticket ${answered ? "is-answered" : "is-open"} type-${type}" data-id="${Number(request.id)}">
      <div class="ticket-type-mark" aria-hidden="true">
        <i class="fa-solid ${config.icon}"></i>
      </div>

      <div class="ticket-main">
        <div class="ticket-topline">
          <span class="ticket-type-badge type-${type}">${config.label}</span>
          <span class="ticket-status-badge ${answered ? "answered" : "open"}">
            <span class="status-dot" aria-hidden="true"></span>
            ${answered ? "Respondida" : "Aguardando resposta"}
          </span>
        </div>

        <h3>${escapeHTML(request.subject || "Solicitação sem assunto")}</h3>

        <div class="ticket-meta">
          <span><i class="fa-regular fa-user" aria-hidden="true"></i>${escapeHTML(name)}</span>
          <span><i class="fa-regular fa-envelope" aria-hidden="true"></i>${escapeHTML(request.email || "E-mail não informado")}</span>
          <span><i class="fa-regular fa-clock" aria-hidden="true"></i>${escapeHTML(formatDate(request.created_at))}</span>
        </div>

        <p class="ticket-preview">${escapeHTML(preview)}</p>
      </div>

      <div class="ticket-actions">
        <button type="button" data-action="view" class="ticket-view-button">
          <i class="fa-regular fa-eye" aria-hidden="true"></i>
          <span>${answered ? "Ver / editar" : "Atender"}</span>
        </button>
        <button type="button" data-action="delete" class="ticket-delete-button" aria-label="Excluir solicitação" title="Excluir solicitação">
          <i class="fa-regular fa-trash-can" aria-hidden="true"></i>
        </button>
      </div>
    </article>
  `;
}

function renderSupportRequests() {
  if (!supportList) return;

  updateSupportCounters();

  const filtered = getFilteredRequests();
  const currentCategory = document.getElementById("support-current-category");
  const resultCount = document.getElementById("support-results-count");

  if (currentCategory) {
    currentCategory.textContent = supportTypeNames[selectedSupportType] || supportTypeNames.all;
  }

  if (resultCount) {
    resultCount.textContent = `${filtered.length} ${filtered.length === 1 ? "solicitação encontrada" : "solicitações encontradas"}`;
  }

  if (!filtered.length) {
    const hasFilters = selectedSupportType !== "all" ||
      selectedSupportStatus !== "all" ||
      supportSearchTerm !== "";

    supportList.innerHTML = `
      <article class="support-empty-state">
        <span class="support-empty-icon"><i class="fa-regular ${hasFilters ? "fa-folder-open" : "fa-inbox"}" aria-hidden="true"></i></span>
        <h3>${hasFilters ? "Nenhuma solicitação encontrada" : "Caixa de entrada vazia"}</h3>
        <p>${hasFilters
          ? "Não há solicitações que correspondam aos filtros selecionados."
          : "Quando alguém enviar uma pergunta, denúncia, sugestão ou problema pelo perfil, a solicitação aparecerá aqui."}</p>
        ${hasFilters ? '<button type="button" id="support-clear-filters">Limpar filtros</button>' : ""}
      </article>
    `;

    document.getElementById("support-clear-filters")?.addEventListener("click", clearSupportFilters);
    return;
  }

  supportList.innerHTML = filtered.map(renderSupportTicket).join("");
}

function clearSupportFilters() {
  selectedSupportType = "all";
  selectedSupportStatus = "all";
  supportSearchTerm = "";

  if (supportSearch) supportSearch.value = "";
  if (supportStatusFilter) supportStatusFilter.value = "all";

  supportTabs.forEach(tab => {
    const active = tab.dataset.tab === "all";
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-pressed", String(active));
  });

  renderSupportRequests();
}

async function loadSupportRequests() {
  if (!supportList || !adminToken) return;

  supportList.setAttribute("aria-busy", "true");
  supportList.innerHTML = `
    <p class="support-list-status">
      <i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
      Carregando solicitações...
    </p>
  `;

  if (supportRefreshButton) {
    supportRefreshButton.disabled = true;
    supportRefreshButton.classList.add("is-loading");
  }

  try {
    const response = await questionService.listAll();

    if (response?.type !== "success") {
      throw new Error(response?.message || "Não foi possível carregar as solicitações.");
    }

    supportRequests = Array.isArray(response.data) ? response.data : [];
    renderSupportRequests();
  } catch (error) {
    console.error("Erro ao carregar a central de suporte:", error);

    supportList.innerHTML = `
      <article class="support-error-state">
        <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
        <h3>Não foi possível carregar as solicitações</h3>
        <p>${escapeHTML(error.message || "Verifique a conexão com o servidor e tente novamente.")}</p>
        <button type="button" id="support-try-again">Tentar novamente</button>
      </article>
    `;

    document.getElementById("support-try-again")?.addEventListener("click", loadSupportRequests);
    toast("Erro ao carregar a central de suporte.");
  } finally {
    supportList.setAttribute("aria-busy", "false");

    if (supportRefreshButton) {
      supportRefreshButton.disabled = false;
      supportRefreshButton.classList.remove("is-loading");
    }
  }
}

/* Troca de categoria */
supportTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    selectedSupportType = tab.dataset.tab || "all";

    supportTabs.forEach(item => {
      const active = item === tab;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });

    renderSupportRequests();
  });
});

/* Busca e filtro de situação */
supportSearch?.addEventListener("input", () => {
  supportSearchTerm = supportSearch.value.trim().toLocaleLowerCase("pt-BR");
  renderSupportRequests();
});

supportStatusFilter?.addEventListener("change", () => {
  selectedSupportStatus = supportStatusFilter.value;
  renderSupportRequests();
});

supportRefreshButton?.addEventListener("click", loadSupportRequests);

/* Abrir, responder, editar resposta e excluir */
supportList?.addEventListener("click", async event => {
  const actionButton = event.target.closest("[data-action]");
  const ticket = actionButton?.closest(".ticket");

  if (!actionButton || !ticket) return;

  const requestId = Number(ticket.dataset.id);
  const request = supportRequests.find(item => Number(item.id) === requestId);

  if (!request) return;

  if (actionButton.dataset.action === "view") {
    const type = getRequestType(request);
    const config = supportConfig[type];
    const answered = isAnswered(request);

    createModal(
      answered ? "Detalhes da solicitação" : "Atender solicitação",
      `
        <div class="support-modal-heading">
          <span class="ticket-type-badge type-${type}">${config.label}</span>
          <span class="ticket-status-badge ${answered ? "answered" : "open"}">
            <span class="status-dot" aria-hidden="true"></span>
            ${answered ? "Respondida" : "Aguardando resposta"}
          </span>
        </div>

        <h3 class="support-modal-subject">${escapeHTML(request.subject || "Solicitação sem assunto")}</h3>

        <div class="support-modal-meta">
          <span><i class="fa-regular fa-user" aria-hidden="true"></i>${escapeHTML(request.user_name || "Usuário")}</span>
          <span><i class="fa-regular fa-envelope" aria-hidden="true"></i>${escapeHTML(request.email || "E-mail não informado")}</span>
          <span><i class="fa-regular fa-calendar" aria-hidden="true"></i>${escapeHTML(formatDate(request.created_at))}</span>
        </div>

        <div class="support-message-box">
          <span class="support-field-label">Mensagem enviada</span>
          <p>${escapeHTML(request.question || "")}</p>
        </div>

        <div class="ticket-modal-field">
          <label for="support-answer-input">${answered ? "Resposta enviada (você pode editá-la)" : "Sua resposta para o usuário"}</label>
          <textarea id="support-answer-input" rows="6" maxlength="5000"
            placeholder="Escreva uma resposta clara e objetiva...">${escapeHTML(request.answer || "")}</textarea>
        </div>
      `,
      {
        saveLabel: answered ? "Salvar alterações" : "Enviar resposta",
        busyLabel: answered ? "Atualizando..." : "Enviando...",
        onSave: async modalElement => {
          const answer = modalElement.querySelector("#support-answer-input").value.trim();

          if (!answer) {
            toast("Escreva uma resposta antes de salvar.");
            return false;
          }

          try {
            const response = await questionService.answer(requestId, answer);

            if (response?.type !== "success") {
              toast(response?.message || "Não foi possível salvar a resposta.");
              return false;
            }

            toast(answered ? "Resposta atualizada com sucesso." : "Resposta enviada ao usuário.");
            await loadSupportRequests();
          } catch (error) {
            console.error("Erro ao responder solicitação:", error);
            toast("Erro de conexão ao enviar a resposta.");
            return false;
          }
        }
      }
    );

    return;
  }

  if (actionButton.dataset.action === "delete") {
    createModal(
      "Excluir solicitação",
      `
        <p>Deseja realmente excluir a solicitação abaixo?</p>
        <div class="support-delete-summary">
          <strong>${escapeHTML(request.subject || "Solicitação sem assunto")}</strong>
          <span>${escapeHTML(supportConfig[getRequestType(request)].label)} • ${escapeHTML(request.user_name || request.email || "Usuário")}</span>
        </div>
        <p class="support-delete-warning">Essa ação não poderá ser desfeita.</p>
      `,
      {
        saveLabel: "Excluir solicitação",
        cancelLabel: "Cancelar",
        busyLabel: "Excluindo...",
        onSave: async () => {
          try {
            const response = await questionService.delete(requestId);

            if (response?.type !== "success") {
              toast(response?.message || "Não foi possível excluir a solicitação.");
              return false;
            }

            toast("Solicitação excluída.");
            await loadSupportRequests();
          } catch (error) {
            console.error("Erro ao excluir solicitação:", error);
            toast("Erro de conexão ao excluir a solicitação.");
            return false;
          }
        }
      }
    );
  }
});

loadSupportRequests();

/* =========================================================
   TOAST
========================================================= */

const toastStyles = document.createElement("style");
toastStyles.textContent = `
.toast {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 100000;
  max-width: min(420px, calc(100vw - 32px));
  padding: 13px 18px;
  border: 1px solid rgba(216, 175, 135, .2);
  border-radius: 12px;
  background: #16232b;
  color: #f4f6f7;
  box-shadow: 0 16px 40px rgba(0, 0, 0, .35);
  font-weight: 650;
  animation: matchwork-toast-in .22s ease-out;
}
@keyframes matchwork-toast-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
`;
document.head.appendChild(toastStyles);
