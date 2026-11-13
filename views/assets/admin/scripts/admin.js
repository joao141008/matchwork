import FaqService from "../../_common/services/FaqService.js";
import QuestionService from "../../_common/services/QuestionService.js";
import AdminDashboardService from "../../_common/services/AdminDashboardService.js";
import ReportsService from "../../_common/services/ReportsService.js";
import { pegarToken, pegarTipo, limparSessao } from "../../_common/scripts/sessao.js";

const faqService = new FaqService();
const questionService = new QuestionService();
const adminDashboardService = new AdminDashboardService();
const reportsService = new ReportsService();
const adminToken = pegarToken();

if (!adminToken || Number(pegarTipo()) !== 1) {
  window.location.href = "../public/login.html";
} else {
  faqService.setAuthToken(adminToken);
  questionService.setAuthToken(adminToken);
  adminDashboardService.setAuthToken(adminToken);
  reportsService.setAuthToken(adminToken);
}

// Mantém a saída administrativa no mesmo canto superior direito do dashboard.
document.getElementById("btnAdminSair")?.addEventListener("click", () => {
  limparSessao();
  window.location.href = "../public/login.html";
});

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
   A central atende perguntas, sugestões e problemas/bugs.
   Denúncias de perfis são tratadas exclusivamente no painel
   de moderação acima, vinculado à tabela reports.
========================================================= */

const supportConfig = {
  question: {
    label: "Pergunta",
    plural: "Perguntas",
    icon: "fa-circle-question"
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
    "support-count-all": supportRequests.length,
    "support-count-question": countByType.question,
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

    const allRequests = Array.isArray(response.data) ? response.data : [];

    // Registros antigos classificados como denúncia deixam de aparecer aqui:
    // denúncias de perfis são acompanhadas no painel de moderação superior.
    supportRequests = allRequests.filter(request =>
      String(request?.request_type || "question").toLowerCase() !== "report"
    );

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


/* =========================================================
   INDICADORES DO PAINEL ADMINISTRATIVO
   Dados reais: matches, candidatos e empresas ativos.
========================================================= */

async function loadAdminDashboardStats() {
  const targets = {
    total_matches: "stat-total-matches",
    total_companies: "stat-total-companies",
    total_candidates: "stat-total-candidates"
  };

  try {
    const response = await adminDashboardService.stats();

    if (response?.type !== "success") {
      throw new Error(response?.message || "Não foi possível carregar os indicadores.");
    }

    const data = response.data || {};

    Object.entries(targets).forEach(([field, elementId]) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.textContent = Number(data[field] || 0).toLocaleString("pt-BR");
      }
    });
  } catch (error) {
    console.error("Erro ao carregar indicadores administrativos:", error);

    Object.values(targets).forEach(elementId => {
      const element = document.getElementById(elementId);
      if (element) element.textContent = "—";
    });

    toast("Não foi possível atualizar os indicadores gerais.");
  }
}

/* =========================================================
   DENÚNCIAS REAIS
   A tabela reports identifica user_id e reported_user_id.
   O gráfico agrupa as denúncias pelo usuário denunciado.
========================================================= */

const reportStatusLabels = {
  pending: "Pendente",
  reviewed: "Em análise",
  resolved: "Resolvida"
};

let adminReports = [];
let selectedReportStatus = "all";

const reportChart = document.getElementById("reports-target-chart");
const reportRecordList = document.getElementById("reports-record-list");
const reportRefreshButton = document.getElementById("reports-refresh-button");
const reportStatusFilter = document.getElementById("reports-status-filter");

function getReportTargetLabel(report) {
  const type = String(report?.reported_type || "").toLowerCase();

  if (type === "empresa") return "Empresa";
  if (type === "candidato") return "Candidato";
  return "Usuário";
}

function getReportInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  return parts
    .slice(0, 2)
    .map(part => Array.from(part)[0]?.toLocaleUpperCase("pt-BR") || "")
    .join("") || "??";
}

function getReportGroups() {
  const groups = new Map();

  adminReports.forEach(report => {
    const targetId = Number(report.reported_user_id);

    if (!Number.isInteger(targetId) || targetId < 1) return;

    if (!groups.has(targetId)) {
      groups.set(targetId, {
        userId: targetId,
        name: report.reported_name || report.reported_email || `Usuário #${targetId}`,
        email: report.reported_email || "E-mail não disponível",
        type: getReportTargetLabel(report),
        photo: report.reported_photo || "",
        count: 0,
        pending: 0,
        reviewed: 0,
        resolved: 0
      });
    }

    const group = groups.get(targetId);
    group.count += 1;

    const status = String(report.status || "pending").toLowerCase();
    if (Object.hasOwn(group, status)) {
      group[status] += 1;
    } else {
      group.pending += 1;
    }
  });

  return [...groups.values()].sort((a, b) =>
    b.count - a.count || a.name.localeCompare(b.name, "pt-BR")
  );
}

function updateReportCounters(groups = getReportGroups()) {
  const total = adminReports.length;
  const pending = adminReports.filter(item => item.status === "pending").length;
  const reviewed = adminReports.filter(item => item.status === "reviewed").length;

  const values = {
    "reports-stat-total": total,
    "reports-stat-pending": pending,
    "reports-stat-reviewed": reviewed,
    "reports-stat-targets": groups.length,
    "reports-chart-total": `${total.toLocaleString("pt-BR")} ${total === 1 ? "denúncia" : "denúncias"}`
  };

  Object.entries(values).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = String(value);
  });
}

function renderReportChart() {
  if (!reportChart) return;

  const groups = getReportGroups();
  updateReportCounters(groups);

  if (!groups.length) {
    reportChart.innerHTML = `
      <article class="reports-empty">
        <i class="fa-regular fa-chart-bar" aria-hidden="true"></i>
        <strong>Nenhuma denúncia registrada</strong>
        <span>Quando uma denúncia for enviada, a pessoa ou empresa denunciada aparecerá neste gráfico.</span>
      </article>
    `;
    return;
  }

  const maxCount = Math.max(...groups.map(group => group.count));

  reportChart.innerHTML = groups.map((group, index) => {
    const width = Math.max(3, Math.round((group.count / maxCount) * 100));
    const countLabel = `${group.count} ${group.count === 1 ? "denúncia" : "denúncias"}`;

    return `
      <article class="report-target-row">
        <div class="report-target-identity">
          <span class="report-target-avatar" aria-hidden="true">${escapeHTML(getReportInitials(group.name))}</span>
          <div class="report-target-copy">
            <strong>${escapeHTML(group.name)}</strong>
            <span>${escapeHTML(group.type)} · ${escapeHTML(group.email)}</span>
          </div>
          <span class="report-target-position">#${index + 1}</span>
        </div>

        <div class="report-target-bar-line">
          <div
            class="report-target-track"
            role="img"
            aria-label="${escapeHTML(group.name)} recebeu ${group.count} denúncias"
          >
            <span class="report-target-fill" style="width: ${width}%"></span>
          </div>
          <strong class="report-target-count">${countLabel}</strong>
        </div>
      </article>
    `;
  }).join("");
}

function getFilteredAdminReports() {
  return adminReports.filter(report => {
    if (
      selectedReportStatus !== "all" &&
      String(report.status || "pending") !== selectedReportStatus
    ) {
      return false;
    }

    return true;
  });
}

function renderAdminReportRecord(report) {
  const status = Object.hasOwn(reportStatusLabels, report.status)
    ? report.status
    : "pending";

  return `
    <article class="report-record" data-report-id="${Number(report.id)}">
      <div class="report-record-main">
        <div class="report-record-target">
          <span class="report-record-type">${escapeHTML(getReportTargetLabel(report))}</span>
          <strong>${escapeHTML(report.reported_name || report.reported_email || `Usuário #${report.reported_user_id}`)}</strong>
          <span>${escapeHTML(report.reported_email || "E-mail não disponível")}</span>
        </div>

        <div class="report-record-reason">
          <strong>${escapeHTML(report.reason || "Motivo não informado")}</strong>
          <p>${escapeHTML(report.description || "Nenhuma descrição adicional.")}</p>
          <small>
            Denunciado por ${escapeHTML(report.reporter_name || report.reporter_email || "Usuário")}
            · ${escapeHTML(formatDate(report.created_at))}
          </small>
          ${report.admin_response ? `
            <div class="report-admin-response-preview">
              <strong><i class="fa-solid fa-reply" aria-hidden="true"></i> Parecer do administrador</strong>
              <p>${escapeHTML(report.admin_response)}</p>
            </div>
          ` : `
            <span class="report-awaiting-response">Ainda sem parecer administrativo</span>
          `}
        </div>
      </div>

      <div class="report-record-actions">
        <label class="report-status-control">
          <span>Status</span>
          <select data-report-status>
            <option value="pending" ${status === "pending" ? "selected" : ""}>Pendente</option>
            <option value="reviewed" ${status === "reviewed" ? "selected" : ""}>Em análise</option>
            <option value="resolved" ${status === "resolved" ? "selected" : ""}>Resolvida</option>
          </select>
        </label>

        <button type="button" class="report-reply-button" data-report-action="reply">
          <i class="fa-solid fa-reply" aria-hidden="true"></i>
          <span>${report.admin_response ? "Editar parecer" : "Responder"}</span>
        </button>

        <button type="button" class="report-delete-button" data-report-action="delete" title="Excluir denúncia" aria-label="Excluir denúncia">
          <i class="fa-regular fa-trash-can" aria-hidden="true"></i>
        </button>
      </div>
    </article>
  `;
}

function renderAdminReportRecords() {
  if (!reportRecordList) return;

  const filtered = getFilteredAdminReports();
  const count = document.getElementById("reports-records-count");

  if (count) {
    count.textContent = `${filtered.length} ${filtered.length === 1 ? "registro encontrado" : "registros encontrados"}`;
  }

  if (!filtered.length) {
    reportRecordList.innerHTML = `
      <article class="reports-empty reports-records-empty">
        <i class="fa-regular fa-folder-open" aria-hidden="true"></i>
        <strong>Nenhuma denúncia neste filtro</strong>
        <span>Altere o filtro de status ou aguarde novos registros.</span>
      </article>
    `;
    return;
  }

  reportRecordList.innerHTML = filtered.map(renderAdminReportRecord).join("");
}

function renderAdminReports() {
  renderReportChart();
  renderAdminReportRecords();
}

async function loadAdminReports() {
  if (!reportChart || !reportRecordList || !adminToken) return;

  reportChart.setAttribute("aria-busy", "true");
  reportRecordList.setAttribute("aria-busy", "true");

  if (reportRefreshButton) {
    reportRefreshButton.disabled = true;
    reportRefreshButton.classList.add("is-loading");
  }

  try {
    const response = await reportsService.list();

    if (response?.type !== "success") {
      throw new Error(response?.message || "Não foi possível carregar as denúncias.");
    }

    adminReports = Array.isArray(response.data) ? response.data : [];
    renderAdminReports();
  } catch (error) {
    console.error("Erro ao carregar denúncias:", error);

    reportChart.innerHTML = `
      <article class="reports-error">
        <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
        <strong>Não foi possível carregar o gráfico</strong>
        <span>${escapeHTML(error.message || "Verifique a conexão com a API.")}</span>
      </article>
    `;

    reportRecordList.innerHTML = `
      <article class="reports-error">
        <strong>Não foi possível carregar as denúncias.</strong>
        <span>Tente atualizar os dados novamente.</span>
      </article>
    `;

    toast("Não foi possível carregar as denúncias.");
  } finally {
    reportChart.setAttribute("aria-busy", "false");
    reportRecordList.setAttribute("aria-busy", "false");

    if (reportRefreshButton) {
      reportRefreshButton.disabled = false;
      reportRefreshButton.classList.remove("is-loading");
    }
  }
}

reportRefreshButton?.addEventListener("click", async () => {
  await Promise.all([
    loadAdminDashboardStats(),
    loadAdminReports()
  ]);
});

reportStatusFilter?.addEventListener("change", () => {
  selectedReportStatus = reportStatusFilter.value;
  renderAdminReportRecords();
});

reportRecordList?.addEventListener("change", async event => {
  const select = event.target.closest("[data-report-status]");
  const record = select?.closest("[data-report-id]");

  if (!select || !record) return;

  const reportId = Number(record.dataset.reportId);
  const report = adminReports.find(item => Number(item.id) === reportId);

  if (!report || !["pending", "reviewed", "resolved"].includes(select.value)) return;

  const previousStatus = report.status || "pending";
  const newStatus = select.value;

  select.disabled = true;

  try {
    const response = await reportsService.update({
      id: reportId,
      status: newStatus
    });

    if (response?.type !== "success") {
      throw new Error(response?.message || "Não foi possível atualizar o status.");
    }

    report.status = newStatus;
    renderAdminReports();
    toast("Status da denúncia atualizado.");
  } catch (error) {
    console.error("Erro ao atualizar denúncia:", error);
    select.value = previousStatus;
    toast(error.message || "Não foi possível atualizar a denúncia.");
  } finally {
    if (select.isConnected) select.disabled = false;
  }
});

reportRecordList?.addEventListener("click", event => {
  const actionButton = event.target.closest("[data-report-action]");
  const record = actionButton?.closest("[data-report-id]");

  if (!actionButton || !record) return;

  const reportId = Number(record.dataset.reportId);
  const report = adminReports.find(item => Number(item.id) === reportId);
  if (!report) return;

  if (actionButton.dataset.reportAction === "reply") {
    const modal = createModal(
      report.admin_response ? "Editar parecer da denúncia" : "Responder denúncia",
      `
        <div class="report-reply-context">
          <span class="report-reply-kicker">DENÚNCIA RECEBIDA</span>
          <strong>${escapeHTML(report.reported_name || "Perfil denunciado")}</strong>
          <span>${escapeHTML(getReportTargetLabel(report))} · Denúncia de ${escapeHTML(report.reporter_name || "Usuário")}</span>
          <p><b>Motivo:</b> ${escapeHTML(report.reason || "Não informado")}</p>
          <p>${escapeHTML(report.description || "Nenhuma descrição adicional.")}</p>
        </div>

        <label class="report-reply-field" for="report-admin-response">Parecer / resposta do administrador</label>
        <textarea id="report-admin-response" maxlength="5000" rows="6" placeholder="Registre a análise realizada, as providências tomadas ou a resposta para esta denúncia...">${escapeHTML(report.admin_response || "")}</textarea>
        <small class="report-reply-hint">Este parecer ficará registrado junto à denúncia no painel administrativo.</small>

        <label class="report-reply-field" for="report-admin-status">Situação da denúncia</label>
        <select id="report-admin-status">
          <option value="pending" ${report.status === "pending" ? "selected" : ""}>Pendente</option>
          <option value="reviewed" ${report.status === "reviewed" ? "selected" : ""}>Em análise</option>
          <option value="resolved" ${report.status === "resolved" ? "selected" : ""}>Resolvida</option>
        </select>
      `,
      {
        saveLabel: "Salvar resposta",
        cancelLabel: "Cancelar",
        busyLabel: "Salvando...",
        onSave: async modalElement => {
          const adminResponse = modalElement.querySelector("#report-admin-response").value.trim();
          const status = modalElement.querySelector("#report-admin-status").value;

          if (!adminResponse) {
            toast("Escreva um parecer antes de salvar a resposta.");
            return false;
          }

          if (adminResponse.length > 5000) {
            toast("O parecer deve ter no máximo 5.000 caracteres.");
            return false;
          }

          const response = await reportsService.update({
            id: reportId,
            status,
            admin_response: adminResponse
          });

          if (response?.type !== "success") {
            toast(response?.message || "Não foi possível salvar o parecer.");
            return false;
          }

          report.admin_response = adminResponse;
          report.status = status;
          renderAdminReports();
          toast("Resposta da denúncia salva.");
        }
      }
    );

    modal.querySelector(".modal")?.classList.add("report-response-modal");
    return;
  }

  if (actionButton.dataset.reportAction !== "delete") return;

  createModal(
    "Excluir denúncia",
    `
      <p>Deseja realmente excluir esta denúncia?</p>
      <div class="support-delete-summary">
        <strong>${escapeHTML(report.reported_name || "Perfil denunciado")}</strong>
        <span>${escapeHTML(report.reason || "Motivo não informado")}</span>
      </div>
      <p class="support-delete-warning">Esta ação não poderá ser desfeita.</p>
    `,
    {
      saveLabel: "Excluir denúncia",
      cancelLabel: "Cancelar",
      busyLabel: "Excluindo...",
      onSave: async () => {
        try {
          const response = await reportsService.delete(reportId);

          if (response?.type !== "success") {
            toast(response?.message || "Não foi possível excluir a denúncia.");
            return false;
          }

          adminReports = adminReports.filter(item => Number(item.id) !== reportId);
          renderAdminReports();
          toast("Denúncia excluída.");
        } catch (error) {
          console.error("Erro ao excluir denúncia:", error);
          toast("Não foi possível excluir a denúncia.");
          return false;
        }
      }
    }
  );
});

loadAdminDashboardStats();
loadAdminReports();
