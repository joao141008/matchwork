
import Area from "../../_common/classes/Area.js";
import AreaService from "../../_common/services/AreaService.js";
import CandidateService from "../../_common/services/CandidateService.js";
import FormController from "../../_common/prototypes/FormController.js";
import Toast from "../../_common/prototypes/Toast.js";

import {
    pegarToken,
    pegarDadosTemporarios,
    limparDadosTemporarios,
    limparSessao,
    irPara
} from "../../_common/scripts/sessao.js";

const candidateService = new CandidateService();
const areaService = new AreaService();

const form = document.querySelector("#candidate-form");
const submitButton = form.querySelector("[type='submit']");
const areasSelect = document.querySelector("#candidateAreaSelect");
const addAreaButton = document.querySelector("#addCandidateArea");
const otherAreaContainer = document.querySelector("#candidateOtherAreaContainer");
const otherAreaInput = document.querySelector("#candidateOtherArea");
const selectedAreasContainer = document.querySelector("#candidateSelectedAreas");
const areasError = document.querySelector("#candidateAreasError");

const token = pegarToken();
const { email, senha } = pegarDadosTemporarios();

let areasDisponiveis = [];
let areasSelecionadas = [];

areasSelect.addEventListener("change", atualizarCampoOutraArea);
addAreaButton.addEventListener("click", adicionarAreaSelecionada);

if (!token || !email || !senha) {
    Toast.warning("Entre na sua conta para completar o cadastro.");
    setTimeout(() => irPara("public/login.html"), 1500);

} else {
    candidateService.setAuthToken(token);
    inicializarCadastro();
}

async function inicializarCadastro() {
    submitButton.disabled = true;

    try {
        await carregarAreas();

        submitButton.disabled = false;
        ativarFormulario();

    } catch (error) {
        console.error("Erro ao carregar áreas profissionais:", error);

        mostrarErroAreas(
            error.message ||
            "Não foi possível carregar as áreas profissionais."
        );

        Toast.error("Não foi possível carregar as áreas de interesse.");
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
        throw new Error("A resposta da API de áreas possui um formato inválido.");
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

// VERIFICAR ÁREA PERSONALIZADA

function ehAreaOutras(area) {
    return area?.name?.toLocaleLowerCase("pt-BR") === "outras";
}

// CONTROLAR CAMPO DE OUTRA ÁREA

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
        mostrarErroAreas("Selecione uma área de interesse.");
        return;
    }

    const jaFoiAdicionada = areasSelecionadas.some(
        (item) => item.area_id === area.id
    );

    if (jaFoiAdicionada) {
        mostrarErroAreas("Essa área já foi adicionada.");
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

// MOSTRAR ÁREAS ADICIONADAS

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

// COLETAR AS ÁREAS ADICIONADAS AO FORMULÁRIO

function coletarAreasSelecionadas() {
    return areasSelecionadas.map((area) => ({ ...area }));
}

// VALIDAR SELEÇÃO

function validarAreasSelecionadas(areas) {
    if (areas.length === 0) {
        mostrarErroAreas("Adicione pelo menos uma área de interesse.");
        return false;
    }

    const outrasSemDescricao = areas.some((area) => {
        const areaOriginal = areasDisponiveis.find(
            (item) => item.id === area.area_id
        );

        return ehAreaOutras(areaOriginal) && area.custom_area === "";
    });

    if (outrasSemDescricao) {
        mostrarErroAreas(
            'Informe sua área personalizada ao selecionar "Outras".'
        );

        return false;
    }

    limparErroAreas();
    return true;
}

// GERAR RESUMO TEXTUAL DAS ÁREAS

function montarResumoAreas(areas) {
    return areas
        .map((area) => area.display_name)
        .filter(Boolean)
        .join(", ");
}

function mostrarErroAreas(message) {
    areasError.textContent = message;
    areasError.hidden = false;
}

function limparErroAreas() {
    areasError.textContent = "";
    areasError.hidden = true;
}

// CADASTRO

function ativarFormulario() {
    const textoOriginal = submitButton.textContent;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!FormController.validate(form)) {
            form.reportValidity();
            Toast.warning("Preencha seu nome completo e CPF.");
            return;
        }

        let areasSelecionadasFormulario;

        try {
            areasSelecionadasFormulario = coletarAreasSelecionadas();

        } catch (error) {
            mostrarErroAreas(error.message);
            return;
        }

        if (!validarAreasSelecionadas(areasSelecionadasFormulario)) {
            return;
        }

        const dados = FormController.serialize(form);

        // Campo textual mantido para compatibilidade com candidates.interest_area.
        dados.interest_area = montarResumoAreas(
            areasSelecionadasFormulario
        );

        // IDs usados para persistir os relacionamentos em candidate_areas.
        dados.areas = areasSelecionadasFormulario.map((area) => ({
            area_id: area.area_id,
            custom_area: area.custom_area
        }));

        dados.email = email;
        dados.password = senha;

        submitButton.disabled = true;
        submitButton.textContent = "Salvando...";

        try {
            const resposta = await candidateService.register(dados);

            if (resposta?.status === "unauthorized") {
                limparSessao();
                limparDadosTemporarios();

                Toast.warning(
                    "Sua sessão expirou. Entre novamente para continuar."
                );

                setTimeout(() => irPara("public/login.html"), 1500);
                return;
            }

            if (resposta?.status !== "success") {
                Toast.error(
                    resposta?.message ||
                    "Não foi possível realizar o cadastro."
                );

                return;
            }

            localStorage.setItem("name", dados.full_name.trim());

            limparDadosTemporarios();
            limparSessao();

            Toast.success("Cadastro concluído! Faça login para entrar.");

            setTimeout(() => irPara("public/login.html"), 1200);

        } catch (error) {
            console.error("Erro ao cadastrar candidato:", error);

            Toast.error(
                error.message ||
                "Não foi possível conectar ao servidor."
            );

        } finally {
            submitButton.disabled = false;
            submitButton.textContent = textoOriginal;
        }
    });
}
