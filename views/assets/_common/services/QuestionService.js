
import HttpClientBase from "../classes/HttpClientBase.js";

export default class Question extends HttpClientBase {

    async register(data) {
        return this.post("/questions/register", data);
    }

    async list() {
        return this.get("/questions/list");
    }

    async listAll() {
        return this.get("/questions/listall");
    }

    async delete(data) {
        return super.delete("/questions/delete", data);
    }
}
