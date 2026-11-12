
// ETAPA 2 do cadastro: completar o perfil de EMPRESA

import Area from "../../_common/classes/Area.js";
import AreaService from "../../_common/services/AreaService.js";
import CompanyService from "../../_common/services/CompanyService.js";
import FormController from "../../_common/prototypes/FormController.js";
import Toast from "../../_common/prototypes/Toast.js";

import {
    pegarToken,
    pegarDadosTemporarios,
    limparDadosTemporarios,
    limparSessao,
    irPara
} from "../../_common/scripts/sessao.js";

const companyService = new CompanyService();
const areaService = new AreaService();

const form = document.querySelector("#company-form");
const botao = form.querySelector("[type='submit']");

const areasSelect = document.querySelector("#companyAreaSelect");
const addAreaButton = document.querySelector("#addCompanyArea");

const otherAreaContainer = document.querySelector("#companyOtherAreaContainer");
const otherAreaInput = document.querySelector("#companyOtherArea");

const selectedAreasContainer = document.querySelector("#companySelectedAreas");
const areasError = document.querySelector("#companyAreasError");

const token = pegarToken();
const { email, senha } = pegarDadosTemporarios();

let areasDisponiveis = [];
let areasSelecionadas = [];

areasSelect.addEventListener("change", atualizarCampoOutraArea);
addAreaButton.addEventListener("click", adicionarAreaSelecionada);


// VERIFICAR SESSÃO

// Os dados temporários confirmam que a etapa de criação da conta foi concluída.
// A API utiliza o token para identificar o usuário.

if (!token || !email || !senha) {

    Toast.warning("Entre na sua conta para completar o cadastro.");

    setTimeout(() => irPara("public/login.html"), 1500);

} else {

    companyService.setAuthToken(token);
    inicializarCadastro();

}


// INICIALIZAR CADASTRO

async function inicializarCadastro() {

    botao.disabled = true;

    try {

        await carregarAreas();

        botao.disabled = false;

        ativarFormulario();

    } catch (erro) {

        console.error(
            "Erro ao carregar áreas profissionais:",
            erro
        );

        mostrarErroAreas(
            erro.message ||
            "Não foi possível carregar as áreas profissionais."
        );

        Toast.error(
            "Não foi possível carregar as áreas de atuação."
        );

    }

}


// BUSCAR ÁREAS NA API

async function carregarAreas() {

    const resposta = await areaService.list();

    if (resposta?.status !== "success") {

        throw new Error(
            resposta?.message ||
            "A API não conseguiu retornar as áreas profissionais."
        );

    }

    if (!Array.isArray(resposta.data)) {

        throw new Error(
            "A resposta da API de áreas possui um formato inválido."
        );

    }

    areasDisponiveis = resposta.data
        .map((item) => Area.fromJSON(item))
        .filter((area) => area.id !== null && area.name !== "");

    if (areasDisponiveis.length === 0) {

        throw new Error(
            "Não existem áreas profissionais cadastradas no banco de dados."
        );

    }

    renderizarAreas();

}


// PREENCHER O SELECT COM AS ÁREAS RETORNADAS PELA API

function renderizarAreas() {

    areasSelect.replaceChildren();

    const placeholder = document.createElement("option");

    placeholder.value = "";
    placeholder.textContent = "Selecione uma área...";

    areasSelect.appendChild(placeholder);

    areasDisponiveis.forEach((area) => {

        const option = document.createElement("option");

        option.value = String(area.id);
        option.textContent = area.name;

        areasSelect.appendChild(option);

    });

    areasSelect.disabled = false;
    addAreaButton.disabled = true;

}


// VERIFICAR SE A ÁREA É "OUTRAS"

function ehAreaOutras(area) {

    return area?.name?.toLocaleLowerCase("pt-BR") === "outras";

}


// CONTROLAR CAMPO DE ÁREA PERSONALIZADA

function atualizarCampoOutraArea() {

    const areaId = Number(areasSelect.value);

    const area = areasDisponiveis.find(
        (item) => item.id === areaId
    );

    const selecionouOutras = ehAreaOutras(area);

    otherAreaContainer.hidden = !selecionouOutras;
    otherAreaInput.disabled = !selecionouOutras;

    if (!selecionouOutras) {

        otherAreaInput.value = "";

    }

    addAreaButton.disabled = !area;

    limparErroAreas();

}


// ADICIONAR ÁREA À LISTA

function adicionarAreaSelecionada() {

    const areaId = Number(areasSelect.value);

    const area = areasDisponiveis.find(
        (item) => item.id === areaId
    );

    if (!area) {

        mostrarErroAreas(
            "Selecione uma área de atuação."
        );

        return;

    }

    const jaFoiAdicionada = areasSelecionadas.some(
        (item) => item.area_id === area.id
    );

    if (jaFoiAdicionada) {

        mostrarErroAreas(
            "Essa área já foi adicionada."
        );

        return;

    }

    const customArea = ehAreaOutras(area)
        ? otherAreaInput.value.trim()
        : "";

    if (ehAreaOutras(area) && !customArea) {

        mostrarErroAreas(
            'Informe sua área personalizada antes de adicionar "Outras".'
        );

        otherAreaInput.focus();

        return;

    }

    areasSelecionadas.push({

        area_id: area.id,

        custom_area: customArea,

        display_name: ehAreaOutras(area)
            ? `Outras: ${customArea}`
            : area.name

    });

    areasSelect.value = "";

    otherAreaInput.value = "";
    otherAreaInput.disabled = true;

    otherAreaContainer.hidden = true;

    addAreaButton.disabled = true;

    renderizarAreasSelecionadas();

    limparErroAreas();

}


// MOSTRAR AS ÁREAS ADICIONADAS

function renderizarAreasSelecionadas() {

    selectedAreasContainer.replaceChildren();

    if (areasSelecionadas.length === 0) {

        const emptyMessage = document.createElement("p");

        emptyMessage.className = "areas-empty";

        emptyMessage.textContent = "Nenhuma área adicionada.";

        selectedAreasContainer.appendChild(emptyMessage);

        return;

    }

    areasSelecionadas.forEach((area) => {

        const item = document.createElement("div");

        item.className = "candidate-selected-area";

        const name = document.createElement("span");

        name.textContent = area.display_name;

        const removeButton = document.createElement("button");

        removeButton.type = "button";

        removeButton.className = "candidate-selected-remove";

        removeButton.textContent = "×";

        removeButton.setAttribute(
            "aria-label",
            `Remover ${area.display_name}`
        );

        removeButton.addEventListener("click", () => {

            areasSelecionadas = areasSelecionadas.filter(
                (selected) => selected.area_id !== area.area_id
            );

            renderizarAreasSelecionadas();

            limparErroAreas();

        });

        item.append(name, removeButton);

        selectedAreasContainer.appendChild(item);

    });

}


// GERAR RESUMO TEXTUAL PARA O CAMPO industry

// O resumo utiliza os nomes das categorias.
// A descrição personalizada de "Outras" fica em company_areas.custom_area.

function montarResumoAreas() {

    return areasSelecionadas
        .map((selecionada) => {

            const area = areasDisponiveis.find(
                (item) => item.id === selecionada.area_id
            );

            return area?.name ?? "";

        })
        .filter(Boolean)
        .join(", ");

}


// MENSAGENS DE ERRO

function mostrarErroAreas(mensagem) {

    areasError.textContent = mensagem;
    areasError.hidden = false;

}

function limparErroAreas() {

    areasError.textContent = "";
    areasError.hidden = true;

}


// CADASTRO

function ativarFormulario() {

    const textoOriginal = botao.textContent;

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        // VALIDAR CAMPOS DO HTML

        if (!FormController.validate(form)) {

            form.reportValidity();

            Toast.warning(
                "Verifique os campos obrigatórios e o endereço do site."
            );

            return;

        }

        // VALIDAR ÁREAS

        if (areasSelecionadas.length === 0) {

            mostrarErroAreas(
                "Adicione pelo menos uma área de atuação."
            );

            areasSelect.focus();

            return;

        }

        // COLETAR DADOS DO FORMULÁRIO

        const dados = FormController.serialize(form);

        for (const campo in dados) {

            dados[campo] = dados[campo].trim();

        }

        if (!dados.company_name || !dados.cnpj) {

            Toast.warning(
                "Preencha o nome e o CNPJ da empresa."
            );

            return;

        }

        // RESUMO TEXTUAL EXIGIDO PELA API

        dados.industry = montarResumoAreas();

        if (!dados.industry || dados.industry.length > 255) {

            mostrarErroAreas(
                "O resumo das áreas de atuação é inválido."
            );

            return;

        }

        // RELACIONAMENTOS EM company_areas

        dados.areas = areasSelecionadas.map((area) => ({

            area_id: area.area_id,

            custom_area: area.custom_area

        }));

        // website e company_size já foram coletados pelo FormController.
        // email e password não são enviados: o token identifica o usuário.

        botao.disabled = true;

        botao.textContent = "Salvando...";

        try {

            const resposta = await companyService.register(dados);

            if (resposta?.status === "unauthorized") {

                limparSessao();

                limparDadosTemporarios();

                Toast.warning(
                    "Sua sessão expirou. Entre novamente para continuar."
                );

                setTimeout(
                    () => irPara("public/login.html"),
                    1500
                );

                return;

            }

            if (resposta?.status !== "success") {

                Toast.error(
                    resposta?.message ||
                    "Não foi possível realizar o cadastro."
                );

                return;

            }

            localStorage.setItem(
                "name",
                dados.company_name.trim()
            );

            limparDadosTemporarios();

            limparSessao();

            Toast.success(
                "Cadastro concluído! Faça login para entrar."
            );

            setTimeout(
                () => irPara("public/login.html"),
                1200
            );

        } catch (erro) {

            console.error(
                "Erro ao cadastrar empresa:",
                erro
            );

            Toast.error(
                erro.message ||
                "Não foi possível conectar ao servidor."
            );

        } finally {

            botao.disabled = false;

            botao.textContent = textoOriginal;

        }

    });

}
