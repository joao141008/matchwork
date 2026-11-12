

async function fetchFAQs() {

  const response = await fetch("http://localhost/joaowork/api/faqs/list");
  
  const faqs = await response.json();
  console.log(faqs.data);
  
  const listFaqs = document.querySelector(".faq-box");

  faqs.data.forEach(faq => {
    console.log(faq.answer, faq.question);
    // console.log("Eu quero ver João Pedro")

    const faqItem = document.createElement("article");
    faqItem.className = "faq-item";
    faqItem.innerHTML = `

    <button class="faq-question">
    ${faq.question}
    <i class="fa-solid fa-chevron-down icon"></i>
    </button>

    <article class="faq-answer">
    <article class="faq-answer-inner">
    ${faq.answer}
    </article>
    </article>

        `;

      // Pega os elementos criados
      const btn = faqItem.querySelector(".faq-question");
      const answer = faqItem.querySelector(".faq-answer");

      // Clique na pergunta
      btn.addEventListener("click", () => {

        const isOpen = faqItem.classList.contains("active");
        //No FAQ, procure na lista de classes se existe active

        if (isOpen) {

          // FECHAR
          answer.style.height = answer.scrollHeight + "px";

          requestAnimationFrame(() => {
            answer.style.height = "0px";
            answer.style.opacity = "0";
          });

          faqItem.classList.remove("active");

        } else {
            // ABRIR
            faqItem.classList.add("active");

            answer.style.height = answer.scrollHeight + "px";
            answer.style.opacity = "1";
          }
      });
    // Coloca o FAQ dentro da .faq-box
    listFaqs.appendChild(faqItem);
  });

};


fetchFAQs();