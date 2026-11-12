<?php

namespace Source\Controller\Faqs;

use Source\Controller\Api;
use Source\Models\Faqs\FaqCategory;

class FaqsCategories extends Api
{
    public function faqCategoryList(array $data = []): void
    {
        $category = new FaqCategory();
        $this->call(200, 'success', 'Lista de categorias de FAQ.', 'success')->back($category->selectAll());
    }

    public function faqCategoryListId(array $data): void
    {
        $categoryId = filter_var($data['categoryId'] ?? null, FILTER_VALIDATE_INT);
        if ($categoryId === false || $categoryId < 1) {
            $this->call(400, 'bad_request', 'ID da categoria inválido.', 'error')->back();
            return;
        }

        $category = new FaqCategory();
        if (!$category->selectById((int)$categoryId)) {
            $this->call(404, 'not_found', 'Categoria não encontrada.', 'error')->back();
            return;
        }

        $this->call(200, 'success', 'Categoria encontrada.', 'success')->back($category);
    }

    public function insert(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, 'unauthorized', 'Somente administradores podem cadastrar categorias.', 'error')->back();
            return;
        }

        $name = trim((string)($data['name'] ?? ''));
        if ($name === '') {
            $this->call(400, 'bad_request', 'Nome da categoria é obrigatório.', 'error')->back();
            return;
        }

        $category = new FaqCategory(null, $name);
        if (!$category->insert()) {
            $this->call(500, 'internal_server_error', 'Não foi possível cadastrar a categoria.', 'error')->back();
            return;
        }

        $this->call(201, 'success', 'Categoria cadastrada com sucesso.', 'created')->back($category);
    }

    public function update(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, 'unauthorized', 'Somente administradores podem atualizar categorias.', 'error')->back();
            return;
        }

        $categoryId = filter_var($data['categoryId'] ?? null, FILTER_VALIDATE_INT);
        $name = trim((string)($data['name'] ?? ''));
        if ($categoryId === false || $categoryId < 1 || $name === '') {
            $this->call(400, 'bad_request', 'ID e nome da categoria são obrigatórios.', 'error')->back();
            return;
        }

        $category = new FaqCategory();
        if (!$category->selectById((int)$categoryId)) {
            $this->call(404, 'not_found', 'Categoria não encontrada.', 'error')->back();
            return;
        }

        $category->setName($name);
        if (!$category->updateById((int)$categoryId)) {
            $this->call(500, 'internal_server_error', 'Não foi possível atualizar a categoria.', 'error')->back();
            return;
        }

        $this->call(200, 'success', 'Categoria atualizada com sucesso.', 'success')->back($category);
    }

    public function delete(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, 'unauthorized', 'Somente administradores podem excluir categorias.', 'error')->back();
            return;
        }

        $categoryId = filter_var($data['categoryId'] ?? null, FILTER_VALIDATE_INT);
        if ($categoryId === false || $categoryId < 1) {
            $this->call(400, 'bad_request', 'ID da categoria inválido.', 'error')->back();
            return;
        }

        $category = new FaqCategory();
        if (!$category->deleteById((int)$categoryId)) {
            $this->call(404, 'not_found', 'Categoria não encontrada.', 'error')->back();
            return;
        }

        $this->call(200, 'success', 'Categoria removida com sucesso.', 'success')->back();
    }
}
