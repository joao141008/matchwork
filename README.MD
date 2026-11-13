# MatchWork — Plataforma de conexão entre candidatos e empresas

**Projeto acadêmico | Programação Web II — Técnico em Informática**

O **MatchWork** é uma aplicação web que aproxima candidatos e empresas por meio de vagas e interesses mútuos. A proposta combina a descoberta de oportunidades com uma dinâmica de interação inspirada em aplicativos de relacionamento: o candidato demonstra interesse em uma vaga, a empresa pode retribuir o interesse no candidato e, quando os dois lados se interessam pela mesma oportunidade, é criado um **match** que libera uma conversa.

Este README reúne a visão geral do produto, a arquitetura, os principais fluxos, a estrutura do código, o banco de dados, as rotas da API e as instruções de execução. Também mantém a documentação acadêmica da **SE2 — Etapa 06 — JavaScript orientado a objetos**, que faz parte do histórico de desenvolvimento do projeto.

---

## 🎯 Objetivo do projeto

Desenvolver uma plataforma web para organizar a aproximação entre profissionais e empresas, permitindo que:

- candidatos criem e mantenham seus perfis profissionais;
- empresas cadastrem seus perfis e publiquem oportunidades;
- candidatos descubram vagas e registrem interesse ou dispensa;
- empresas consultem os candidatos interessados em suas vagas e demonstrem interesse de volta;
- a manifestação de interesse dos dois lados gere um match associado à vaga;
- participantes de um match conversem pela plataforma;
- administradores acompanhem indicadores, conteúdo, denúncias e solicitações de suporte.

O projeto utiliza **PHP** no back-end, **MySQL** para persistência e **HTML, CSS e JavaScript** no front-end. A API segue uma organização MVC, com rotas encaminhadas para Controllers e acesso a dados por Models.

## 👥 Tipos de conta

O script SQL define os tipos de usuário abaixo na tabela `user_types`:

| ID | Tipo | Finalidade |
|---:|---|---|
| `1` | `ADMIN` | Administração e moderação da plataforma. |
| `2` | `USER` | Conta base que ainda não está classificada como candidato ou empresa. |
| `3` | `PESSOA` | Perfil de candidato/profissional. |
| `4` | `EMPRESA` | Perfil de empresa. |

Esses identificadores fazem parte dos dados iniciais do banco. Não altere os IDs sem revisar também as verificações de tipo e permissão no back-end e no front-end.

## 🧭 Áreas e funcionalidades

### Área pública

- Página inicial com apresentação do MatchWork.
- Acesso ao login e ao cadastro.
- Cadastro inicial de conta.
- Formulários de conclusão do perfil de candidato ou empresa.
- Consulta às perguntas frequentes (FAQ).

### Área do candidato

- Visualização de vagas disponíveis.
- Demonstração de interesse (*like*) em uma vaga.
- Dispensa de uma vaga (*pass*), para registrar que a oportunidade não interessa.
- Consulta dos interesses registrados.
- Edição do perfil profissional e das áreas de interesse.
- Consulta de empresas/candidatos por meio das telas de perfil público disponíveis.
- Visualização dos matches e acesso às conversas liberadas.

### Área da empresa

- Cadastro e edição dos dados da empresa.
- Cadastro, edição e exclusão de vagas.
- Definição de informações como descrição, requisitos, localização, remuneração, jornada, turno, modelo de trabalho, tipo de contratação e benefícios.
- Associação de áreas profissionais às vagas.
- Inclusão e remoção de imagens da vaga.
- Consulta aos candidatos que demonstraram interesse em suas oportunidades.
- Demonstração de interesse de volta em um candidato para a vaga correspondente.
- Consulta dos matches e acesso às conversas liberadas.

### Área administrativa

- Painel com indicadores gerais da plataforma.
- Visualização de candidatos, empresas e matches registrados.
- Gerenciamento de perguntas frequentes e categorias.
- Acompanhamento de denúncias de usuários.
- Central de suporte para dúvidas, problemas/bugs, sugestões e solicitações recebidas.
- Resposta e atualização de solicitações conforme os recursos implementados no painel.

> **Observação sobre o escopo:** esta lista descreve os módulos e recursos identificados nos arquivos e rotas do projeto enviado. A existência de uma rota ou arquivo não garante, por si só, que todo cenário possível esteja concluído ou validado em produção.

## 💞 Como funciona o match

1. A empresa publica uma vaga.
2. O candidato visualiza a oportunidade e registra interesse nela.
3. A empresa consulta a lista de candidatos interessados naquela vaga.
4. A empresa pode demonstrar interesse de volta em um desses candidatos.
5. Quando há interesse dos dois lados para a mesma vaga, o back-end registra um match.
6. A conversa é vinculada ao match e os participantes podem trocar mensagens.

O vínculo é específico por vaga: o interesse não representa uma combinação genérica entre quaisquer dois usuários. A estrutura do banco relaciona `candidate_user_id`, `company_user_id` e `vacancy_id` para identificar o match.

## 🧰 Tecnologias utilizadas

| Tecnologia | Uso no projeto |
|---|---|
| PHP 8.1.x | Back-end e API REST. |
| MySQL | Banco de dados relacional. |
| PDO | Acesso ao banco de dados. |
| Composer | Gerenciamento e autoload das dependências PHP. |
| CoffeeCode Router | Roteamento da API. |
| Firebase PHP-JWT | Geração e validação de tokens JWT. |
| HTML5 | Estrutura das páginas. |
| CSS3 | Estilização e layout responsivo. |
| JavaScript (ES Modules) | Interações da interface e consumo da API. |
| Apache | Servidor web e reescrita de rotas via `.htaccess`. |
| XAMPP | Ambiente local sugerido para Apache e MySQL. |

O front-end não utiliza um processo de build Node.js no estado atual do projeto: os módulos JavaScript são carregados diretamente pelas páginas.

---

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

| Camada | Responsabilidade |
|---|---|
| **HTML** | Estrutura da interface. |
| **CSS** | Aparência e layout. |
| **Script da tela** | Eventos, leitura dos formulários e atualização da interface. |
| **Entidade** | Representação dos dados e validações. |
| **Service** | Comunicação com as rotas da API. |
| **HttpClientBase** | Requisições HTTP, URL base, cabeçalhos e autenticação. |
| **API/Controller** | Regras das requisições do back-end. |
| **Model** | Comunicação com o banco de dados. |
| **Banco** | Persistência dos dados. |

------------------------------------------------------------------------

# 📂 Estrutura principal

```text
joaowork/
├── README.MD
├── index.html                     # Arquivo inicial de apoio (não é a página pública principal)
│
├── api/
│   ├── .env-sample                # Exemplo de configuração local
│   ├── .htaccess                  # Reescrita das rotas da API
│   ├── composer.json
│   ├── index.php                  # Front Controller da API
│   ├── vendor/                    # Dependências instaladas pelo Composer
│   ├── storage/
│   │   ├── profiles/              # Fotos de perfil enviadas
│   │   └── vacancies/             # Imagens das vagas enviadas
│   └── source/
│       ├── Config/                # Configurações da aplicação
│       ├── Controller/            # Controllers e regras das rotas
│       ├── Core/                  # Conexão, Model base e JWT
│       ├── Models/                # Models de acesso aos dados
│       ├── Support/               # Uploads e funções auxiliares
│       └── Web/                   # Redirecionamento/entrega de páginas
│
├── data-base/
│   ├── sahur.sql                 # Script atual de criação e dados iniciais
│   └── *.mwb                     # Arquivos de modelagem do banco
│
└── views/
    ├── public/                   # Páginas públicas e cadastro
    ├── app/                      # Páginas da área autenticada
    ├── admin/                    # Painel administrativo
    └── assets/
        ├── _common/
        │   ├── classes/          # Entidades e HttpClientBase
        │   ├── prototypes/       # FormController e Toast
        │   ├── services/         # Serviços de comunicação com a API
        │   ├── scripts/          # Sessão, armazenamento e utilitários
        │   └── styles/           # Estilos compartilhados
        ├── public/               # CSS, JS e imagens da área pública
        ├── app/                  # CSS, JS e imagens da aplicação
        └── admin/                # CSS e JS do painel administrativo
```

### Páginas principais

| Caminho | Finalidade |
|---|---|
| `views/public/index.html` | Página inicial pública do MatchWork. |
| `views/public/login.html` | Login. |
| `views/public/signup.html` | Cadastro inicial. |
| `views/public/cadastro-candidato.html` | Complementação do perfil de candidato. |
| `views/public/cadastro-empresa.html` | Complementação do perfil de empresa. |
| `views/app/dashboard.html` | Painel principal da área autenticada. |
| `views/app/interessados.html` | Candidatos interessados nas vagas da empresa. |
| `views/app/profile.html` | Perfil do usuário autenticado. |
| `views/app/user-profile.html` | Visualização de outro perfil. |
| `views/app/matches.html` | Lista de matches. |
| `views/app/chat.html` | Conversa vinculada a um match. |
| `views/admin/index.html` | Painel administrativo. |

O `index.html` localizado na raiz do repositório é um arquivo mínimo de apoio. Para abrir a página inicial do sistema, utilize `views/public/index.html`.

------------------------------------------------------------------------


# 🏗️ Organização do back-end e do front-end

O fluxo geral de uma operação segue esta sequência:

```text
Navegador
   ↓
Página HTML + JavaScript
   ↓
Service específico
   ↓
HttpClientBase (fetch, URL, headers e token)
   ↓
api/index.php (roteador)
   ↓
Controller
   ↓
Model / Core
   ↓
MySQL
```

- **View:** contém a estrutura HTML apresentada ao usuário.
- **Scripts da tela:** cuidam dos eventos, formulários e atualização da interface.
- **Classes/entidades:** representam os dados do domínio e podem aplicar validações/conversões.
- **Services:** concentram as chamadas para as rotas da API.
- **HttpClientBase:** centraliza as requisições HTTP e os cabeçalhos comuns.
- **Controllers:** recebem as requisições e coordenam as operações.
- **Models/Core:** executam operações de persistência e fornecem a infraestrutura de acesso ao banco.

## 🗃️ Banco de dados

O banco é criado pelo arquivo `data-base/sahur.sql`. O nome definido no próprio script é **`db-acme-tarde`**. Esse nome é legado do projeto-base e deve ser mantido na configuração local enquanto o script SQL e a configuração não forem alterados em conjunto.

As principais tabelas são:

| Tabela | Responsabilidade |
|---|---|
| `user_types` | Tipos de conta (ADMIN, USER, PESSOA e EMPRESA). |
| `users` | Credenciais, tipo, status e foto do usuário. |
| `areas` | Catálogo de áreas profissionais. |
| `candidates` | Dados de perfil dos candidatos. |
| `companies` | Dados de perfil das empresas. |
| `candidate_areas` / `company_areas` | Relação entre perfis e áreas de atuação. |
| `vacancies` | Vagas publicadas pelas empresas. |
| `vacancy_areas` | Áreas relacionadas a cada vaga. |
| `vacancy_images` | Caminhos e posições das imagens das vagas. |
| `vacancy_likes` | Interesses de candidatos em vagas. |
| `vacancy_passes` | Vagas dispensadas pelos candidatos. |
| `company_likes` | Interesses de empresas em candidatos para uma vaga. |
| `matches` | Interesse mútuo entre candidato, empresa e vaga. |
| `conversations` / `messages` | Conversas e mensagens dos matches. |
| `reports` | Denúncias de usuários. |
| `questions` | Solicitações de suporte, dúvidas, bugs e sugestões. |
| `faqs_categories` / `faqs` | Categorias e perguntas frequentes. |
| `interactions` | Estrutura de interações mantida no banco-base. |

O SQL também insere áreas profissionais, tipos de usuário, categorias e perguntas frequentes iniciais. Antes de compartilhar ou publicar o sistema, revise os dados iniciais e não utilize credenciais reais de usuários no banco de demonstração.

### Observações sobre nomes herdados

O nome `db-acme-tarde` e o identificador do pacote Composer em `api/composer.json` ainda preservam referências ao projeto-base ACME. Esses nomes não alteram o nome apresentado pela aplicação, mas precisam ser atualizados em conjunto caso a equipe decida padronizá-los. O código também mantém alguns Controllers/Models antigos de produtos e publicadores; eles não aparecem registrados como rotas na versão atual de `api/index.php` e não devem ser tratados como funcionalidades centrais do MatchWork.

Alguns READMEs internos de subpastas, especialmente `api/README.MD`, ainda podem conter endereços e rotas do projeto-base. Para a API desta versão, utilize como referência o catálogo deste README e confirme sempre a declaração efetiva em `api/index.php`.

**Atenção:** `data-base/sahur.sql` contém comandos para remover e recriar tabelas. Faça backup antes de reimportar o script em um banco que já tenha dados importantes.

## 🌐 API REST

O ponto de entrada é `api/index.php`. No ambiente padrão do projeto, a URL base é:

```text
http://localhost/joaowork/api
```

As rotas abaixo são declaradas no arquivo atual `api/index.php`. Os caminhos desta tabela devem ser acrescentados à URL base.

### Saúde da API

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/hello` | Rota simples para verificar se a API está respondendo. |

### Usuários e autenticação

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/users/register` | Cadastro de conta. |
| `POST` | `/users/login` | Login de usuário. |
| `POST` | `/users/register-admin` | Cadastro de administrador. |
| `POST` | `/users/login-admin` | Login de administrador. |
| `PUT` | `/users/update` | Atualização da própria conta. |
| `PUT` | `/users/update-admin` | Atualização de conta administrativa. |
| `GET` | `/users/me` | Dados do usuário autenticado. |
| `GET` | `/users/list` | Listagem de usuários. |
| `GET` | `/users/list/{userId}` | Consulta de usuário por ID. |
| `GET` | `/users/public-profile/{userId}` | Consulta de perfil público. |
| `POST` | `/users/photo` | Envio/atualização de foto de perfil. |
| `DELETE` | `/users/delete/{userId}` | Exclusão de usuário. |

### Perfis e áreas profissionais

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/candidates/register` | Cadastro de perfil de candidato. |
| `PUT` | `/candidates/update` | Atualização de perfil de candidato. |
| `DELETE` | `/candidates/delete` | Exclusão de perfil de candidato. |
| `GET` | `/candidates/list` | Listagem de candidatos. |
| `GET` | `/candidates/list/{candidatesId}` | Consulta de candidato por ID. |
| `POST` | `/companies/register` | Cadastro de perfil de empresa. |
| `PUT` | `/companies/update` | Atualização de perfil de empresa. |
| `DELETE` | `/companies/delete` | Exclusão de perfil de empresa. |
| `GET` | `/companies/list` | Listagem de empresas. |
| `GET` | `/companies/list/{companyId}` | Consulta de empresa por ID. |
| `GET` | `/areas/list` | Lista as áreas profissionais. |
| `GET` | `/areas/list/{areaId}` | Consulta uma área por ID. |

### Vagas e imagens

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/vacancies/list` | Lista vagas disponíveis. |
| `GET` | `/vacancies/list/{vacancyId}` | Consulta uma vaga por ID. |
| `GET` | `/vacancies/company/list` | Lista vagas da empresa autenticada. |
| `POST` | `/vacancies/insert` | Publica uma vaga. |
| `PUT` | `/vacancies/update/{vacancyId}` | Atualiza uma vaga. |
| `DELETE` | `/vacancies/delete/{vacancyId}` | Exclui uma vaga. |
| `POST` | `/vacancies/{vacancyId}/images` | Envia imagens para uma vaga. |
| `DELETE` | `/vacancies/{vacancyId}/images/{imageId}` | Remove uma imagem da vaga. |

### Interesses, matches e conversas

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/interactions/candidate/like` | Candidato demonstra interesse em uma vaga. |
| `GET` | `/interactions/candidate/list` | Lista interesses de vagas do candidato. |
| `POST` | `/interactions/candidate/pass` | Candidato dispensa uma vaga. |
| `GET` | `/interactions/candidate/passes` | Lista vagas dispensadas pelo candidato. |
| `POST` | `/interactions/company/like` | Empresa demonstra interesse em candidato para uma vaga. |
| `GET` | `/interactions/company/list` | Lista interesses da empresa. |
| `GET` | `/matches/list` | Lista matches do usuário. |
| `GET` | `/matches/view/{matchId}` | Consulta um match por ID. |
| `GET` | `/conversations/list` | Lista conversas. |
| `POST` | `/conversations/register` | Registra uma conversa para um match. |
| `GET` | `/conversations/list/{listId}` | Consulta uma conversa. |
| `DELETE` | `/conversations/delete/{deleteId}` | Exclui uma conversa. |
| `GET` | `/messages/list/{conversationId}` | Lista mensagens de uma conversa. |
| `GET` | `/messages/view/{messageId}` | Consulta uma mensagem. |
| `POST` | `/messages/register` | Envia uma mensagem. |
| `DELETE` | `/messages/delete/{deleteId}` | Exclui uma mensagem. |

### Administração, FAQ e suporte

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/admin/dashboard/stats` | Indicadores do painel administrativo. |
| `GET` | `/faqs/list` | Lista perguntas frequentes. |
| `GET` | `/faqs/list/{faqId}` | Consulta uma FAQ por ID. |
| `POST` | `/faqs` | Cadastra uma FAQ. |
| `PUT` | `/faqs/{faqId}` | Atualiza uma FAQ. |
| `DELETE` | `/faqs/{faqsId}` | Exclui uma FAQ. |
| `GET` | `/faqs-categories/list` | Lista categorias de FAQ. |
| `GET` | `/faqs-categories/list/{categoryId}` | Consulta categoria por ID. |
| `POST` | `/faqs-categories` | Cadastra categoria de FAQ. |
| `PUT` | `/faqs-categories/{categoryId}` | Atualiza categoria de FAQ. |
| `DELETE` | `/faqs-categories/{categoryId}` | Exclui categoria de FAQ. |
| `POST` | `/questions/register` | Envia solicitação para o suporte. |
| `GET` | `/questions/list` | Lista solicitações do usuário/área correspondente. |
| `GET` | `/questions/listall` | Lista solicitações para administração. |
| `PUT` | `/questions/{questionId}/answer` | Registra resposta para uma solicitação. |
| `DELETE` | `/questions/delete/{questionId}` | Exclui uma solicitação. |
| `POST` | `/reports/register` | Registra denúncia de usuário. |
| `GET` | `/reports/list` | Lista denúncias. |
| `GET` | `/reports/list/{reportId}` | Consulta denúncia por ID. |
| `PUT` | `/reports/update` | Atualiza uma denúncia. |
| `DELETE` | `/reports/delete/{deleteId}` | Exclui uma denúncia. |

> A lista acima reproduz as rotas declaradas no `api/index.php` deste snapshot. Para detalhes sobre parâmetros obrigatórios, formato de payload e permissões de cada operação, consulte o Controller correspondente em `api/source/Controller/` e o Service do front-end em `views/assets/_common/services/`.

## 🔐 Autenticação, permissões e arquivos enviados

- A autenticação utiliza tokens JWT; os Services compartilham o cabeçalho `Authorization: Bearer <token>` por meio do `HttpClientBase`.
- A API distingue os tipos de conta e deve validar a permissão antes de executar operações restritas.
- O envio da foto de perfil é tratado por `ProfilePhotoUpload.php` e os arquivos são armazenados em `api/storage/profiles/`.
- As imagens das vagas são tratadas por `VacancyImageUpload.php` e armazenadas em `api/storage/vacancies/`.
- Os caminhos dos arquivos são associados aos registros correspondentes no banco de dados.
- O arquivo `api/.env` não deve ser versionado. Utilize `api/.env-sample` como modelo e mantenha a chave JWT local/privada.

---

# 🧩 Registro acadêmico — SE2, Etapa 06 — JavaScript orientado a objetos

## Branch da etapa

A orientação original da atividade previa uma branch chamada `javascript-poo`. No ZIP analisado, a branch registrada como atual é `main`. Portanto, não execute `git checkout -b javascript-poo` sem antes verificar se essa branch já existe e se ela ainda faz parte do fluxo de entrega da equipe.

Para conferir a branch atual:

```bash
git branch --show-current
git branch
```

Se a atividade exigir uma branch própria e ela ainda não existir, crie-a a partir da branch-base indicada pelo professor/equipe:

```bash
git switch -c javascript-poo
```

------------------------------------------------------------------------

# Parte A --- POO clássica com `class`

As entidades utilizadas pelo front-end foram organizadas na pasta:

``` text
views/assets/_common/classes/
```

Atualmente estão presentes as seguintes classes:

``` text
Area.js
Candidate.js
Company.js
Conversation.js
HttpClientBase.js
Interaction.js
Message.js
Question.js
User.js
UserMatch.js
Users.js
Vacancy.js
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

**Divergência importante:** a classe JavaScript `Company.js` ainda contém
campos como `salaryOffer`, `workload`, `workModel` e `employmentType`. Já o
Controller e a tabela `companies` no banco atual trabalham também com
`website` e `company_size`, e não tratam esses campos de condições da vaga
como atributos do perfil da empresa. Portanto, não use `Company.js` como
contrato definitivo do cadastro da empresa sem antes alinhar a classe com
`Companies.php`, `Company.php` e `CompanyService.js`.

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

### Conversation, Message, UserMatch, Question, Area, Interaction e Vacancy

O projeto também possui classes para representar conversas, mensagens,
matches, perguntas de suporte, áreas profissionais, interações e vagas:

```text
Area.js
Conversation.js
Interaction.js
Message.js
Question.js
UserMatch.js
Vacancy.js
```

A pasta ainda contém `Users.js`, além de `User.js`. Essas classes dão
suporte à organização dos dados utilizados pela aplicação. Consulte cada
arquivo antes de ampliar ou alterar os atributos, pois os campos precisam
permanecer compatíveis com o payload esperado pela API.

As classes seguem a organização por entidades, com construtores,
propriedades privadas quando aplicável, getters/setters e métodos de
conversão, como `toJSON()` ou `fromJSON()` nos casos implementados.

**Compatibilidade das entidades:** `Interaction.js` representa a estrutura
genérica `interactions`, que foi mantida no banco-base. O fluxo atual de
interesse por vagas utiliza principalmente as tabelas específicas
`vacancy_likes`, `vacancy_passes` e `company_likes`. Além disso,
`Question.js` não espelha todos os campos atuais de `questions` (por
exemplo, o banco possui `request_type` e não possui `answered_at`). Revise
a classe e o Controller correspondentes antes de utilizar esses objetos
como payload completo da API.

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
AdminDashboardService.js
AreaService.js
CandidateService.js
CompanyService.js
ConversationService.js
FaqService.js
InteractionService.js
MessageService.js
QuestionService.js
ReportsService.js
UserMatchService.js
UsersService.js
VacancyService.js
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
DELETE /questions/delete/{questionId}
```

------------------------------------------------------------------------

### UserMatchService

Utiliza:

``` text
GET /matches/list
GET /matches/view/{matchId}
```


### Outros Services do projeto

| Service | Responsabilidade principal |
|---|---|
| `VacancyService` | Listar, consultar, cadastrar, atualizar e excluir vagas; enviar e remover imagens. |
| `InteractionService` | Registrar/listar likes de candidatos e empresas e registrar passes. |
| `ConversationService` | Listar, criar, consultar e excluir conversas. |
| `MessageService` | Listar, enviar, consultar e excluir mensagens. |
| `AreaService` | Consultar as áreas profissionais disponíveis. |
| `FaqService` | Consultar e administrar FAQs e categorias. |
| `ReportsService` | Registrar, listar, atualizar e excluir denúncias. |
| `AdminDashboardService` | Consultar os indicadores do painel administrativo. |

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

As rotas completas atualmente declaradas estão documentadas na seção
[API REST](#-api-rest), no início deste README, e são registradas em:

```text
api/index.php
```

Sempre confira o `api/index.php` antes de documentar uma rota nova. O nome
de um método em um Service não substitui a confirmação de que a rota está
registrada e implementada no Controller correspondente.

------------------------------------------------------------------------


# 🚀 Como executar o projeto localmente

As instruções abaixo consideram Windows com XAMPP e o repositório instalado
em `C:\xampp\htdocs\joaowork`. Se a pasta tiver outro nome, ajuste as URLs
e as variáveis de ambiente.

## 1. Pré-requisitos

- XAMPP com Apache e MySQL;
- PHP **8.1.x** (é a versão declarada no `composer.json`);
- Composer;
- MySQL/MariaDB compatível com o script SQL;
- navegador atualizado.

## 2. Posicionar o projeto

Extraia ou clone o projeto para:

```text
C:\xampp\htdocs\joaowork
```

O nome `joaowork` é utilizado como padrão nas configurações locais do
projeto. Se utilizar outro nome de pasta, ajuste `CONF_URL_BASE` e
`CONF_URL_TEST` no arquivo `api/.env`.

## 3. Criar o banco de dados

1. Inicie o Apache e o MySQL pelo XAMPP.
2. Abra o phpMyAdmin em `http://localhost/phpmyadmin`.
3. Faça backup do banco atual, caso já exista.
4. Importe o arquivo `data-base/sahur.sql`.

O script cria/seleciona o banco `db-acme-tarde` e recria as tabelas e os
dados iniciais. Ele contém comandos `DROP TABLE IF EXISTS`; importar o
arquivo novamente pode apagar os dados que já estiverem nessas tabelas.

O nome `db-acme-tarde` é o nome que o script atual utiliza, mesmo que o
produto seja chamado MatchWork. Para trocar esse nome, altere tanto o SQL
quanto `CONF_DB_NAME` em `api/.env`.

## 4. Configurar as variáveis da API

O arquivo de configuração carrega as variáveis de `api/.env`. Copie o
modelo:

```bat
cd C:\xampp\htdocs\joaowork
copy api\.env-sample api\.env
```

Abra `api/.env` e confira os valores:

```dotenv
CONF_URL_BASE=http://localhost/joaowork
CONF_URL_TEST=http://localhost/joaowork

CONF_DB_HOST=localhost
CONF_DB_NAME=db-acme-tarde
CONF_DB_USER=root
CONF_DB_PORT=3306
CONF_DB_PASS=

JWT_SECRET_KEY=coloque-uma-chave-aleatoria-longa-aqui
```

Ajuste usuário e senha do MySQL conforme a configuração da sua máquina.
Não compartilhe o `.env` com senhas ou chaves privadas e não coloque esse
arquivo em commits.

## 5. Instalar dependências do PHP

No terminal, entre na pasta `api` e execute:

```bash
cd C:\xampp\htdocs\joaowork\api
composer install
```

O Composer instala as dependências declaradas em `api/composer.json`,
incluindo CoffeeCode Router e Firebase PHP-JWT.

## 6. Verificar a API

Com Apache e MySQL ativos, acesse:

```text
http://localhost/joaowork/api/hello
```

A rota `/hello` é a verificação simples de disponibilidade da API. Se as
rotas amigáveis não funcionarem, confira se o `mod_rewrite` do Apache está
habilitado e se o `.htaccess` de `api/` pode ser aplicado pelo Apache.

## 7. Abrir o front-end

A página inicial pública do sistema é:

```text
http://localhost/joaowork/views/public/index.html
```

Outras páginas públicas ficam em `views/public/`. As páginas da aplicação
ficam em `views/app/` e o painel de administração em `views/admin/`.

> Não utilize o arquivo `index.html` da raiz como entrada principal: no
> snapshot analisado ele é apenas um HTML mínimo de apoio. Também não abra
> as páginas diretamente por `file://`; utilize o servidor Apache para que
> os módulos JavaScript e as chamadas à API funcionem no mesmo contexto.

## 8. Armazenamento de imagens

Os uploads de fotos e imagens de vagas são gravados em:

```text
api/storage/profiles/
api/storage/vacancies/
```

O servidor PHP precisa ter permissão de escrita nessas pastas. Em uma
instalação limpa, os diretórios podem ser criados automaticamente durante
o primeiro upload, conforme as classes de suporte.

------------------------------------------------------------------------

# 🌿 Branch e fluxo de trabalho com Git

O snapshot enviado registra a branch `main`. A atividade acadêmica da
Etapa 06 citava originalmente `javascript-poo`, mas essa branch não deve
ser criada às cegas caso já exista no repositório remoto ou local.

Antes de começar:

```bash
git status
git branch --all
```

Para criar uma branch de trabalho nova, utilize o nome combinado com a
equipe/professor. Exemplo, somente quando a branch ainda não existir:

```bash
git switch -c javascript-poo
```

Depois de testar as alterações:

```bash
git add .
git commit -m "Descreve as alterações realizadas"
git push -u origin javascript-poo
```

Não inclua `api/.env`, arquivos temporários, credenciais ou dados pessoais
em commits. Confira o `.gitignore` antes de enviar alterações.

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
10. O README continua correspondendo ao código e à branch utilizados na entrega.

------------------------------------------------------------------------

# 📚 Conclusão

O MatchWork reúne uma aplicação web para aproximar candidatos e empresas,
com cadastro de perfis, publicação de vagas, interesses, matches e
conversas. A API em PHP organiza as operações por Controllers e Models,
enquanto o front-end em HTML, CSS e JavaScript consome os serviços
centralizados em `HttpClientBase`.

A documentação também registra a **SE2 — Etapa 06 — JavaScript orientado
a objetos**. Nessa parte, a POO clássica, baseada em `class`, demonstra
encapsulamento, construtores, getters, setters, conversão de dados e
herança. A POO prototípica, baseada em `Object.create()`, aparece em
componentes reutilizáveis como `FormController` e `Toast`.

A intenção é manter a documentação alinhada ao código real: quando uma
rota, tabela, classe ou página mudar, atualize a seção correspondente deste
README e consulte o arquivo de implementação antes de registrar novos
comportamentos como concluídos.
