/**
 * Garante que uma página restaurada pelo histórico do navegador volte a buscar
 * os dados atualizados. Todas as páginas HTML reais do MatchWork carregam
 * este arquivo compartilhado.
 */
(() => {
    let recarregando = false;

    window.addEventListener("pageshow", (event) => {
        const navigation = performance.getEntriesByType("navigation")[0];
        const voltouPeloHistorico = navigation?.type === "back_forward";

        if ((!event.persisted && !voltouPeloHistorico) || recarregando) {
            return;
        }

        recarregando = true;
        window.location.reload();
    });
})();
