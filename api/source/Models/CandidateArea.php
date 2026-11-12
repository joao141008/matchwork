<?php

namespace Source\Models;

use PDO;
use PDOException;
use RuntimeException;
use Source\Core\Connect;
use Source\Core\Model;
use Throwable;

class CandidateArea extends Model
{
    private ?int $id;
    private ?int $candidate_id;
    private ?int $area_id;
    private ?string $custom_area;

    public function __construct(
        ?int $id = null,
        ?int $candidate_id = null,
        ?int $area_id = null,
        ?string $custom_area = null
    ) {
        $this->id = $id;
        $this->candidate_id = $candidate_id;
        $this->area_id = $area_id;
        $this->custom_area = $custom_area;
        $this->table = 'candidate_areas';
        $this->fillable = ['candidateId', 'areaId', 'customArea'];
    }

    public function getId(): ?int { return $this->id; }
    public function setId(?int $id): void { $this->id = $id; }
    public function getCandidateId(): ?int { return $this->candidate_id; }
    public function setCandidateId(?int $candidate_id): void { $this->candidate_id = $candidate_id; }
    public function getAreaId(): ?int { return $this->area_id; }
    public function setAreaId(?int $area_id): void { $this->area_id = $area_id; }
    public function getCustomArea(): ?string { return $this->custom_area; }
    public function setCustomArea(?string $custom_area): void { $this->custom_area = $custom_area; }

    public function selectByCandidateId(int $candidateId): array
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                "SELECT * FROM {$this->table} WHERE candidate_id = :candidate_id ORDER BY id ASC"
            );
            $stmt->bindValue(':candidate_id', $candidateId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            $this->errorMessage = $e->getMessage();
            return [];
        }
    }

    public function deleteByCandidateId(int $candidateId): bool
    {
        try {
            $stmt = Connect::getInstance()->prepare(
                "DELETE FROM {$this->table} WHERE candidate_id = :candidate_id"
            );
            $stmt->bindValue(':candidate_id', $candidateId, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            $this->errorMessage = $e->getMessage();
            return false;
        }
    }

    /**
     * Substitui todas as áreas do candidato numa única transação.
     * Uma lista vazia remove as relações existentes.
     */
    public function replaceForCandidateId(int $candidateId, array $areas): bool
    {
        $db = Connect::getInstance();

        try {
            $normalizedAreas = $this->validateAreas($areas, $db);
            $db->beginTransaction();

            $delete = $db->prepare("DELETE FROM {$this->table} WHERE candidate_id = :candidate_id");
            $delete->bindValue(':candidate_id', $candidateId, PDO::PARAM_INT);
            $delete->execute();

            foreach ($normalizedAreas as $area) {
                $relation = new self(
                    null,
                    $candidateId,
                    $area['area_id'],
                    $area['custom_area']
                );

                if (!$relation->insert()) {
                    throw new RuntimeException('Não foi possível salvar uma das áreas do candidato.');
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
            $seen[$areaId] = true;

            $stmt->bindValue(':area_id', $areaId, PDO::PARAM_INT);
            $stmt->execute();
            $areaName = $stmt->fetchColumn();
            if ($areaName === false) {
                throw new RuntimeException('Uma das áreas selecionadas não existe.');
            }

            if (array_key_exists('custom_area', $item)
                && $item['custom_area'] !== null
                && !is_scalar($item['custom_area'])) {
                throw new RuntimeException('A área personalizada deve ser um texto.');
            }

            $customArea = trim((string)($item['custom_area'] ?? ''));
            if ($areaName === 'Outras' && $customArea === '') {
                throw new RuntimeException('Informe a área personalizada ao selecionar "Outras".');
            }
            if ($areaName !== 'Outras') {
                $customArea = '';
            }

            $normalized[] = [
                'area_id' => (int)$areaId,
                'custom_area' => $customArea !== '' ? $customArea : null
            ];
        }

        return $normalized;
    }
}
