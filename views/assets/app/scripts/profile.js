
const tabs = document.querySelectorAll(".tab");
const contents = document.querySelectorAll(".tab-content");

const btnBack = document.getElementById("btn-back");
const btnMatches = document.getElementById("btn-matches");
const btnLogout = document.getElementById("btn-logout");

const profileForm = document.querySelector("#edit form");
const supportForm = document.querySelector("#support form");

const photoBtn = document.querySelector(".photo-btn");
const photoInput = document.createElement("input");

photoInput.type = "file";
photoInput.accept = "image/*";

// ======================================================
// RECUPERAR DADOS LOCAIS
// ======================================================

const savedPhoto =
    localStorage.getItem("profile_photo") ||
    localStorage.getItem("photo");

const profilePhoto = document.getElementById("profile-photo");

if (savedPhoto && profilePhoto) {
    profilePhoto.src = savedPhoto;
}

const savedName =
    localStorage.getItem("name") ||
    localStorage.getItem("full_name") ||
    localStorage.getItem("company_name");

const savedEmail = localStorage.getItem("email");

const profileName = document.getElementById("profile-name");
const emailInput = document.querySelector('#edit input[type="email"]');

if (savedName && profileName) {
    profileName.textContent = savedName;
}

if (emailInput && savedEmail) {
    emailInput.value = savedEmail;
}

// ======================================================
// TROCA DE ABAS
// ======================================================

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        const target = tab.dataset.tab;

        tabs.forEach(item => item.classList.remove("active"));
        tab.classList.add("active");

        contents.forEach(content => {
            content.classList.remove("active");

            if (content.id === target) {
                content.classList.add("active");
            }
        });
    });
});

// ======================================================
// BOTÕES DO CABEÇALHO
// ======================================================

btnBack?.addEventListener("click", () => {
    window.history.back();
});

btnMatches?.addEventListener("click", () => {
    window.location.href = "./matches";
});

btnLogout?.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("type_id");
    localStorage.removeItem("email");

    window.location.href = "../public/";
});

// ======================================================
// ALTERAR FOTO DE PERFIL
// ======================================================

photoBtn?.addEventListener("click", () => {
    photoInput.click();
});

photoInput.addEventListener("change", event => {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Selecione um arquivo de imagem válido.");
        return;
    }

    const reader = new FileReader();

    reader.onload = event => {
        const photoData = event.target.result;

        if (profilePhoto) {
            profilePhoto.src = photoData;
        }

        try {
            localStorage.setItem("profile_photo", photoData);
            localStorage.setItem("photo", photoData);

            alert("Foto atualizada neste navegador!");
        } catch (error) {
            console.error("Erro ao salvar a foto:", error);

            alert(
                "Não foi possível guardar a imagem. " +
                "Tente utilizar uma foto menor."
            );
        }
    };

    reader.readAsDataURL(file);
});

// ======================================================
// EDITAR PERFIL — VISUAL LOCAL
// ======================================================

if (profileForm) {
    profileForm.addEventListener("submit", event => {
        event.preventDefault();

        const inputs = profileForm.querySelectorAll(
            "input, textarea, select"
        );

        const [name, email, phone, area, salary, about] = inputs;

        if (name) {
            document.getElementById("profile-name").textContent =
                name.value;

            localStorage.setItem("name", name.value);
        }

        if (email) {
            localStorage.setItem("email", email.value);
        }

        if (area) {
            const profileType = document.getElementById("profile-type");

            if (profileType) {
                profileType.textContent = area.value;
            }
        }

        const infoCards = document.querySelectorAll(".card");

        if (infoCards[0]) {
            infoCards[0].innerHTML = `
                <h2>Pessoais</h2>
                <p><strong>Nome:</strong> ${name?.value ?? ""}</p>
                <p><strong>Email:</strong> ${email?.value ?? ""}</p>
                <p><strong>Telefone:</strong> ${phone?.value ?? ""}</p>
            `;
        }

        if (infoCards[1]) {
            infoCards[1].innerHTML = `
                <h2>Profissional</h2>
                <p><strong>Área:</strong> ${area?.value ?? ""}</p>
                <p><strong>Salário:</strong> ${salary?.value ?? ""}</p>
            `;
        }

        if (infoCards[2]) {
            infoCards[2].innerHTML = `
                <h2>Sobre</h2>
                <p>${about?.value ?? ""}</p>
            `;
        }

        alert(
            "Perfil atualizado visualmente. " +
            "As alterações ainda não foram enviadas ao banco de dados."
        );
    });
}

// ======================================================
// SUPORTE
// ======================================================

if (supportForm) {
    supportForm.addEventListener("submit", event => {
        event.preventDefault();

        const formData = new FormData(supportForm);

        const subject = formData.get("subject");
        const message = formData.get("message");

        alert(
            `Mensagem enviada!\n\n` +
            `Assunto: ${subject}\n` +
            `Mensagem: ${message}`
        );

        supportForm.reset();
    });
}
