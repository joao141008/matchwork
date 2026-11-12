
export default class HttpClientBase {
    #baseUrl;
    #defaultHeaders;

    constructor(
        baseUrl = new URL("../../../../api", import.meta.url).href.replace(/\/$/, "")
    ) {
        this.#baseUrl = baseUrl;
        this.#defaultHeaders = {
            "Content-Type": "application/json"
        };
    }

    setAuthToken(token) {
        this.#defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    clearAuthToken() {
        delete this.#defaultHeaders["Authorization"];
    }

    toFormData(data = {}) {
        if (data instanceof FormData) {
            return data;
        }

        if (typeof HTMLFormElement !== "undefined" && data instanceof HTMLFormElement) {
            return new FormData(data);
        }

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });
        return formData;
    }

    // let nome
    //Quando tu usa a rota get,
    // params = new URLSearchParams("?nome=${nome}&idade=${idade}");
    // params.get= vai aparecer "joão Pedro";
    // console.log(params.get("nome"));
    toUrlSearchParams(data = {}) {
        if (data instanceof URLSearchParams) {
            return data;
        }

        if (typeof HTMLFormElement !== "undefined" && data instanceof HTMLFormElement) {
            return new URLSearchParams(new FormData(data));
        }

        if (data instanceof FormData) {
            return new URLSearchParams(data);
        }

        return new URLSearchParams(Object.entries(data));
    }

    #buildUrl(endpoint, params = {}) {
        let url = `${this.#baseUrl}${endpoint}`;

        const queryParams = new URLSearchParams();

        for (const [key, value] of Object.entries(params)) {
            if (url.includes(`/:${key}`)) {
                url = url.replace(`:${key}`, value);
            } else {
                queryParams.append(key, value);
            }
        }

        const queryString = queryParams.toString();

        if (queryString) {
            url += `?${queryString}`;
        }

        return url;
    }

    async #fetchWithConfig(endpoint, config, params = {}) {
        const { _isFormData, ...fetchConfig } = config;

        try {
            const url = this.#buildUrl(endpoint, params);

            const headers = {
                ...this.#defaultHeaders,
                ...fetchConfig.headers
            };

            if (_isFormData) {
                delete headers["Content-Type"];
            }

            const response = await fetch(url, {
                ...fetchConfig,
                headers
            });

            const contentType = response.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
                return await response.json();
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.text();

        } catch (error) {
            throw new Error(`Request failed: ${error.message}`);
        }
    }

    async get(endpoint, params = {}, headers = {}) {
        return this.#fetchWithConfig(endpoint, {
            method: "GET",
            headers
        }, params);
    }

    async post(endpoint, data = {}, params = {}) {
        const body = this.toFormData(data);

        return this.#fetchWithConfig(endpoint, {
            method: "POST",
            body,
            _isFormData: true
        }, params);
    }

    async postForm(endpoint, data = {}, params = {}) {
        return this.post(endpoint, this.toFormData(data), params);
    }

    async put(endpoint, data = {}, params = {}) {
        const body = this.toUrlSearchParams(data);

        return this.#fetchWithConfig(endpoint, {
            method: "PUT",
            body: body.toString(),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }, params);
    }

    async putForm(endpoint, data = {}, params = {}) {
        const body = this.toUrlSearchParams(data);

        return this.#fetchWithConfig(endpoint, {
            method: "PUT",
            body: body.toString(),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }, params);
    }

    async delete(endpoint, params = {}) {
        return this.#fetchWithConfig(endpoint, {
            method: "DELETE"
        }, params);
    }
}
