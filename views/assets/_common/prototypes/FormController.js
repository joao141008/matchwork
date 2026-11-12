const FormControllerPrototype = {
    serialize(form) {
        return Object.fromEntries(new FormData(form));
    },

    clear(form) {
        form.reset();
    },

    validate(form) {
        return form.checkValidity();
    }
};

const FormController = Object.create(FormControllerPrototype);

export default FormController;
