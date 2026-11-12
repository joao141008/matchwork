// =====================================================
// SESSÃO: guarda e lê as informações do login em UM lugar só.
// Todas as telas (cadastro, login, dashboard) usam estas funções,
// assim ninguém precisa lembrar o nome das chaves do localStorage.
// =====================================================

// Os tipos de usuário que existem no banco (coluna type_id)
export const TIPO = {
    ADMIN: 1,       // administrador
    SEM_PERFIL: 2,  // criou a conta, mas ainda não escolheu candidato/empresa
    CANDIDATO: 3,   // já completou o cadastro de pessoa
    EMPRESA: 4      // já completou o cadastro de empresa
};


// ---------- Login (fica salvo mesmo fechando a aba) ----------

export function salvarSessao(token, tipo) {
    localStorage.setItem("token", token);
    localStorage.setItem("type_id", tipo);
}

export function pegarToken() {
    return localStorage.getItem("token");
}

export function pegarTipo() {
    const tipo = localStorage.getItem("type_id");

    // localStorage só guarda texto, então convertemos para número
    return tipo ? Number(tipo) : null;
}

export function limparSessao() {
    localStorage.removeItem("token");
    localStorage.removeItem("type_id");
}


// ---------- Dados temporários do cadastro ----------
// A API pede e-mail e senha de novo no cadastro de candidato/empresa.
// Guardamos no sessionStorage: some sozinho quando a aba é fechada
// (diferente do localStorage, que ficaria salvo para sempre).

export function salvarDadosTemporarios(email, senha) {
    sessionStorage.setItem("cadastro_email", email);
    sessionStorage.setItem("cadastro_senha", senha);
}

export function pegarDadosTemporarios() {
    return {
        email: sessionStorage.getItem("cadastro_email"),
        senha: sessionStorage.getItem("cadastro_senha")
    };
}

export function limparDadosTemporarios() {
    sessionStorage.removeItem("cadastro_email");
    sessionStorage.removeItem("cadastro_senha");
}


// ---------- Navegação ----------

// Vai para qualquer página do site, não importa de qual pasta você está.
// Exemplo: irPara("app/dashboard.html")
// O "../../../" sobe a partir da pasta deste arquivo até a pasta "views".
export function irPara(pagina) {
    window.location.href = new URL("../../../" + pagina, import.meta.url).href;
}

// Diz qual é a tela certa para cada tipo de usuário
export function telaInicial(tipo) {
    if (tipo === TIPO.ADMIN) return "admin/index.html";
    if (tipo === TIPO.SEM_PERFIL) return "public/cadastro-candidato.html";
    if (tipo === TIPO.CANDIDATO || tipo === TIPO.EMPRESA) return "app/dashboard.html";

    return "public/login.html";
}