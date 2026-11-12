
# API REST - Documentação

## Sobre essa API

A pasta `api/` contém o backend em PHP. O arquivo `api/index.php` recebe as requisições e encaminha cada rota para os Controllers em `api/source/Controller`.

As respostas da API são retornadas em JSON.

## URL base

No ambiente local, utilize:

`http://localhost/joaoworkcopia/api`

Acrescente o caminho da rota desejada.

---

## Como usar os tokens

As rotas protegidas exigem um token de autenticação.

Envie o token de uma das seguintes formas:

- `Authorization: Bearer {token}`
- `token: {token}`

Se o token estiver ausente, inválido ou sem permissão para a operação, a API responderá com `401 Unauthorized` ou `403 Forbidden`.

---

## Formato de resposta

A API utiliza um formato padrão semelhante a este:

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Operação realizada.",
  "data": {}
}
```

O campo `data` depende da operação. As respostas sempre informam o código, o status e a mensagem.

---

## Rotas principais

### `/hello`

- Método: `GET`
- Rota de teste para verificar se a API está respondendo.

---

### Usuários

#### POST `/users/register`

Cadastra uma conta de usuário.

- Não precisa de token.
- Campos enviados:
  - `email`
  - `password`

Resposta esperada: `201 Created`.

#### POST `/users/login`

Autentica um usuário.

- Não precisa de token.
- Campos enviados:
  - `email`
  - `password`

A resposta inclui o token de autenticação e os dados básicos do usuário.

#### PUT `/users/update`

Atualiza dados da conta do usuário autenticado.

- Precisa de token.
- Pode receber `email` e/ou `password`, conforme as validações do Controller.

#### POST `/users/register-admin`

Cadastra uma conta de administrador.

- Não precisa de token.
- Campos enviados:
  - `email`
  - `password`

#### POST `/users/login-admin`

Autentica um administrador.

- Não precisa de token.
- Campos enviados:
  - `email`
  - `password`

#### PUT `/users/update-admin`

Atualiza os dados da conta de administrador autenticada.

- Precisa de token de administrador.
- Pode receber `email` e/ou `password`.

---

### Produtos

#### GET `/products/list`

Retorna os produtos cadastrados.

#### GET `/products/list/{productId}`

Retorna um produto pelo ID.

#### POST `/products`

Cria um produto. Envie `category_id`, `name` e `price`.

#### PUT `/products/{productId}`

Atualiza `category_id`, `name` e/ou `price` de um produto.

#### DELETE `/products/{productId}`

Remove um produto.

---

### Categorias de produto

#### GET `/categories-products/list`

Lista as categorias de produtos.

#### GET `/categories-products/list/{categoryId}`

Busca uma categoria pelo ID.

#### POST `/categories-products`

Cria uma categoria. Envie `name`.

---

### FAQs

#### GET `/faqs/list`

Lista as FAQs.

#### GET `/faqs/list/{faqId}`

Busca uma FAQ pelo ID.

#### POST `/faqs`

Cria uma FAQ. Envie `faqs_category_id`, `question` e `answer`.

#### PUT `/faqs/{faqId}`

Atualiza os campos `faqs_category_id`, `question` e/ou `answer`.

---

### Categorias de FAQ

#### GET `/faqs-categories/list`

Lista as categorias de FAQ.

#### GET `/faqs-categories/list/{categoryId}`

Busca uma categoria de FAQ pelo ID.

#### POST `/faqs-categories`

Cria uma categoria. Envie `name`.

---

### Candidatos

#### POST `/candidates/register`

Registra o perfil do candidato associado ao usuário autenticado.

- Precisa de token.
- Campos principais:
  - `full_name`
  - `cpf`
  - `interest_area`
- Campos opcionais:
  - `location`
  - `salary_expectation`
  - `work_schedule`
  - `shift`
  - `work_model`
  - `employment_type`
  - `about`
  - `areas`, quando enviado pelo formulário de áreas múltiplas.

A conta de usuário, com e-mail e senha, é criada na etapa de cadastro da conta. Esses dados não são cadastrados novamente nesta rota.

#### PUT `/candidates/update`

Atualiza os dados do candidato autenticado.

- Precisa de token.
- Envie somente os campos que deseja modificar.

#### DELETE `/candidates/delete`

Desativa a conta do candidato autenticado.

- Precisa de token.

---

### Empresas

#### POST `/companies/register`

Cria o perfil da empresa associado ao usuário autenticado.

- Precisa de token de usuário ainda não convertido em perfil de empresa.
- O cadastro da conta (e-mail e senha) acontece anteriormente em `/users/register`.
- Esta rota recebe os dados do perfil, não as credenciais da conta.

Campos obrigatórios:

- `company_name`: nome da empresa, até 255 caracteres.
- `cnpj`: CNPJ, até 18 caracteres.
- `industry`: resumo textual das áreas de atuação, até 255 caracteres.
- `areas`: lista não vazia de áreas cadastradas.

Campos opcionais:

- `location`: localização da empresa.
- `website`: endereço completo do site, iniciado por `http://` ou `https://`, até 255 caracteres.
- `company_size`: porte da empresa. Valores aceitos:
  - `Microempresa`
  - `Pequena empresa`
  - `Média empresa`
  - `Grande empresa`
- `description`: descrição da empresa.

As áreas são enviadas como uma lista de objetos. Quando a requisição utiliza `FormData`, os campos seguem o formato:

```text
areas[0][area_id] = 1
areas[0][custom_area] =
areas[1][area_id] = 14
areas[1][custom_area] = Área personalizada
```

Cada `area_id` precisa existir na tabela `areas`. Ao selecionar a área `Outras`, `custom_area` é obrigatório.

Os relacionamentos são armazenados em `company_areas`.

Após o cadastro, o tipo do usuário é atualizado para empresa.

Resposta esperada: `201 Created`, com os dados do perfil e as áreas associadas.

#### PUT `/companies/update`

Atualiza o perfil da empresa autenticada.

- Precisa de token de empresa.
- Envie somente os campos que deseja modificar.
- Campos disponíveis:
  - `company_name`
  - `cnpj`
  - `location`
  - `website`
  - `company_size`
  - `industry`
  - `description`
  - `areas`

Para limpar `website` ou `company_size`, envie uma string vazia. O valor será armazenado como `NULL`.

Se enviar `areas`, a lista substituirá as áreas atualmente associadas. Uma lista vazia remove todas as associações.

#### GET `/companies/list`

Lista as empresas.

Exige autenticação e permissão de administrador ou profissional, conforme as regras do Controller.

#### GET `/companies/list/{companyId}`

Retorna uma empresa pelo ID.

Exige autenticação e verifica a permissão de acesso.

#### DELETE `/companies/delete`

Desativa a conta da empresa autenticada.

- Precisa de token de empresa.

---

### Interações

#### POST `/interactions/register`

Registra um like ou dislike.

- Precisa de token.
- Campos enviados:
  - `to_user_id`
  - `action` (`like` ou `dislike`)

#### GET `/interactions/list`

Lista as interações do usuário autenticado.

- Precisa de token.

---

## Rotas que retornam páginas

Estas rotas carregam páginas do aplicativo, não respostas JSON:

- `GET /app/dashboard`
- `GET /app/chat`
- `GET /app/matches`
- `GET /app/profile`
- `GET /public/login`
- `GET /public/signup`

---

## Códigos de status

- `200 OK`: operação concluída.
- `201 Created`: registro criado.
- `400 Bad Request`: campo ausente ou inválido.
- `401 Unauthorized`: token ausente ou inválido.
- `403 Forbidden`: usuário autenticado sem permissão para a operação.
- `404 Not Found`: registro não encontrado.
- `409 Conflict`: conflito com registro existente, como e-mail ou CNPJ duplicado.
- `500 Internal Server Error`: erro interno do servidor.

---

## Observações finais

- As rotas da API ficam em `api/index.php`.
- Os Controllers ficam em `api/source/Controller`.
- Os Models ficam em `api/source/Models`.
- As configurações ficam em `api/source/Config`.
- As credenciais de banco e demais configurações ficam nas configurações do ambiente.
- Não envie e-mail e senha novamente ao endpoint de cadastro de empresa: a conta já foi criada na etapa anterior.
