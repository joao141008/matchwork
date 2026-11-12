export default class question {
    #id;
    #user_id;
    #subject;
    #question;
    #answer;
    #status;
    #created_at;
    #answered_at;

    constructor({ id = null, user_id = null, subject = "", question = "", answer = "", status = "", created_at = "", answered_at = ""}) {
        this.id = id;
        this.user_id = user_id;
        this.subject = subject;
        this.question = question;
        this.answer = answer;
        this.status = status;
        this.created_at = created_at;
        this.answered_at = answered_at;
    }

    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value === null ? null : Number(value);
    }

    get user_id() {
        return this.#user_id;
    }

    set user_id(value) {
        this.#user_id = value === null ? null : Number(value);
    }

    get subject() {
        return this.#subject
    }

    set subject(value) {
        if(typeof value !== "string" || value.trim() === ""){
            throw new TypeError("Deve haver algum assunto para a questão.")
        }
    }

    get question() {
        return this.#question
    }

    set question(value) {
        if(typeof value !== "string" || value.trim() === ""){
            throw new TypeError("Pergunta não pode ser vazia.")
        }
    }

    get answer() {
        return this.#answer
    }

    set answer(value) {
        if(typeof value !== "string" || value.trim() === ""){
            throw new TypeError("Deve existir alguma resposta para a pergunta.")
        }
    }

    get created_at() {
        return this.#created_at;
    }

    set created_at(value) {
        this.#created_at = value;
    }

     get answered_at() {
        return this.#answered_at;
    }

    set answered_at(value) {
        this.#answered_at = value;
    }

    toJSON() {
        return {
            id: this.id,
            user_id: this.user_id, 
            subject: this.subject, 
            question: this.question, 
            answer: this.answer, 
            created_at: this.created_at, 
            answered_at: this.answered_at
            }
    }
}

