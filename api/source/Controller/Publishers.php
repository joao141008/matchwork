<?php

namespace Source\Controllers;

use Source\Models\Question;

class Question
{
    /*
    |--------------------------------------------------------------------------
    | USUÁRIO - CRIAR PERGUNTA
    |--------------------------------------------------------------------------
    */

    public function create($data): void
    {
        // Aqui você deve pegar o ID do usuário
        // através da sessão/autenticação do seu sistema.

        $userId = $_SESSION["user_id"] ?? null;

        if (!$userId) {
            echo json_encode([
                "error" => "Usuário não autenticado."
            ]);
            return;
        }

        $question = new \Source\Models\Question(
            null,
            $userId,
            $data["subject"] ?? null,
            $data["question"] ?? null,
            null,
            "pending"
        );

        if ($question->insert()) {
            echo json_encode([
                "success" => true,
                "message" => "Pergunta enviada com sucesso."
            ]);
            return;
        }

        echo json_encode([
            "success" => false,
            "error" => $question->getErrorMessage()
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | USUÁRIO - LISTAR SUAS PERGUNTAS
    |--------------------------------------------------------------------------
    */

    public function listByUser(): void
    {
        $userId = $_SESSION["user_id"] ?? null;

        if (!$userId) {
            echo json_encode([
                "error" => "Usuário não autenticado."
            ]);
            return;
        }

        $question = new \Source\Models\Question();

        $questions = $question->selectByUserId($userId);

        echo json_encode([
            "success" => true,
            "data" => $questions
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | ADMIN - LISTAR TODAS AS PERGUNTAS
    |--------------------------------------------------------------------------
    */

    public function listAll(): void
    {
        // Aqui deve entrar sua verificação de administrador.
        // Exemplo:
        //
        // if ($_SESSION["role"] !== "admin") {
        //     ...
        // }

        $question = new \Source\Models\Question();

        $questions = $question->selectAllWithUser();

        echo json_encode([
            "success" => true,
            "data" => $questions
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | ADMIN - EXCLUIR PERGUNTA
    |--------------------------------------------------------------------------
    */

    public function delete(array $data): void
    {
        // Verificar se é administrador

        $id = (int)($data["id"] ?? 0);

        if ($id <= 0) {
            echo json_encode([
                "success" => false,
                "error" => "ID inválido."
            ]);
            return;
        }

        $question = new \Source\Models\Question();

        if ($question->deleteById($id)) {
            echo json_encode([
                "success" => true,
                "message" => "Pergunta excluída com sucesso."
            ]);
            return;
        }

        echo json_encode([
            "success" => false,
            "error" => $question->getErrorMessage()
        ]);
    }
}