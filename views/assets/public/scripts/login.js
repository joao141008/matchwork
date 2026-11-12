// LOGIN: entra e manda cada tipo de usuário para a tela certa

import Users from "../../_common/services/UsersService.js";
import Toast from "../../_common/prototypes/Toast.js";
import {
    TIPO,
    salvarSessao,
    salvarDadosTemporarios,
    telaInicial,
    irPara
} from "../../_common/scripts/sessao.js";

const users = new Users();

const form = document.querySelector("#login-form");
const botao = form.querySelector("[type='submit']");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = form.elements.email.value.trim();
    const senha = form.elements.password.value;

    botao.disabled = true;
    botao.textContent = "Entrando...";

    try {
        const resposta = await users.login(email, senha);

        if (resposta?.status !== "success") {
            Toast.error(resposta?.message || "E-mail ou senha inválidos.");
            return;
        }

        const token = resposta.data?.token;
        const tipo = Number(resposta.data?.type_id);

        if (!token) {
            Toast.error("O servidor não retornou um token.");
            return;
        }

        salvarSessao(token, tipo);

        // Conta criada mas cadastro não terminado (type_id 2):
        // guardamos e-mail e senha para a tela de cadastro poder concluir.
        if (tipo === TIPO.SEM_PERFIL) {
            salvarDadosTemporarios(email, senha);
            Toast.warning("Falta pouco! Complete seu cadastro.");
        }

        // 1 = admin | 2 = completar cadastro | 3 e 4 = dashboard
        irPara(telaInicial(tipo));

    } catch (erro) {
        console.error("Erro no login:", erro);
        Toast.error("Não foi possível conectar ao servidor.");

    } finally {
        botao.disabled = false;
        botao.textContent = "Entrar";
    }
});