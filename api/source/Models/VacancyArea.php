<?php

namespace Source\Models;

use PDO;
use RuntimeException;
use Source\Core\Connect;
use Source\Core\Model;
use Throwable;

class VacancyArea extends Model
{
    private ?int $id;
    private ?int $vacancy_id;
    private ?int $area_id;
    private ?string $custom_area;

    public function __construct(
        ?int $id = null,
        ?int $vacancy_id = null,
        ?int $area_id = null,
        ?string $custom_area = null
    ) {
        $this->id = $id;
        $this->vacancy_id = $vacancy_id;
        $this->area_id = $area_id;
        $this->custom_area = $custom_area;

        $this->table = 'vacancy_areas';
        $this->fillable = ['vacancyId', 'areaId', 'customArea'];
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

    public function getAreaId(): ?int
    {
        return $this->area_id;
    }

    public function setAreaId(?int $area_id): void
    {
        $this->area_id = $area_id;
    }

    public function getCustomArea(): ?string
    {
        return $this->custom_area;
    }

    public function setCustomArea(?string $custom_area): void
    {
        $this->custom_area = $custom_area;
    }

    /**
     * Substitui todas as áreas de uma vaga numa única transação.
     */
    public function replaceForVacancyId(int $vacancyId, array $areas): bool
    {
        $db = Connect::getInstance();

        try {
            $normalizedAreas = $this->validateAreas($areas, $db);
            $db->beginTransaction();

            $delete = $db->prepare(
                "DELETE FROM {$this->table} WHERE vacancy_id = :vacancy_id"
            );
            $delete->bindValue(':vacancy_id', $vacancyId, PDO::PARAM_INT);
            $delete->execute();

            foreach ($normalizedAreas as $area) {
                $relation = new self(
                    null,
                    $vacancyId,
                    $area['area_id'],
                    $area['custom_area']
                );

                if (!$relation->insert()) {
                    throw new RuntimeException('Não foi possível salvar uma das áreas da vaga.');
                }
            }

            $db->commit();
            $this->errorMessage = null;
            return true;
        } catch (Throwable $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            $this->errorMessage = $e->getMessage();
            return false;
        }
    }

    private function validateAreas(array $areas, PDO $db): array
    {
        $normalized = [];
        $seen = [];
        $stmt = $db->prepare('SELECT name FROM areas WHERE id = :area_id LIMIT 1');

        foreach ($areas as $item) {
            if (!is_array($item)) {
                throw new RuntimeException('Formato de área inválido.');
            }

            $areaId = filter_var($item['area_id'] ?? null, FILTER_VALIDATE_INT);
            if ($areaId === false || $areaId < 1 || isset($seen[$areaId])) {
                throw new RuntimeException('Área inválida ou repetida.');
            }

            if (array_key_exists('custom_area', $item)
                && $item['custom_area'] !== null
                && !is_scalar($item['custom_area'])) {
                throw new RuntimeException('A área personalizada deve ser um texto.');
            }

            $stmt->bindValue(':area_id', (int)$areaId, PDO::PARAM_INT);
            $stmt->execute();
            $areaName = $stmt->fetchColumn();

            if ($areaName === false) {
                throw new RuntimeException('Uma das áreas selecionadas não existe.');
            }

            $customArea = trim((string)($item['custom_area'] ?? ''));
            if ($areaName === 'Outras' && $customArea === '') {
                throw new RuntimeException('Informe a área personalizada ao selecionar "Outras".');
            }

            if ($areaName !== 'Outras') {
                $customArea = '';
            }

            $seen[$areaId] = true;
            $normalized[] = [
                'area_id' => (int)$areaId,
                'custom_area' => $customArea !== '' ? $customArea : null
            ];
        }

        return $normalized;
    }
}
