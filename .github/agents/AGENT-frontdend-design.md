# AGENT de Frontend Design

## Objetivo deste arquivo
Use este documento para orientar o planejamento visual e estrutural do frontend do sistema. Ele deve ajudar **estudantes** a descrever suas decisões de interface e também orientar **agentes de IA** a propor telas, componentes e organização de arquivos sem quebrar as convenções do projeto.

## Como preencher
- Substitua cada conteúdo entre colchetes por informações do seu sistema.
- Escreva descrições curtas, objetivas e úteis para implementação.
- Registre primeiro o **layout estático**; o consumo da API e a renderização dinâmica virão depois.

## Regras do projeto que devem ser respeitadas
- O conteúdo deve ser escrito em **Português do Brasil**.
- O código, nomes de arquivos, classes, funções e identificadores devem ficar em **English**.
- O frontend deve usar **HTML semântico**.
- Não utilizar `<div>` e não utilizar `<table>` para montar interface.
- Não utilizar `jQuery`.
- Não utilizar eventos inline no HTML.
- Usar `document.querySelector` no JavaScript.
- Requisições HTTP devem usar `HttpClientBase.js` quando a integração com API começar.
- Arquivos compartilhados devem ir em `views/assets/_common/`; arquivos específicos devem ficar em `views/assets/public/`, `views/assets/app/` ou `views/assets/admin/`.

## Escopo inicial do frontend
- Nesta etapa, os dados serão exibidos de forma **estática**.
- O JavaScript poderá ser usado para comportamentos como `[menu responsivo]`, `[abrir e fechar painéis]`, `[alternar listas]`, `[máscaras visuais]` e `[interações de navegação]`.
- Não planeje regra de negócio no frontend; a View apenas apresenta dados e interações da interface.

## Contexto geral da interface
- Nome do sistema: `[MatchWork]`
- Objetivo principal: `[conectar empresas e candidatos através de um sistema de compatibilidade profissional baseado em interesses, habilidades e necessidades de contratação]`
- Público principal: `[candidatos em busca de emprego e empresas procurando profissionais compatíveis]`
- Dispositivos prioritários: `[desktop e mobile]`
- Estilo desejado: `[moderno, profissional, intuitivo, minimalista e organizado]`

## Área Pública (`public`)
- Quem acessa: `[visitantes sem login]`
- Objetivo da área: `[apresentar a plataforma, explicar seu funcionamento e incentivar login/cadastro]`
- Telas previstas: `[home]`, `[sobre]`, `[contato]`, `[login]`, `[cadastro]`
- Componentes principais: `[cabeçalho fixo]`, `[menu superior]`, `[banner de apresentação]`, `[seção explicativa com texto e imagem/gif]`, `[FAQ com perguntas clicáveis]`, `[rodapé fixo com redes sociais]`
- Ação principal esperada do usuário: `[realizar cadastro ou login após conhecer a plataforma]`

## Área de Aplicação (`app`)
- Quem acessa: `[usuários autenticados, sendo candidatos e empresas]`
- Objetivo da área: `[permitir interação entre empresas e candidatos através do sistema de match e comunicação interna]`
- Telas previstas: `[dashboard]`, `[perfil]`, `[matches]`, `[chat]`, `[configurações]`
- Componentes principais: `[barra superior]`, `[filtros de busca dinâmicos]`, `[foto de perfil]`, `[cards de usuários e empresas]`, `[botões de match e rejeição]`, `[formulários de edição de perfil]`, `[listas de matches]`, `[área de bate-papo]`
- Ação principal esperada do usuário: `[visualizar perfis, realizar matches e conversar com usuários compatíveis]`

## Área Administrativa (`admin`)
- Quem acessa: `[administradores e gestores da plataforma]`
- Objetivo da área: `[gerenciar FAQ, denúncias, usuários e dados gerais do sistema]`
- Telas previstas: `[painel]`, `[gestão de FAQ]`, `[denúncias]`, `[gestão de usuários]`, `[relatórios]`
- Componentes principais: `[cards informativos]`, `[indicadores do sistema]`, `[formulários administrativos]`, `[filtros de busca]`, `[ranking de usuários denunciados]`, `[tabelas semânticas]`
- Ação principal esperada do usuário: `[monitorar a plataforma, gerenciar conteúdos e moderar usuários]`

## Navegação e organização visual
- Estrutura de navegação principal: `[menu superior fixo na área pública e barra superior na aplicação]`
- Fluxo entre telas: `[visitante acessa home > realiza cadastro/login > entra no dashboard > visualiza perfis > realiza matches > acessa chat ou perfil]`
- Hierarquia visual: `[na área pública o foco principal deve ser apresentação e cadastro; na aplicação os perfis e botões de match; na administração os indicadores e gerenciamento]`
- Estados importantes da interface: `[vazio]`, `[carregando]`, `[erro visual]`, `[sucesso]`

## Responsividade e acessibilidade
- Breakpoints desejados: `[mobile]`, `[tablet]`, `[desktop]`
- Ajustes esperados por tela: `[menus viram menu hambúrguer no mobile, listas ficam verticais e formulários adaptam largura automaticamente]`
- Cuidados de acessibilidade: `[alto contraste]`, `[boa legibilidade]`, `[ordem lógica de navegação]`, `[textos claros e objetivos]`
- Elementos semânticos esperados: `[header]`, `[nav]`, `[main]`, `[section]`, `[article]`, `[aside]`, `[footer]`

## Identidade visual
- Paleta principal: `[#446368]`, `[#D8AF87]`, `[#2E3130]`, `[#5F5246]`, `[#B17146]`
- Tipografia: `[sans-serif moderna, limpa e profissional]`
- Referências visuais: `[LinkedIn]`, `[Tinder]`, `[Behance modern UI]`
- Sensação que a interface deve transmitir: `[profissionalismo]`, `[confiança]`, `[modernidade]`, `[simplicidade]`, `[praticidade]`

## Organização de arquivos esperada
- Estilos compartilhados: `views/assets/_common/styles/[arquivo.css]`
- Scripts compartilhados: `views/assets/_common/scripts/[arquivo.js]`
- Estilos da área pública: `views/assets/public/styles/[arquivo.css]`
- Scripts da área pública: `views/assets/public/scripts/[arquivo.js]`
- Estilos da aplicação: `views/assets/app/styles/[arquivo.css]`
- Scripts da aplicação: `views/assets/app/scripts/[arquivo.js]`
- Estilos da área administrativa: `views/assets/admin/styles/[arquivo.css]`
- Scripts da área administrativa: `views/assets/admin/scripts/[arquivo.js]`

## Limite entre etapa atual e integração futura
- Agora: criar HTML semântico, CSS e interações estáticas em JavaScript.
- Depois: integrar com a API usando `HttpClientBase.js`, tratar erros assíncronos e renderizar dados dinamicamente.
- Ao propor código, a IA deve separar o que é **mock estático** do que será substituído por dados reais depois.

## Instrução final para estudantes e IA
Antes de implementar qualquer tela, preencha este arquivo com o máximo de clareza possível. Se uma informação ainda não estiver decidida, registre como `[a definir]` em vez de inventar requisitos.

