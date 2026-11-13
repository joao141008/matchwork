import HttpClientBase from "../classes/HttpClientBase.js";

export default class AdminDashboardService extends HttpClientBase {
    async stats() {
        return this.get("/admin/dashboard/stats");
    }
}
