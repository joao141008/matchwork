
import HttpClientBase from "../classes/HttpClientBase.js";

export default class Users extends HttpClientBase {

    async login(email, password) {
        return this.postForm("/users/login", { email, password });
    }

    async loginFromForm(form) {
        return this.postForm("/users/login", form);
    }

    async loginAdmin(email, password) {
        return this.postForm("/users/login-admin", { email, password });
    }

    async loginAdminFromForm(form) {
        return this.postForm("/users/login-admin", form);
    }

    async register(data) {
        return this.postForm("/users/register", data);
    }

    async registerAdmin(data) {
        return this.postForm("/users/register-admin", data);
    }

    async update(data) {
        return this.putForm("/users/update", data);
    }

    async updateAdmin(data) {
        return this.putForm("/users/update-admin", data);
    }

    async delete(userId) {
        return super.delete(`/users/delete/${userId}`);
    }

    async list(data = {}) {
        return this.get("/users/list", data);
    }

    async listById(userId) {
        return this.get(`/users/list/${userId}`);
    }
}
