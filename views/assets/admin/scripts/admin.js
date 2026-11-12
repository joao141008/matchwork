import FaqService from "../../_common/services/FaqService.js";

const faqService = new FaqService();

/* =========================
   UTIL: ESCAPE HTML
========================= */
function escapeHTML(text = "") {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}


/* =========================
   UTIL: TOAST
========================= */
function toast(msg) {
  const el = document.createElement("article");
  el.className = "toast";
  el.textContent = msg;

  document.body.appendChild(el);

  setTimeout(() => el.remove(), 2000);
}


/* =========================
   MODAL BASE
   - onSave pode ser async
   - o modal só fecha se onSave NÃO retornar false
   - enquanto salva, o botão fica desabilitado
========================= */
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
    <article class="modal">
      <article class="modal-header">
        <h2>${title}</h2>
        <button class="close-modal"><i class="fa-solid fa-xmark"></i></button>
      </article>

      <article class="modal-body">
        ${contentHTML}
      </article>

      ${
        showActions
          ? `
        <article class="modal-footer">
          <button class="cancel">${cancelLabel}</button>
          <button class="save">${saveLabel}</button>
        </article>
      `
          : ""
      }
    </article>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();

  overlay.querySelector(".close-modal").onclick = close;

  overlay.onclick = (e) => {
    if (e.target === overlay) close();
  };

  if (showActions) {
    const saveBtn = overlay.querySelector(".save");

    overlay.querySelector(".cancel").onclick = close;

    saveBtn.onclick = async () => {
      saveBtn.disabled = true;
      const originalText = saveBtn.textContent;
      saveBtn.textContent = busyLabel;

      try {
        const result = onSave ? await onSave(overlay) : true;

        if (result === false) return; // mantém o modal aberto (erro/validação)
        close();
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = originalText;
      }
    };
  }

  return overlay;
}


/* =========================
   FAQ - HELPERS
========================= */
function renderFaqItem({ id, faqs_category_id, question, answer }) {
  const faq = document.querySelector(".faq");

  // remove mensagens de estado (carregando / vazio / erro), se existirem
  faq.querySelector(".faq-status")?.remove();

  const item = document.createElement("article");
  item.className = "faqItem";
  if (id) item.dataset.id = id;
  if (faqs_category_id) item.dataset.category = faqs_category_id;

  item.innerHTML = `
    <article>
      <h3>${escapeHTML(question)}</h3>
      <p>${escapeHTML(answer)}</p>
    </article>
    <article>
      <i class="fa-solid fa-pen edit"></i>
      <i class="fa-solid fa-trash delete"></i>
    </article>
  `;

  faq.appendChild(item);
}

function setFaqStatus(message) {
  const faq = document.querySelector(".faq");
  faq.innerHTML = `<p class="faq-status">${escapeHTML(message)}</p>`;
}

/* =========================
   FAQ - LISTAR (BANCO DE DADOS)
========================= */
async function loadFaqs() {
  setFaqStatus("Carregando FAQs...");

  try {
    const response = await faqService.list();

    if (response?.type !== "success") {
      setFaqStatus(response?.message || "Não foi possível carregar as FAQs");
      return;
    }

    // quando não há registros a API não envia a chave "data"
    const faqs = response.data ?? [];

    if (!faqs.length) {
      setFaqStatus("Nenhuma FAQ cadastrada ainda.");
      return;
    }

    document.querySelector(".faq").innerHTML = "";
    faqs.forEach(renderFaqItem);
  } catch (error) {
    console.error(error);
    setFaqStatus("Erro de conexão ao carregar as FAQs");
    toast("Erro de conexão com o servidor");
  }
}

async function loadCategoryOptions(select, selectedId = null) {
  try {
    const response = await faqService.listCategories();
    const categories = response?.data ?? [];

    if (!categories.length) {
      select.innerHTML = `<option value="">Nenhuma categoria cadastrada</option>`;
      return;
    }

    select.innerHTML =
      `<option value="">Selecione uma categoria</option>` +
      categories
        .map((c) => `<option value="${c.id}">${escapeHTML(c.name)}</option>`)
        .join("");

    if (selectedId) select.value = String(selectedId);
  } catch (error) {
    console.error(error);
    select.innerHTML = `<option value="">Erro ao carregar categorias</option>`;
    toast("Não foi possível carregar as categorias");
  }
}


loadFaqs();


/* =========================
   FAQ - ADICIONAR (ASYNC)
========================= */
const addFaqBtn = document.querySelector(".titulo button");

addFaqBtn.addEventListener("click", () => {
  const modal = createModal(
    "Nova Pergunta",
    `
      <label>Categoria</label>
      <select id="faq-category">
        <option value="">Carregando...</option>
      </select>

      <label>Pergunta</label>
      <input id="faq-q" type="text" placeholder="Digite a pergunta">

      <label>Resposta</label>
      <textarea id="faq-a" placeholder="Digite a resposta"></textarea>
    `,
    {
      onSave: async (modal) => {
        const faqs_category_id = modal.querySelector("#faq-category").value;
        const question = modal.querySelector("#faq-q").value.trim();
        const answer = modal.querySelector("#faq-a").value.trim();

        if (!faqs_category_id || !question || !answer) {
          toast("Preencha tudo!");
          return false; // mantém o modal aberto
        }

        try {
          const response = await faqService.register({
            faqs_category_id,
            question,
            answer
          });

          // a API devolve { code, type, status, message, data }
          if (response?.type !== "success") {
            toast(response?.message || "Não foi possível cadastrar a FAQ");
            return false;
          }

          renderFaqItem({
            id: response.data?.id,
            faqs_category_id: response.data?.faqs_category_id ?? faqs_category_id,
            question: response.data?.question ?? question,
            answer: response.data?.answer ?? answer
          });

          toast("FAQ criada!");
        } catch (error) {
          console.error(error);
          toast("Erro de conexão com o servidor");
          return false;
        }
      }
    }
  );

  // carrega as categorias de forma assíncrona sem travar a abertura do modal
  loadCategoryOptions(modal.querySelector("#faq-category"));
});


/* =========================
   FAQ - EDITAR / EXCLUIR (ASYNC)
========================= */
document.addEventListener("click", (e) => {
  const item = e.target.closest(".faqItem");
  if (!item) return;

  const faqId = item.dataset.id;

  /* DELETE */
  if (e.target.classList.contains("fa-trash")) {
    const question = item.querySelector("h3").textContent;

    createModal(
      "Excluir FAQ",
      `
        <p>Tem certeza que deseja excluir a pergunta
        <strong>${escapeHTML(question)}</strong>?
        Essa ação não pode ser desfeita.</p>
      `,
      {
        saveLabel: "Excluir",
        cancelLabel: "Cancelar",
        busyLabel: "Excluindo...",
        onSave: async () => {
          try {
            const response = await faqService.delete(faqId);

            if (response?.type !== "success") {
              toast(response?.message || "Não foi possível excluir a FAQ");
              return false;
            }

            item.remove();

            if (!document.querySelector(".faq .faqItem")) {
              setFaqStatus("Nenhuma FAQ cadastrada ainda.");
            }

            toast("FAQ removida!");
          } catch (error) {
            console.error(error);
            toast("Erro de conexão com o servidor");
            return false;
          }
        }
      }
    );
  }

  /* EDIT */
  if (e.target.classList.contains("fa-pen")) {
    const oldQ = escapeHTML(item.querySelector("h3").textContent);
    const oldA = escapeHTML(item.querySelector("p").textContent);

    const modal = createModal(
      "Editar FAQ",
      `
        <label>Categoria</label>
        <select id="faq-category">
          <option value="">Carregando...</option>
        </select>

        <label>Pergunta</label>
        <input id="faq-q" type="text" value="${oldQ}">

        <label>Resposta</label>
        <textarea id="faq-a">${oldA}</textarea>
      `,
      {
        onSave: async (modal) => {
          const faqs_category_id = modal.querySelector("#faq-category").value;
          const question = modal.querySelector("#faq-q").value.trim();
          const answer = modal.querySelector("#faq-a").value.trim();

          if (!faqs_category_id || !question || !answer) {
            toast("Preencha tudo!");
            return false;
          }

          try {
            const response = await faqService.update(faqId, {
              faqs_category_id,
              question,
              answer
            });

            if (response?.type !== "success") {
              toast(response?.message || "Não foi possível atualizar a FAQ");
              return false;
            }

            item.querySelector("h3").textContent = response.data?.question ?? question;
            item.querySelector("p").textContent = response.data?.answer ?? answer;
            item.dataset.category = response.data?.faqs_category_id ?? faqs_category_id;

            toast("FAQ atualizada!");
          } catch (error) {
            console.error(error);
            toast("Erro de conexão com o servidor");
            return false;
          }
        }
      }
    );

    loadCategoryOptions(modal.querySelector("#faq-category"), item.dataset.category);
  }
});


/* =========================
   DENÚNCIAS - EXCLUIR USUÁRIO
========================= */
document.querySelectorAll(".usuario button").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.target.closest(".usuario").remove();
    toast("Usuário removido!");
  });
});


/* =========================
   TICKETS (CENTRAL DE SUPORTE)
========================= */
document.addEventListener("click", (e) => {
  const ticket = e.target.closest(".ticket");
  if (!ticket) return;

  const title = ticket.querySelector("h3")?.textContent;
  const desc = ticket.querySelector("p")?.textContent;

  /* VIEW */
  if (e.target.classList.contains("fa-eye")) {
    createModal(
      "Detalhes",
      `
        <h3>${escapeHTML(title)}</h3>
        <p>${escapeHTML(desc)}</p>
      `,
      { showActions: false }
    );
  }

  /* DELETE */
  if (e.target.classList.contains("fa-trash")) {
    ticket.remove();
    toast("Ticket excluído!");
  }

  /* DENÚNCIA RESOLVIDA */
  if (e.target.classList.contains("fa-ban")) {
    ticket.remove();
    toast("Denúncia resolvida!");
  }

  /* SUGESTÃO APROVADA */
  if (e.target.classList.contains("fa-check")) {
    ticket.remove();
    toast("Sugestão aprovada!");
  }
});


/* =========================
   FECHAR MODAL NO BACKDROP
========================= */
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.remove();
  }
});


/* =========================
   MINI UX EXTRA (ANIMAÇÃO TOAST FIX)
========================= */
const style = document.createElement("style");
style.innerHTML = `
.toast{
  position:fixed;
  bottom:20px;
  right:20px;
  background:#446368;
  color:white;
  padding:12px 16px;
  border-radius:10px;
  font-weight:700;
  z-index:99999;
  animation:fade .3s ease;
}

@keyframes fade{
  from{opacity:0; transform:translateY(10px);}
  to{opacity:1; transform:translateY(0);}
}
`;
document.head.appendChild(style);