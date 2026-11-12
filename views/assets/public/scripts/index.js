// BOTÕES DO HEADER

const btnLogin = document.querySelector(".login");
const btnCadastro = document.querySelector(".cadastro");

// ABRIR PÁGINA DE LOGIN
btnLogin?.addEventListener("click", () => {
    window.location.href = "./login";
});

// ABRIR PÁGINA DE CADASTRO
btnCadastro?.addEventListener("click", () => {
    window.location.href = "./cadastro";
});


// ==========================
// BOTÃO "COMEÇAR AGORA"
// ==========================

const btnComecar = document.querySelector(".hero-btn.primary");

btnComecar?.addEventListener("click", () => {
    window.location.href = "./cadastro";
});


// ==========================
// SCROLL PARA "SAIBA MAIS"
// ==========================

const btnSaibaMais = document.querySelector(".hero-btn.secondary");
const mouse = document.querySelector(".mouse");

function scrollToAbout() {
    const aboutSection = document.querySelector(".about");

    if (aboutSection) {
        aboutSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

// clique no botão "Saiba mais"
btnSaibaMais?.addEventListener("click", scrollToAbout);

// clique no mouse
mouse?.addEventListener("click", scrollToAbout);


// ==========================
// EFEITO NO HEADER AO ROLAR
// ==========================

const header = document.querySelector(".header");

window.addEventListener("scroll", () => {

    if (!header) return;

    if (window.scrollY > 50) {

        header.style.background = "rgba(0, 0, 0, 0.9)";
        header.style.backdropFilter = "blur(10px)";

    } else {

        header.style.background = "transparent";
        header.style.backdropFilter = "none";

    }

});

function btnSumir(){
  
  document.querySelectorAll(".faq-item").forEach(item => {
  const btn = item.querySelector(".faq-question");
  const answer = item.querySelector(".faq-answer");

  btn.addEventListener("click", () => {

    const isOpen = item.classList.contains("active");

    if (isOpen) {
      // FECHAR
      answer.style.height = answer.scrollHeight + "px";

      requestAnimationFrame(() => {
        answer.style.height = "0px";
        answer.style.opacity = "0";
      });

      item.classList.remove("active");

    } else {
      // ABRIR
      item.classList.add("active");

      answer.style.height = answer.scrollHeight + "px";
      answer.style.opacity = "1";
    }

  });
});
  
}


