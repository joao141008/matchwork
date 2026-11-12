<?php

namespace Source\Controller;

use Source\Models\Area;

class Areas extends Api
{
    public function areasList(array $data): void
    {
        $area = new Area();
        $response = $area->selectAll([], "name", "ASC");

        $this->call(
            200,
            "success",
            "Lista de áreas profissionais.",
            "success"
        )->back($response);
    }

    public function areasListById(array $data): void
    {
        $areaId = filter_var($data["areaId"] ?? null, FILTER_VALIDATE_INT);

        if ($areaId === false || $areaId < 1) {
            $this->call(
                400,
                "bad_request",
                "ID da área é obrigatório e deve ser um número inteiro válido.",
                "error"
            )->back(null);
            return;
        }

        $area = new Area();

        if (!$area->selectById((int)$areaId)) {
            $this->call(
                404,
                "not_found",
                "Área não encontrada.",
                "error"
            )->back(null);
            return;
        }

        $this->call(
            200,
            "success",
            "Área encontrada.",
            "success"
        )->back($area);
    }
}