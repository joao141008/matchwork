<?php

namespace source\Controller;

use Source\Controller\Api;
use Source\Models\ProductCategory;


class ProductsCategories extends Api
{
    public function productsCategoriesList(array $data): void
    {
        $product_category = new ProductCategory();
        $response = $product_category->listAll();

        $this->call("200","success","Lista de produtos","success"
        )->back($response);
    }

    public function productsCategoriesList_id(array $data): void
    {

        if(!filter_var($data["categoryId"], FILTER_VALIDATE_INT)) {
            $this->call(
                400,
                "bad_request",
                "ID do produto é obrigatório e deve ser um número inteiro",
                "error"
            )
                ->back(null);
            return;
        }

       $product_category = new ProductCategory();
       $product_category = $product_category->listId($data["categoryId"]);

       if(!$product_category) {
        $this->call(404, "error", "not_found", "Categoria não encontrada")->back(null);
        return;
       }

       $this->call(200, "success", "success", "Categoria encontrada")->back($product_category);

    }

    public function insert(array $data): void
    {
        if(!isset($data["name"]) || empty($data["name"])) {
            $this->call(400, "bad_request", "error", "O campo nome é obrigatório")->back(null);
            return;
        }

        $product_category = new ProductCategory(null, $data["name"]);

        $response = $product_category->insert();

        if(!$response) {
            $this->call(500,
                        "error",
                        "internal_server_error",
                        "Não foi possível cadastrar o produto")->back(null);
            return;
        }
        
        $categoria = [
            "id" => $product_category->getId(),
            "name" => $product_category->getName()
        ];

        $this->call(201, "success", "created", "Categoria de Produto criada com sucesso")->back($categoria);

    }

}