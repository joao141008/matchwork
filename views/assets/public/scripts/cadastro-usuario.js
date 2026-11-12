// ETAPA 1 do cadastro: criar a conta (e-mail + senha)

import Users from "../../_common/services/UsersService.js";
import Toast from "../../_common/prototypes/Toast.js";
import { salvarSessao, salvarDadosTemporarios, irPara } from "../../_common/scripts/sessao.js";

const users = new Users();

const form = document.querySelector("#signup-form");
const botao = form.querySelector("[type='submit']");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.querySelector("#email").value.trim();
    const senha = document.querySelector("#password").value;
    const confirmar = document.querySelector("#confirmPassword").value;

    if (senha !== confirmar) {
        Toast.warning("As senhas não coincidem.");
        return;
    }

    // Trava o botão para a pessoa não clicar duas vezes
    botao.disabled = true;
    botao.textContent = "Criando conta...";

    try {
        // 1. Cria o usuário
        const cadastro = await users.register({ email: email, password: senha });

        if (cadastro?.status !== "success") {

            // O e-mail é único. Se a API disse que ele já está cadastrado, essa conta
            // JÁ foi criada antes (e está salva!). Então mandamos a pessoa entrar
            // para continuar o cadastro.
            // A API responde "Email já cadastrado"; "Duplicate" é a mensagem do banco
            // de dados, caso a checagem da API falhe.
            const mensagem = cadastro?.message || "";
            const emailJaExiste =
                mensagem.toLowerCase().includes("já cadastrado") ||
                mensagem.includes("Duplicate");

            if (emailJaExiste) {
                Toast.warning("Esse e-mail já tem conta. Entre para continuar seu cadastro.");
                setTimeout(() => irPara("public/login.html"), 1800);
            } else {
                Toast.error(mensagem || "Não foi possível criar a conta.");
            }

            return;
        }

        // 2. Entra automaticamente (precisamos do token para a próxima etapa)
        const login = await users.login(email, senha);
        const token = login?.data?.token;

        if (login?.status !== "success" || !token) {
            Toast.warning("Conta criada! Faça login para continuar.");
            setTimeout(() => irPara("public/login.html"), 1500);
            return;
        }

        // 3. Guarda o login e os dados que a próxima etapa vai precisar
        salvarSessao(token, login.data.type_id);
        salvarDadosTemporarios(email, senha);

        // 4. Segue para o cadastro de candidato (lá dá pra trocar para empresa)
        Toast.success("Conta criada! Agora complete seu perfil.");
        setTimeout(() => irPara("public/cadastro-candidato.html"), 1000);

    } catch (erro) {
        console.error("Erro ao cadastrar usuário:", erro);
        Toast.error("Não foi possível conectar ao servidor.");

    } finally {
        // Acontece sempre: deu certo ou deu erro, o botão volta ao normal
        botao.disabled = false;
        botao.textContent = "Criar Conta";
    }
});