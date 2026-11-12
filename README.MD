# 📁 ACME - Projeto Didático MVC

## Programação Web II --- Técnico em Informática

------------------------------------------------------------------------

## 🎯 Objetivo do Projeto

O projeto utiliza uma arquitetura **MVC**, com **PHP no back-end** e
**HTML, CSS e JavaScript no front-end**.

Nesta etapa, **SE2 --- Etapa 06 --- JavaScript orientado a objetos**, o
front-end foi organizado para demonstrar:

-   POO clássica com `class`;
-   encapsulamento com propriedades privadas;
-   construtores, getters e setters;
-   conversão de objetos JavaScript para payloads da API;
-   serviços HTTP baseados em `HttpClientBase`;
-   POO prototípica com `Object.create`;
-   componente reutilizável de Toast;
-   controlador reutilizável de formulários;
-   separação entre entidade, serviço HTTP e tela.

O objetivo é aplicar POO sem alterar o comportamento esperado do sistema
e manter a comunicação com as rotas reais da API.

------------------------------------------------------------------------

# 🧱 Arquitetura do projeto

O sistema possui três partes principais:

``` text
Usuário
   ↓
View / HTML
   ↓
JavaScript da tela
   ↓
Service
   ↓
HttpClientBase
   ↓
API PHP
   ↓
Controller
   ↓
Model
   ↓
Banco de Dados
```

### Responsabilidades

  -----------------------------------------------------------------------
  Camada                              Responsabilidade
  ----------------------------------- -----------------------------------
  **HTML**                            Estrutura da interface

  **CSS**                             Aparência e layout

  **Script da tela**                  Eventos, leitura dos formulários e
                                      atualização da interface

  **Entidade**                        Representação dos dados e
                                      validações

  **Service**                         Comunicação com as rotas da API

  **HttpClientBase**                  Requisições HTTP, URL base,
                                      cabeçalhos e autenticação

  **API/Controller**                  Regras das requisições do back-end

  **Model**                           Comunicação com o banco de dados

  **Banco**                           Persistência dos dados
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 📂 Estrutura principal

``` text
joaowork/
│
├── README.MD
│
├── api/
│   ├── index.php
│   ├── composer.json
│   └── source/
│       ├── Controller/
│       ├── Core/
│       ├── Models/
│       └── Support/
│
├── data-base/
│   └── dump.sql
│
├── index.html
│
└── views/
    ├── public/
    └── assets/
        ├── _common/
        │   ├── classes/
        │   ├── prototypes/
        │   ├── services/
        │   └── scripts/
        │
        ├── app/
        ├── admin/
        └── public/
```

------------------------------------------------------------------------

# 🧩 SE2 --- Etapa 06 --- JavaScript orientado a objetos

## Branch da etapa

A implementação da etapa deve ficar na branch:

``` bash
git checkout -b javascript-poo
```

A branch deve ser criada a partir da versão estável anterior do projeto.

------------------------------------------------------------------------

# Parte A --- POO clássica com `class`

As entidades utilizadas pelo front-end foram organizadas na pasta:

``` text
views/assets/_common/classes/
```

Atualmente estão presentes as seguintes classes:

``` text
Candidate.js
Company.js
Conversation.js
HttpClientBase.js
Message.js
User.js
UserMatch.js
Question.js
```

## Encapsulamento

As entidades utilizam campos privados com `#`.

Exemplo:

``` javascript
export default class Candidate {
    #id;
    #fullName;
    #cpf;

    constructor({ id = null, fullName = "", cpf = "" } = {}) {
        this.id = id;
        this.fullName = fullName;
        this.cpf = cpf;
    }
}
```

Os atributos privados não podem ser acessados diretamente de fora da
classe.

O acesso acontece por meio de getters e setters:

``` javascript
get fullName() {
    return this.#fullName;
}

set fullName(value) {
    if (typeof value !== "string" || value.trim() === "") {
        throw new TypeError("O nome completo é obrigatório");
    }

    this.#fullName = value.trim();
}
```

Isso permite aplicar validações antes de alterar o estado do objeto.

------------------------------------------------------------------------

## Entidades

### Candidate

Arquivo:

``` text
views/assets/_common/classes/Candidate.js
```

Representa os dados de um candidato.

Entre suas propriedades estão:

-   `id`;
-   `userId`;
-   `fullName`;
-   `cpf`;
-   `location`;
-   `interestArea`;
-   `salaryExpectation`;
-   `workSchedule`;
-   `shift`;
-   `workModel`;
-   `employmentType`;
-   `about`.

A classe possui:

-   construtor;
-   propriedades privadas;
-   getters;
-   setters;
-   validações;
-   método `toJSON()`.

------------------------------------------------------------------------

### Company

Arquivo:

``` text
views/assets/_common/classes/Company.js
```

Representa os dados de uma empresa.

Entre suas propriedades estão:

-   `id`;
-   `userId`;
-   `companyName`;
-   `cnpj`;
-   `location`;
-   `industry`;
-   `salaryOffer`;
-   `workload`;
-   `workModel`;
-   `employmentType`;
-   `description`.

A classe possui:

-   construtor;
-   propriedades privadas;
-   getters;
-   setters;
-   validações;
-   método `toJSON()`.

------------------------------------------------------------------------

### User

Arquivo:

``` text
views/assets/_common/classes/User.js
```

Representa os dados básicos de um usuário.

Possui propriedades privadas para:

-   `id`;
-   `typeId`;
-   `password`;
-   `email`;
-   `photo`;
-   `active`;
-   `token`.

Também possui getters, setters e `toJSON()`.

------------------------------------------------------------------------

### Conversation, Message, UserMatch e Question

Também existem classes para representar outras entidades utilizadas pelo
sistema:

``` text
Conversation.js
Message.js
UserMatch.js
Question.js
```

Essas classes seguem a mesma ideia de encapsulamento, utilizando
propriedades privadas, construtores, getters, setters e conversão para
dados utilizados pela aplicação.

Algumas entidades também possuem métodos de conversão de payload da API
para objetos JavaScript, como `fromJSON()`.

------------------------------------------------------------------------

# 🔄 Conversão entre objeto JavaScript e API

As entidades possuem métodos de conversão, principalmente:

``` javascript
toJSON()
```

Esse método transforma o objeto em uma estrutura simples que pode ser
utilizada na comunicação com a API.

Exemplo:

``` javascript
const candidate = new Candidate({
    id: 1,
    fullName: "João Silva",
    cpf: "000.000.000-00",
    location: "Charqueadas"
});

const payload = candidate.toJSON();
```

O objetivo é separar o objeto utilizado pelo JavaScript da estrutura
necessária para comunicação com o back-end.

------------------------------------------------------------------------

# 🌐 Serviços HTTP

Os serviços ficam em:

``` text
views/assets/_common/services/
```

Eles estendem:

``` text
HttpClientBase.js
```

A classe base é responsável por funcionalidades comuns das requisições
HTTP:

-   URL base;
-   cabeçalhos;
-   autenticação;
-   `GET`;
-   `POST`;
-   `PUT`;
-   `DELETE`;
-   `FormData`;
-   `URLSearchParams`.

Exemplo:

``` javascript
export default class Users extends HttpClientBase {
    async login(email, password) {
        return this.postForm("/users/login", { email, password });
    }
}
```

Dessa maneira, os scripts das telas não precisam chamar `fetch()`
diretamente.

------------------------------------------------------------------------

## Serviços existentes

``` text
CandidateService.js
CompanyService.js
ConversationService.js
MessageService.js
QuestionService.js
UserMatchService.js
UsersService.js
```

### UsersService

Responsável pelas operações de usuário, incluindo:

``` text
/users/register
/users/login
/users/login-admin
/users/update
/users/update-admin
```

O login utiliza `POST`, de acordo com a rota existente no back-end:

``` php
$route->post("/login", "Users:auth");
```

------------------------------------------------------------------------

### CandidateService

Utiliza as rotas:

``` text
POST   /candidates/register
PUT    /candidates/update
DELETE /candidates/delete
GET    /candidates/list
```

------------------------------------------------------------------------

### CompanyService

Utiliza as rotas:

``` text
POST   /companies/register
PUT    /companies/update
DELETE /companies/delete
GET    /companies/list
```

------------------------------------------------------------------------

### QuestionService

Utiliza:

``` text
POST   /questions/register
GET    /questions/list
GET    /questions/listall
DELETE /questions/delete
```

------------------------------------------------------------------------

### UserMatchService

Utiliza:

``` text
GET /matches/list
GET /matches/view/{matchId}
```

------------------------------------------------------------------------

# 🧬 Parte B --- POO prototípica

A POO prototípica foi utilizada na pasta:

``` text
views/assets/_common/prototypes/
```

Existem duas funcionalidades principais:

``` text
FormController.js
Toast.js
```

Elas utilizam `Object.create()` para criar objetos a partir de
protótipos.

------------------------------------------------------------------------

## FormController

Arquivo:

``` text
views/assets/_common/prototypes/FormController.js
```

O protótipo possui métodos reutilizáveis:

``` javascript
serialize(form)
clear(form)
validate(form)
```

O objeto é criado utilizando:

``` javascript
const FormController = Object.create(FormControllerPrototype);
```

Os métodos ficam no protótipo e não são recriados individualmente para
cada objeto.

### Funcionalidades

**serialize**

Transforma os dados de um formulário em objeto:

``` javascript
serialize(form)
```

**clear**

Limpa o formulário:

``` javascript
clear(form)
```

**validate**

Verifica a validade do formulário:

``` javascript
validate(form)
```

------------------------------------------------------------------------

## Toast

Arquivo:

``` text
views/assets/_common/prototypes/Toast.js
```

O Toast também utiliza `Object.create()`:

``` javascript
const Toast = Object.create(ToastPrototype);
```

O protótipo possui os métodos:

``` text
show()
success()
warning()
error()
```

Os tipos aceitos são:

``` text
success
warning
error
```

A grafia utilizada é `success`, conforme solicitado na atividade.

### Exemplo

``` javascript
Toast.success("Cadastro realizado com sucesso!");
Toast.warning("Atenção!");
Toast.error("Não foi possível realizar a operação.");
```

O componente adiciona a mensagem à página e remove o elemento
automaticamente após alguns segundos.

------------------------------------------------------------------------

# 🔁 Compartilhamento dos protótipos

A principal diferença entre `class` e `Object.create()` nesta etapa é a
forma como o comportamento é compartilhado.

Na POO prototípica, os métodos ficam em um objeto protótipo:

``` javascript
const FormControllerPrototype = {
    serialize(form) {
        // ...
    },

    clear(form) {
        // ...
    },

    validate(form) {
        // ...
    }
};
```

Objetos podem ser criados a partir dele:

``` javascript
const controller1 = Object.create(FormControllerPrototype);
const controller2 = Object.create(FormControllerPrototype);
```

Os dois objetos utilizam os mesmos métodos disponíveis no protótipo.

Isso evita recriar os métodos em cada objeto.

------------------------------------------------------------------------

# 🔐 Encapsulamento

O encapsulamento é demonstrado principalmente pelas classes de entidade.

Exemplo:

``` javascript
#email;
#password;
#token;
```

Esses atributos são privados.

O acesso é controlado pelos getters e setters:

``` javascript
get email() {
    return this.#email;
}

set email(value) {
    // validação
}
```

Assim, a classe controla como seus dados podem ser alterados.

------------------------------------------------------------------------

# 🧬 Herança

A herança é utilizada nos serviços HTTP.

A classe:

``` text
HttpClientBase
```

possui métodos comuns de comunicação HTTP.

Os serviços especializados herdam dessa classe:

``` javascript
export default class Candidate extends HttpClientBase {
    // métodos específicos
}
```

O mesmo ocorre com serviços como:

``` text
CompanyService
UsersService
QuestionService
MessageService
ConversationService
UserMatchService
```

Dessa forma, os serviços reutilizam os métodos HTTP da classe base.

------------------------------------------------------------------------

# 🧩 Composição

A composição ocorre quando uma funcionalidade utiliza diferentes objetos
especializados para realizar uma operação.

Por exemplo, a tela de cadastro utiliza um serviço HTTP, enquanto o
serviço utiliza `HttpClientBase` para realizar a requisição.

O fluxo fica:

``` text
Tela
 ↓
Service
 ↓
HttpClientBase
 ↓
API
```

Cada parte possui uma responsabilidade diferente.

------------------------------------------------------------------------

# 🧪 Validações

As entidades possuem validações nos setters.

Exemplo:

``` javascript
set fullName(value) {
    if (typeof value !== "string" || value.trim() === "") {
        throw new TypeError("O nome completo é obrigatório");
    }

    this.#fullName = value.trim();
}
```

Também existem validações para IDs, e-mails, CPF, CNPJ, localização e
outros campos conforme a entidade.

Isso evita que valores inválidos sejam colocados diretamente nos
atributos privados.

------------------------------------------------------------------------

# 🔔 Toast e tratamento de respostas

As mensagens de interface devem utilizar o componente `Toast` para
apresentar estados de:

``` text
success → verde
warning → amarelo
error   → vermelho
```

O componente valida o tipo recebido e não aceita tipos desconhecidos.

As respostas da API devem ser verificadas antes de serem apresentadas ao
usuário, evitando mostrar estruturas inteiras ou dados técnicos como
mensagem.

Quando ocorrer uma resposta inesperada, o erro deve ser tratado
explicitamente para não ser silenciosamente ignorado.

------------------------------------------------------------------------

# 📡 Rotas reais utilizadas

As principais rotas relacionadas à etapa estão definidas em:

``` text
api/index.php
```

### Usuários

``` text
POST /users/register
POST /users/login
PUT  /users/update
```

### Candidatos

``` text
POST   /candidates/register
PUT    /candidates/update
DELETE /candidates/delete
GET    /candidates/list
```

### Empresas

``` text
POST   /companies/register
PUT    /companies/update
DELETE /companies/delete
GET    /companies/list
```

### Perguntas

``` text
POST   /questions/register
GET    /questions/list
GET    /questions/listall
DELETE /questions/delete
```

### Matches

``` text
GET /matches/list
GET /matches/view/{matchId}
```

------------------------------------------------------------------------

# 🚀 Como executar o projeto

## 1. Preparar o banco

O banco está na pasta:

``` text
data-base/
```

O arquivo principal é:

``` text
data-base/dump.sql
```

Importe o arquivo pelo phpMyAdmin ou pelo MySQL.

------------------------------------------------------------------------

## 2. Configurar a API

A API está localizada em:

``` text
api/
```

O projeto utiliza PHP e Composer.

Instale as dependências:

``` bash
composer install
```

------------------------------------------------------------------------

## 3. Servidor

O `HttpClientBase` utiliza como URL base:

``` text
http://localhost/joaowork/api
```

Portanto, o projeto deve estar disponível no servidor local com essa
estrutura de caminho.

------------------------------------------------------------------------

## 4. Abrir o front-end

A aplicação possui páginas públicas e páginas da área logada:

``` text
views/public/
views/app/
views/assets/
```

As páginas carregam os scripts JavaScript correspondentes por meio de
módulos ES.

------------------------------------------------------------------------

# 🌿 Branch da Etapa 06

Para trabalhar nesta etapa:

``` bash
git checkout -b javascript-poo
```

Verifique a branch atual:

``` bash
git branch
```

Depois de concluir as alterações:

``` bash
git add .
git commit -m "Implementa POO clássica e prototípica no frontend"
git push -u origin javascript-poo
```

------------------------------------------------------------------------

# 🧪 Evidências para a entrega

Para demonstrar a implementação da etapa, devem ser registradas
evidências das funcionalidades funcionando.

## CRUD

Registrar evidências de:

-   cadastro;
-   listagem;
-   edição;
-   exclusão;
-   mensagens de sucesso;
-   mensagens de erro;
-   estados de carregamento.

As evidências devem mostrar a tela, a requisição realizada e, quando
necessário, a resposta da API.

## POO clássica

Registrar exemplos de:

-   entidade criada com `new`;
-   getters e setters;
-   validação;
-   atributo privado;
-   `toJSON()` ou `fromJSON()`.

## POO prototípica

Registrar:

-   `Object.create()`;
-   dois objetos criados a partir do mesmo protótipo;
-   métodos compartilhados pelo protótipo;
-   utilização do `FormController`;
-   utilização do `Toast`.

------------------------------------------------------------------------

# ⚠️ Pontos importantes antes da entrega

A documentação deve corresponder ao código que realmente está sendo
utilizado pelas telas.

Não basta possuir arquivos de classes e protótipos. As classes precisam
ser instanciadas e utilizadas pelo front-end, e os serviços precisam ser
chamados pelas telas.

Antes da entrega final, verificar especialmente:

1.  As entidades estão sendo utilizadas pelas telas, e não apenas
    criadas na pasta `classes/`.
2.  Os serviços não possuem `fetch()` diretamente nas telas.
3.  Os serviços estendem `HttpClientBase`.
4.  O CRUD da entidade principal e das duas entidades escolhidas está
    integrado às rotas reais.
5.  Os métodos de serviço correspondem às rotas reais da API.
6.  O `Toast` está sendo utilizado nas operações de sucesso, aviso e
    erro.
7.  Os estados de carregamento estão presentes quando necessário.
8.  As respostas inesperadas da API não são silenciosamente ignoradas.
9.  As evidências da execução foram registradas.
10. O README continua correspondendo ao código entregue na branch
    `javascript-poo`.

------------------------------------------------------------------------

# 📚 Conclusão

A Etapa 06 organiza o JavaScript do projeto utilizando duas formas de
programação orientada a objetos.

A **POO clássica**, baseada em `class`, é utilizada para representar as
entidades e os serviços HTTP, com encapsulamento, construtores, getters,
setters e herança.

A **POO prototípica**, baseada em `Object.create()`, é utilizada em
funcionalidades reutilizáveis como `FormController` e `Toast`,
permitindo compartilhar métodos por meio de protótipos.

A separação dessas responsabilidades permite que a interface, as
entidades, os serviços HTTP e a API trabalhem de maneira organizada,
mantendo o código reutilizável e facilitando a manutenção do sistema.







<!-- # 📁 ACME - Projeto Didático MVC

## Programação Web II — Técnico em Informática

---

### 🎯 Objetivo do Projeto

Este projeto tem como objetivo ensinar o padrão de arquitetura **MVC (Model-View-Controller)** utilizando
**PHP** no back-end e **HTML, CSS e JavaScript** no front-end.

---

### 🧱 O que é MVC?

O **MVC** é um padrão de arquitetura de software que separa a aplicação em três camadas principais:

| Camada         | Responsabilidade                                                                 |
|----------------|----------------------------------------------------------------------------------|
| **Model**      | Representa os dados e as regras de negócio. Faz a comunicação com o banco de dados. |
| **View**       | É a interface do usuário. Tudo que o usuário vê (HTML, CSS, JS).                 |
| **Controller** | Recebe as requisições, processa a lógica e decide qual resposta enviar.          |

```
Usuário → [View] → [Controller] → [Model] → Banco de Dados
                                      ↓
                              Resposta ao Usuário
```

---

### 📂 Estrutura de Pastas do Projeto

```
acme-3am-g1/
│
├── index.html          ← Página inicial (ponto de entrada do front-end)
├── README.MD           ← Este arquivo (documentação geral do projeto)
│
├── api/                ← Back-end: API REST em PHP (onde mora o MVC)
│   ├── index.php       ← Ponto de entrada da API (Front Controller)
│   ├── .htaccess       ← Reescrita de URLs amigáveis (Apache)
│   ├── composer.json   ← Gerenciador de dependências PHP
│   ├── vendor/         ← Bibliotecas de terceiros (autoload do Composer)
│   └── source/         ← Código-fonte organizado em MVC
│       ├── Config/     ← Configurações (banco de dados, constantes, etc.)
│       ├── Controller/ ← Controllers — lógica das rotas da API
│       ├── Core/       ← Núcleo do sistema (conexão com BD, roteador)
│       ├── Models/     ← Models — representação das tabelas do banco
│       └── Support/    ← Funções auxiliares (helpers)
│
├── data-base/          ← Scripts SQL para criação do banco de dados
│
├── storage/            ← Armazenamento de arquivos (uploads, logs, etc.)
│
└── views/              ← Front-end: Interfaces do usuário
    └── assets/         ← Recursos estáticos (CSS, JS, imagens)
        ├── _common/    ← Recursos compartilhados entre todas as views
        ├── admin/      ← Recursos do painel administrativo
        ├── app/        ← Recursos da área logada (aplicação)
        └── public/     ← Recursos da área pública (visitante)
```

---

### 🚀 Como funciona o fluxo?

1. O **usuário** acessa a página pelo navegador (`index.html` ou uma view).
2. O **JavaScript** do front-end faz requisições para a **API** (`api/`).
3. O **Router** (`Core/Router.php`) recebe a URL e direciona para o **Controller** correto.
4. O **Controller** (`Controller/Api.php`) processa a requisição e consulta o **Model**.
5. O **Model** (`Models/User.php`) busca ou salva dados no **banco de dados**.
6. A resposta é enviada em **JSON** de volta ao front-end.
7. O **JavaScript** atualiza a tela com os dados recebidos.

---

### 📚 Tecnologias Utilizadas

| Tecnologia   | Uso                              |
|--------------|----------------------------------|
| **PHP**      | Back-end (API REST com MVC)      |
| **HTML**     | Estrutura das páginas            |
| **CSS**      | Estilização das páginas          |
| **JavaScript** | Interatividade e consumo da API |
| **MySQL**    | Banco de dados relacional        |
| **Composer** | Gerenciador de dependências PHP  |
| **Apache**   | Servidor web com reescrita de URL|

---

> 💡 **Dica:** Cada pasta possui seu próprio `README.MD` com explicações detalhadas.
> Navegue pelas pastas para aprender mais sobre cada parte do projeto! -->
