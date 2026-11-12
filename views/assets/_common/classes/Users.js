import HttpClientBase from "./HttpClientBase.js";

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

    async update(data) {
        return this.put("/users/update", data);
    }

    async updateAdmin(data) {
        return this.put("/users/update-admin", data);
    }
}



// import HttpClientBase from "./HttpClientBase.js";

// export default class Users extends HttpClientBase {
//     async login(email, password) {
//         return this.postForm("/users/login", { email, password });
//     }

//     async loginFromForm(form) {
//         return this.postForm("/users/login", form);
//     }

//     async loginAdmin(email, password) {
//         return this.postForm("/users/login-admin", { email, password });
//     }

//     async loginAdminFromForm(form) {
//         return this.postForm("/users/login-admin", form);
//     }
    
//     async register(data) {
//         return this.postForm("/users/register", data);
//     }

//     async update(data) {
//         return this.put("/users/update", data);
//     }

//     async updateAdmin(data) {
//         return this.put("/users/update-admin", data);
//     }
// }