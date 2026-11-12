<?php

namespace Source\Controller\Faqs;

use Source\Controller\Api;
use Source\Models\Faqs\Faq;
use Source\Models\Faqs\FaqCategory;

class Faqs extends Api
{
    public function faqList(array $data = []): void
    {
        $faq = new Faq();
        $this->call(200, 'success', 'Lista de FAQs.', 'success')->back($faq->selectAll());
    }

    public function faqsListById(array $data): void
    {
        $faqId = filter_var($data['faqId'] ?? null, FILTER_VALIDATE_INT);
        if ($faqId === false || $faqId < 1) {
            $this->call(400, 'bad_request', 'ID da FAQ inválido.', 'error')->back();
            return;
        }

        $faq = new Faq();
        if (!$faq->selectById((int)$faqId)) {
            $this->call(404, 'not_found', 'FAQ não encontrada.', 'error')->back();
            return;
        }

        $this->call(200, 'success', 'FAQ encontrada.', 'success')->back($faq);
    }

    public function insert(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, 'unauthorized', 'Somente administradores podem cadastrar FAQs.', 'error')->back();
            return;
        }

        $categoryId = filter_var($data['faqs_category_id'] ?? null, FILTER_VALIDATE_INT);
        $question = trim((string)($data['question'] ?? ''));
        $answer = trim((string)($data['answer'] ?? ''));
        if ($categoryId === false || $categoryId < 1 || $question === '' || $answer === '') {
            $this->call(400, 'bad_request', 'Categoria, pergunta e resposta são obrigatórias.', 'error')->back();
            return;
        }

        $category = new FaqCategory();
        if (!$category->selectById((int)$categoryId)) {
            $this->call(404, 'not_found', 'Categoria de FAQ não encontrada.', 'error')->back();
            return;
        }

        $faq = new Faq(null, (int)$categoryId, $question, $answer);
        if (!$faq->insert()) {
            $this->call(500, 'internal_server_error', 'Não foi possível cadastrar a FAQ.', 'error')->back();
            return;
        }

        $this->call(201, 'success', 'FAQ cadastrada com sucesso.', 'created')->back($faq);
    }

    public function update(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, 'unauthorized', 'Somente administradores podem atualizar FAQs.', 'error')->back();
            return;
        }

        $faqId = filter_var($data['faqId'] ?? null, FILTER_VALIDATE_INT);
        $categoryId = filter_var($data['faqs_category_id'] ?? null, FILTER_VALIDATE_INT);
        $question = trim((string)($data['question'] ?? ''));
        $answer = trim((string)($data['answer'] ?? ''));
        if ($faqId === false || $faqId < 1 || $categoryId === false || $categoryId < 1 || $question === '' || $answer === '') {
            $this->call(400, 'bad_request', 'ID, categoria, pergunta e resposta válidos são obrigatórios.', 'error')->back();
            return;
        }

        $faq = new Faq();
        if (!$faq->selectById((int)$faqId)) {
            $this->call(404, 'not_found', 'FAQ não encontrada.', 'error')->back();
            return;
        }

        $category = new FaqCategory();
        if (!$category->selectById((int)$categoryId)) {
            $this->call(404, 'not_found', 'Categoria de FAQ não encontrada.', 'error')->back();
            return;
        }

        $faq->setFaqsCategoryId((int)$categoryId);
        $faq->setQuestion($question);
        $faq->setAnswer($answer);
        if (!$faq->updateById((int)$faqId)) {
            $this->call(500, 'internal_server_error', 'Não foi possível atualizar a FAQ.', 'error')->back();
            return;
        }

        $this->call(200, 'success', 'FAQ atualizada com sucesso.', 'success')->back($faq);
    }

    public function delete(array $data): void
    {
        if (!$this->authToken(1)) {
            $this->call(401, 'unauthorized', 'Somente administradores podem excluir FAQs.', 'error')->back();
            return;
        }

        $faqId = filter_var($data['faqsId'] ?? null, FILTER_VALIDATE_INT);
        if ($faqId === false || $faqId < 1) {
            $this->call(400, 'bad_request', 'ID da FAQ inválido.', 'error')->back();
            return;
        }

        $faq = new Faq();
        if (!$faq->deleteById((int)$faqId)) {
            $this->call(404, 'not_found', 'FAQ não encontrada.', 'error')->back();
            return;
        }

        $this->call(200, 'success', 'FAQ removida com sucesso.', 'success')->back();
    }
}
