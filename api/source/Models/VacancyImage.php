<?php

namespace Source\Models;

use PDO;
use Source\Core\Connect;
use Source\Core\Model;

class VacancyImage extends Model
{
    private ?int $id;
    private ?int $vacancy_id;
    private ?string $image_path;
    private ?int $position;
    private ?string $created_at;

    public function __construct(
        ?int $id = null,
        ?int $vacancy_id = null,
        ?string $image_path = null,
        ?int $position = 0,
        ?string $created_at = null
    ) {
        $this->id = $id;
        $this->vacancy_id = $vacancy_id;
        $this->image_path = $image_path;
        $this->position = $position;
        $this->created_at = $created_at;

        $this->table = 'vacancy_images';

        $this->fillable = [
            'vacancyId',
            'imagePath',
            'position'
        ];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): void
    {
        $this->id = $id;
    }

    public function getVacancyId(): ?int
    {
        return $this->vacancy_id;
    }

    public function setVacancyId(?int $vacancy_id): void
    {
        $this->vacancy_id = $vacancy_id;
    }

    public function getImagePath(): ?string
    {
        return $this->image_path;
    }

    public function setImagePath(?string $image_path): void
    {
        $this->image_path = $image_path;
    }

    public function getPosition(): ?int
    {
        return $this->position;
    }

    public function setPosition(?int $position): void
    {
        $this->position = $position;
    }

    public function getCreatedAt(): ?string
    {
        return $this->created_at;
    }

    public function setCreatedAt(?string $created_at): void
    {
        $this->created_at = $created_at;
    }

    /**
     * Retorna todas as imagens de uma ou mais vagas,
     * agrupadas pelo ID da vaga.
     *
     * Utiliza uma única consulta para evitar executar
     * uma query individual para cada vaga.
     */
    public function selectGroupedByVacancyIds(array $vacancyIds): array
    {
        $vacancyIds = array_values(array_unique(array_filter(
            array_map('intval', $vacancyIds),
            static fn (int $id): bool => $id > 0
        )));

        if ($vacancyIds === []) {
            return [];
        }

        try {
            $placeholders = [];
            $params = [];

            foreach ($vacancyIds as $index => $vacancyId) {
                $placeholder = ':vacancy_' . $index;

                $placeholders[] = $placeholder;
                $params[$placeholder] = $vacancyId;
            }

            $query = '
                SELECT
                    id,
                    vacancy_id,
                    image_path,
                    position,
                    created_at
                FROM ' . $this->table . '
                WHERE vacancy_id IN (' . implode(', ', $placeholders) . ')
                ORDER BY vacancy_id ASC, position ASC, id ASC
            ';

            $stmt = Connect::getInstance()->prepare($query);

            foreach ($params as $placeholder => $value) {
                $stmt->bindValue(
                    $placeholder,
                    $value,
                    PDO::PARAM_INT
                );
            }

            $stmt->execute();

            $grouped = [];

            foreach ($stmt->fetchAll() as $image) {
                $vacancyId = (int) $image->vacancy_id;

                $grouped[$vacancyId][] = self::formatImage($image);
            }

            $this->errorMessage = null;

            return $grouped;

        } catch (\Throwable $exception) {

            $this->errorMessage = $exception->getMessage();

            return [];
        }
    }

    /**
     * Retorna as imagens de uma vaga específica.
     */
    public function selectByVacancyId(int $vacancyId): array
    {
        if ($vacancyId < 1) {
            $this->errorMessage = 'ID da vaga inválido.';
            return [];
        }

        $grouped = $this->selectGroupedByVacancyIds([
            $vacancyId
        ]);

        return $grouped[$vacancyId] ?? [];
    }

    /**
     * Calcula a próxima posição disponível.
     */
    public function nextPositionForVacancy(int $vacancyId): int
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                'SELECT COALESCE(MAX(position), -1) + 1
                 FROM ' . $this->table . '
                 WHERE vacancy_id = :vacancy_id'
            );

            $stmt->bindValue(
                ':vacancy_id',
                $vacancyId,
                PDO::PARAM_INT
            );

            $stmt->execute();

            $this->errorMessage = null;

            return (int) $stmt->fetchColumn();

        } catch (\Throwable $exception) {

            $this->errorMessage = $exception->getMessage();

            return 0;
        }
    }

    /**
     * Formata a resposta da imagem para a API.
     */
    public static function formatImage(object $image): array
    {
        $relativePath = ltrim(
            str_replace('\\', '/', (string) $image->image_path),
            '/'
        );

        // Utiliza o caminho real do front controller,
        // funcionando também em pastas locais com nomes diferentes.

        $scriptDirectory = dirname(
            (string) ($_SERVER['SCRIPT_NAME'] ?? '/api/index.php')
        );

        $apiDirectory = rtrim(
            str_replace('\\', '/', $scriptDirectory),
            '/'
        );

        if ($apiDirectory === '' || $apiDirectory === '.') {
            $apiDirectory = '/api';
        }

        if ($apiDirectory[0] !== '/') {
            $apiDirectory = '/' . $apiDirectory;
        }

        $publicUrl = $apiDirectory . '/' . $relativePath;

        return [
            'id' => (int) $image->id,
            'vacancy_id' => (int) $image->vacancy_id,
            'image_path' => $relativePath,
            'image_url' => $publicUrl,
            'position' => (int) $image->position,
            'created_at' => $image->created_at
        ];
    }
}
