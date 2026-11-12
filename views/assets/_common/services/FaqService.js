import HttpClientBase from "../classes/HttpClientBase.js";

export default class FaqService extends HttpClientBase {

    async list() {
        return this.get("/faqs/list");
    }

    async listById(faqId) {
        return this.get(`/faqs/list/${faqId}`);
    }

    // data = { faqs_category_id, question, answer }
    async register(data) {
        return this.postForm("/faqs", data);
    }

    // O router da API lê o corpo do PUT como urlencoded, por isso putForm
    async update(faqId, data) {
        return this.putForm(`/faqs/${faqId}`, data);
    }

    async delete(faqId) {
        return super.delete(`/faqs/${faqId}`);
    }

    async listCategories() {
        return this.get("/faqs-categories/list");
    }
}