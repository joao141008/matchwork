// Mensagem rápida que aparece no canto inferior direito da tela.
// O visual fica no arquivo toast.css (pasta _common/styles).
// Este arquivo carrega o CSS sozinho, então não precisa mexer nos HTMLs.

const TEMPO_NA_TELA = 3000;   // quanto tempo o aviso fica visível (3 segundos)
const TEMPO_DA_SAIDA = 300;   // duração da animação de saída (igual ao toast.css)

// Liga o toast.css na página (só uma vez).
// O caminho é a partir deste arquivo: sobe uma pasta e entra em "styles".
if (!document.getElementById("toast-css")) {
    const link = document.createElement("link");
    link.id = "toast-css";
    link.rel = "stylesheet";
    link.href = new URL("../styles/toast.css", import.meta.url).href;
    document.head.appendChild(link);
}

// Pega (ou cria) a área onde os avisos aparecem
function pegarCaixa() {
    let caixa = document.getElementById("toast-caixa");

    if (!caixa) {
        caixa = document.createElement("div");
        caixa.id = "toast-caixa";
        document.body.appendChild(caixa);
    }

    return caixa;
}

const ToastPrototype = {
    show(message, type = "success") {
        const validTypes = ["success", "warning", "error"];

        if (!validTypes.includes(type)) {
            throw new TypeError(`Tipo de toast inválido: ${type}`);
        }

        if (typeof message !== "string" || message.trim() === "") {
            throw new TypeError("A mensagem do toast é obrigatória");
        }

        const toast = document.createElement("div");
        toast.classList.add("toast", `toast-${type}`);
        toast.textContent = message.trim();

        pegarCaixa().appendChild(toast);

        // Depois de um tempo, toca a animação de saída e só então remove
        setTimeout(() => {
            toast.classList.add("toast-saindo");

            setTimeout(() => toast.remove(), TEMPO_DA_SAIDA);
        }, TEMPO_NA_TELA);
    },

    success(message) {
        this.show(message, "success");
    },

    warning(message) {
        this.show(message, "warning");
    },

    error(message) {
        this.show(message, "error");
    }
};

const Toast = Object.create(ToastPrototype);

export default Toast;