Web Service - ACME

Base URL:

http://localhost/acme-3am/api

Todos os dados são enviados e recebidos em JSON.

Rotas
Hello
GET /hello

Verifica se a API está funcionando.

CRUD: Read

Usuários
POST /users/register

Cadastra um usuário comum.

CRUD: Create

O que faz:

Cria um novo usuário.
Salva email e senha.
POST /users/login

Realiza o login do usuário.

CRUD: Não faz parte do CRUD

O que faz:

Verifica email e senha.
Retorna o token de autenticação.
PUT /users/update

Atualiza os dados do usuário logado.

CRUD: Update

O que faz:

Altera informações do usuário.
POST /users/register-admin

Cadastra um administrador.

CRUD: Create

O que faz:

Cria um usuário administrador.
POST /users/login-admin

Login do administrador.

CRUD: Não faz parte do CRUD

O que faz:

Autentica um administrador.
PUT /users/update-admin

Atualiza os dados do administrador.

CRUD: Update

O que faz:

Altera informações do administrador.
Produtos
GET /products/list

Lista todos os produtos.

CRUD: Read

O que faz:

Retorna todos os produtos cadastrados.
GET /products/list/{productId}

Busca um produto pelo ID.

CRUD: Read

O que faz:

Retorna um único produto.
POST /products

Cadastra um novo produto.

CRUD: Create

O que faz:

Insere um produto no banco.
PUT /products/{productId}

Atualiza um produto.

CRUD: Update

O que faz:

Altera as informações do produto.
DELETE /products/{productId}

Remove um produto.

CRUD: Delete

O que faz:

Exclui o produto pelo ID.
Categorias de Produtos
GET /categories-products/list

Lista todas as categorias.

CRUD: Read

O que faz:

Retorna todas as categorias.
GET /categories-products/list/{categoryId}

Busca uma categoria.

CRUD: Read

O que faz:

Retorna uma categoria pelo ID.
POST /categories-products

Cria uma categoria.

CRUD: Create

O que faz:

Insere uma nova categoria.
Categorias de FAQ
GET /faqs-categories/list

Lista todas as categorias de FAQ.

CRUD: Read

O que faz:

Retorna todas as categorias.
GET /faqs-categories/list/{categoryId}

Busca uma categoria pelo ID.

CRUD: Read

O que faz:

Retorna uma categoria específica.
POST /faqs-categories

Cria uma categoria de FAQ.

CRUD: Create

O que faz:

Cadastra uma nova categoria.
POST /faqs-categories/{categoryId}

Atualiza uma categoria.

CRUD: Update

O que faz:

Altera os dados da categoria.

Observação: o ideal seria utilizar PUT nessa rota.

FAQ
GET /faqs/list

Lista todas as perguntas.

CRUD: Read

O que faz:

Retorna todas as FAQs.
GET /faqs/list/{faqId}

Busca uma FAQ pelo ID.

CRUD: Read

O que faz:

Retorna uma FAQ específica.
POST /faqs

Cria uma FAQ.

CRUD: Create

O que faz:

Cadastra uma nova pergunta e resposta.
PUT /faqs/{faqId}

Atualiza uma FAQ.

CRUD: Update

O que faz:

Edita uma FAQ existente.
Candidatos
POST /candidates/register

Cadastra um candidato.

CRUD: Create

O que faz:

Cria o perfil do candidato.
Vincula ao usuário logado.
PUT /candidates/update

Atualiza o candidato.

CRUD: Update

O que faz:

Altera os dados do perfil do candidato.
DELETE /candidates/delete

Remove (desativa) um candidato.

CRUD: Delete

O que faz:

Realiza exclusão lógica do candidato.
Empresas
POST /companies/register

Cadastra uma empresa.

CRUD: Create

O que faz:

Cria o perfil da empresa.
PUT /companies/update

Atualiza uma empresa.

CRUD: Update

O que faz:

Edita os dados da empresa.
DELETE /companies/delete

Remove (desativa) uma empresa.

CRUD: Delete

O que faz:

Realiza exclusão lógica da empresa.
Interações
POST /interactions/register

Registra uma interação.

CRUD: Create

O que faz:

Salva um like ou dislike entre usuários.
Não permite repetir a mesma interação.
GET /interactions/list

Lista as interações do usuário.

CRUD: Read

O que faz:

Retorna todos os likes e dislikes feitos pelo usuário autenticado.
Páginas da aplicação
GET /app/dashboard

Abre o Dashboard.

CRUD: Não se aplica.

GET /app/chat

Abre a tela de Chat.

CRUD: Não se aplica.

GET /app/matches

Abre a tela de Matches.

CRUD: Não se aplica.

GET /app/profile

Abre a tela de Perfil.

CRUD: Não se aplica.

Páginas públicas
GET /public/login

Tela de Login.

CRUD: Não se aplica.

GET /public/signup

Tela de Cadastro.

CRUD: Não se aplica.

Códigos HTTP utilizados
Código	Significado
200	Requisição realizada com sucesso.
201	Registro criado com sucesso.
400	Dados inválidos ou obrigatórios não enviados.
401	Usuário não autenticado ou sem permissão.
404	Registro ou rota não encontrada.
500	Erro interno do servidor.
Operações CRUD utilizadas
Operação	Método HTTP
Create	POST
Read	GET
Update	PUT
Delete	DELETE

# 🚀 Web Service - ACME

API desenvolvida para gerenciamento da plataforma ACME.

## 🌐 URL Base

```http
http://localhost/acme-3am/api
```

Todos os dados são enviados e recebidos em **JSON**.

---

# 📚 Rotas da API

## 👤 Usuários

| Método | Rota | CRUD | Descrição |
|---------|------|------|-----------|
| POST | `/users/register` | Create | Cadastra um usuário comum. |
| POST | `/users/login` | Login | Realiza a autenticação do usuário. |
| PUT | `/users/update` | Update | Atualiza os dados do usuário logado. |
| POST | `/users/register-admin` | Create | Cadastra um administrador. |
| POST | `/users/login-admin` | Login | Realiza o login do administrador. |
| PUT | `/users/update-admin` | Update | Atualiza os dados do administrador. |

---

## 👨‍💼 Candidatos

| Método | Rota | CRUD | Descrição |
|---------|------|------|-----------|
| POST | `/candidates/register` | Create | Cria o perfil de um candidato. |
| PUT | `/candidates/update` | Update | Atualiza os dados do candidato. |
| DELETE | `/candidates/delete` | Delete | Desativa o perfil do candidato. |

---

## 🏢 Empresas

| Método | Rota | CRUD | Descrição |
|---------|------|------|-----------|
| POST | `/companies/register` | Create | Cria o perfil da empresa. |
| PUT | `/companies/update` | Update | Atualiza os dados da empresa. |
| DELETE | `/companies/delete` | Delete | Desativa o perfil da empresa. |

---

## ❤️ Interações

| Método | Rota | CRUD | Descrição |
|---------|------|------|-----------|
| POST | `/interactions/register` | Create | Registra um like ou dislike entre usuários. |
| GET | `/interactions/list` | Read | Lista todas as interações do usuário autenticado. |

---

## 📦 Produtos

| Método | Rota | CRUD | Descrição |
|---------|------|------|-----------|
| GET | `/products/list` | Read | Lista todos os produtos. |
| GET | `/products/list/{productId}` | Read | Busca um produto pelo ID. |
| POST | `/products` | Create | Cadastra um novo produto. |
| PUT | `/products/{productId}` | Update | Atualiza um produto. |
| DELETE | `/products/{productId}` | Delete | Remove um produto. |

---

## 🏷️ Categorias de Produtos

| Método | Rota | CRUD | Descrição |
|---------|------|------|-----------|
| GET | `/categories-products/list` | Read | Lista todas as categorias. |
| GET | `/categories-products/list/{categoryId}` | Read | Busca uma categoria pelo ID. |
| POST | `/categories-products` | Create | Cria uma categoria de produto. |

---

## ❓ Categorias de FAQ

| Método | Rota | CRUD | Descrição |
|---------|------|------|-----------|
| GET | `/faqs-categories/list` | Read | Lista todas as categorias de FAQ. |
| GET | `/faqs-categories/list/{categoryId}` | Read | Busca uma categoria pelo ID. |
| POST | `/faqs-categories` | Create | Cria uma categoria de FAQ. |
| PUT | `/faqs-categories/{categoryId}` | Update | Atualiza uma categoria de FAQ. |


---

## 💬 FAQ

| Método | Rota | CRUD | Descrição |
|---------|------|------|-----------|
| GET | `/faqs/list` | Read | Lista todas as perguntas. |
| GET | `/faqs/list/{faqId}` | Read | Busca uma pergunta pelo ID. |
| POST | `/faqs` | Create | Cadastra uma nova FAQ. |
| PUT | `/faqs/{faqId}` | Update | Atualiza uma FAQ existente. |

---

## 🖥️ Páginas da Aplicação

| Método | Rota | Função |
|---------|------|---------|
| GET | `/app/dashboard` | Abre o Dashboard. |
| GET | `/app/chat` | Abre o Chat. |
| GET | `/app/matches` | Abre a tela de Matches. |
| GET | `/app/profile` | Abre o Perfil. |

---

## 🌍 Páginas Públicas

| Método | Rota | Função |
|---------|------|---------|
| GET | `/public/login` | Tela de Login. |
| GET | `/public/signup` | Tela de Cadastro. |

---

# 📌 Métodos HTTP

| Método | Utilização |
|---------|------------|
| GET | Consultar informações. |
| POST | Criar novos registros ou realizar login. |
| PUT | Atualizar registros existentes. |
| DELETE | Excluir ou desativar registros. |

---

# 📖 Operações CRUD

| Operação | Método HTTP |
|-----------|-------------|
| Create | POST |
| Read | GET |
| Update | PUT |
| Delete | DELETE |

---

# ✅ Códigos HTTP

| Código | Significado |
|---------|-------------|
| **200** | Requisição realizada com sucesso. |
| **201** | Registro criado com sucesso. |
| **400** | Dados inválidos ou obrigatórios não enviados. |
| **401** | Usuário não autenticado ou sem permissão. |
| **404** | Registro ou rota não encontrada. |
| **500** | Erro interno do servidor. |