
import HttpClientBase from "../classes/HttpClientBase.js";

export default class UserMatch extends HttpClientBase {

    async list() {
        return this.get("/matches/list");
    }

    async view(matchId) {
        return this.get(`/matches/view/${matchId}`);
    }
}
