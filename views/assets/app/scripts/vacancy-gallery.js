import VacancyService from "../../_common/services/VacancyService.js";
import { pegarToken, pegarTipo, TIPO } from "../../_common/scripts/sessao.js";

const grid = document.querySelector("#candidateVacancyGrid");
const token = pegarToken();

if (grid && token && pegarTipo() === TIPO.CANDIDATO) {
    const service = new VacancyService();
    service.setAuthToken(token);

    let vacancies = [];
    const observer = new MutationObserver(enhanceCards);
    observer.observe(grid, { childList: true, subtree: true });

    const imageModal = createImageModal();
    carregarVagasParaGaleria();

    async function carregarVagasParaGaleria() {
        try {
            const response = await service.list();
            if (response?.type === "error") return;
            vacancies = response?.data || [];
            enhanceCards();
        } catch (error) {
            console.error("Não foi possível carregar as imagens das vagas:", error);
        }
    }

    function enhanceCards() {
        if (!vacancies.length) return;

        grid.querySelectorAll(".vacancy-card").forEach((card) => {
            if (card.querySelector(".vacancy-gallery")) return;

            const vacancyId = Number(card.dataset.vacancyId || 0);
            const title = card.querySelector(".vacancy-card-header h3")?.textContent.trim();
            const company = card.querySelector(".vacancy-company")?.textContent.trim();
            const vacancy = vacancies.find((item) => Number(item.id) === vacancyId)
                || vacancies.find((item) =>
                    String(item.title || "").trim() === title &&
                    String(item.company_name || item.companyName || "").trim() === company
                )
                || vacancies.find((item) => String(item.title || "").trim() === title);

            const images = Array.isArray(vacancy?.images) ? vacancy.images : [];
            if (images.length) card.insertBefore(createGallery(images, title), card.firstChild);
        });
    }

    function createGallery(images, title) {
        const gallery = document.createElement("section");
        gallery.className = "vacancy-gallery";
        gallery.setAttribute("aria-label", `Imagens da vaga ${title || ""}`);

        const image = document.createElement("img");
        image.className = "vacancy-gallery-image";
        image.alt = `Imagem da vaga ${title || ""}. Clique para ampliar.`;
        image.src = getImageSource(images[0]);
        image.title = "Clique para ampliar";

        let index = 0;
        let pointerStartX = 0;
        let suppressClick = false;

        const counter = document.createElement("span");
        counter.className = "vacancy-gallery-counter";

        const update = (direction = 1) => {
            index = (index + direction + images.length) % images.length;
            image.classList.remove("gallery-slide-in");
            void image.offsetWidth;
            image.src = getImageSource(images[index]);
            image.classList.add("gallery-slide-in");
            counter.textContent = `${index + 1} / ${images.length}`;
            image.alt = `Imagem ${index + 1} da vaga ${title || ""}. Clique para ampliar.`;
        };

        const previous = document.createElement("button");
        previous.type = "button";
        previous.className = "vacancy-gallery-arrow previous";
        previous.setAttribute("aria-label", "Imagem anterior");
        previous.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
        previous.addEventListener("click", (event) => {
            event.stopPropagation();
            update(-1);
        });

        const next = document.createElement("button");
        next.type = "button";
        next.className = "vacancy-gallery-arrow next";
        next.setAttribute("aria-label", "Próxima imagem");
        next.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
        next.addEventListener("click", (event) => {
            event.stopPropagation();
            update(1);
        });

        const zoom = document.createElement("button");
        zoom.type = "button";
        zoom.className = "vacancy-gallery-zoom";
        zoom.setAttribute("aria-label", "Ampliar imagem");
        zoom.innerHTML = '<i class="fa-solid fa-expand"></i><span>Ampliar</span>';
        zoom.addEventListener("click", (event) => {
            event.stopPropagation();
            openImageModal(images, index, title);
        });

        image.addEventListener("click", () => {
            if (suppressClick) {
                suppressClick = false;
                return;
            }
            openImageModal(images, index, title);
        });

        if (images.length > 1) gallery.append(previous, next);
        counter.textContent = `1 / ${images.length}`;
        gallery.append(image, zoom, counter);

        gallery.addEventListener("pointerdown", (event) => {
            pointerStartX = event.clientX;
        });
        gallery.addEventListener("pointerup", (event) => {
            const difference = event.clientX - pointerStartX;
            if (Math.abs(difference) > 45 && images.length > 1) {
                suppressClick = true;
                update(difference < 0 ? 1 : -1);
                window.setTimeout(() => { suppressClick = false; }, 350);
            }
        });

        image.addEventListener("error", () => {
            image.alt = "Não foi possível carregar esta imagem.";
            image.classList.add("image-load-error");
        }, { once: true });

        return gallery;
    }

    function getImageSource(image) {
        return image?.image_url || image?.image_path || "";
    }

    function createImageModal() {
        const dialog = document.createElement("dialog");
        dialog.className = "vacancy-image-modal";
        dialog.setAttribute("aria-label", "Imagem ampliada da oportunidade");

        const close = document.createElement("button");
        close.type = "button";
        close.className = "vacancy-image-modal-close";
        close.setAttribute("aria-label", "Fechar imagem ampliada");
        close.innerHTML = '<i class="fa-solid fa-xmark"></i>';

        const image = document.createElement("img");
        image.className = "vacancy-image-modal-content";
        image.alt = "Imagem ampliada da vaga";

        const caption = document.createElement("p");
        caption.className = "vacancy-image-modal-caption";

        const previous = document.createElement("button");
        previous.type = "button";
        previous.className = "vacancy-image-modal-arrow previous";
        previous.setAttribute("aria-label", "Imagem anterior");
        previous.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';

        const next = document.createElement("button");
        next.type = "button";
        next.className = "vacancy-image-modal-arrow next";
        next.setAttribute("aria-label", "Próxima imagem");
        next.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';

        dialog.append(close, previous, image, next, caption);
        document.body.appendChild(dialog);

        close.addEventListener("click", () => dialog.close());
        previous.addEventListener("click", () => navigateModal(-1));
        next.addEventListener("click", () => navigateModal(1));
        dialog.addEventListener("click", (event) => {
            if (event.target === dialog) dialog.close();
        });
        document.addEventListener("keydown", (event) => {
            if (!dialog.open) return;
            if (event.key === "ArrowLeft") navigateModal(-1);
            if (event.key === "ArrowRight") navigateModal(1);
        });

        return { dialog, image, caption, previous, next };
    }

    let modalImages = [];
    let modalIndex = 0;
    let modalTitle = "";

    function openImageModal(images, index, title) {
        modalImages = images;
        modalIndex = index;
        modalTitle = title || "Oportunidade";
        updateImageModal();
        if (!imageModal.dialog.open) imageModal.dialog.showModal();
    }

    function navigateModal(direction) {
        if (modalImages.length < 2) return;
        modalIndex = (modalIndex + direction + modalImages.length) % modalImages.length;
        updateImageModal();
    }

    function updateImageModal() {
        const current = modalImages[modalIndex];
        imageModal.image.src = getImageSource(current);
        imageModal.image.alt = `Imagem ${modalIndex + 1} da vaga ${modalTitle}`;
        imageModal.caption.textContent = `${modalTitle} · ${modalIndex + 1} de ${modalImages.length}`;
        const multiple = modalImages.length > 1;
        imageModal.previous.hidden = !multiple;
        imageModal.next.hidden = !multiple;
    }
}
