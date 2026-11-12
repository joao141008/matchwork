<?php

namespace Source\Core;

use JsonSerializable;
use PDO;
use PDOException;

abstract class Model implements JsonSerializable
{
    protected string $table = '';
    protected string $primaryKey = 'id';
    protected array $fillable = [];
    protected ?string $errorMessage = null;

    public function getErrorMessage(): ?string
    {
        return $this->errorMessage;
    }

    /**
     * Carrega um registro no próprio objeto.
     */
    public function selectById(int $id): bool
    {
        try {
            $query = "SELECT * FROM {$this->table} WHERE {$this->primaryKey} = :id LIMIT 1";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            $result = $stmt->fetch();
            if (!$result) {
                $this->errorMessage = 'Registro não encontrado.';
                return false;
            }

            foreach ($result as $column => $value) {
                $setter = 'set' . ucfirst($this->snakeToCamel($column));
                if (method_exists($this, $setter)) {
                    $this->{$setter}($value);
                }
            }

            $this->errorMessage = null;
            return true;
        } catch (PDOException $e) {
            $this->errorMessage = $e->getMessage();
            return false;
        }
    }

    /**
     * Os filtros devem ser expressões escritas no código e usar placeholders.
     * Ex.: selectAll(['user_id = :user_id'], 'created_at', 'DESC', [':user_id' => 10]).
     */
    public function selectAll(
        array $filters = [],
        ?string $orderBy = 'id',
        string $direction = 'ASC',
        array $params = []
    ): array {
        try {
            $query = "SELECT * FROM {$this->table}";
            if ($filters !== []) {
                $query .= ' WHERE ' . implode(' AND ', $filters);
            }

            if ($orderBy !== null) {
                $query .= ' ORDER BY ' . $this->safeIdentifier($orderBy);
                $direction = strtoupper($direction);
                if (!in_array($direction, ['ASC', 'DESC'], true)) {
                    throw new \InvalidArgumentException('Direção de ordenação inválida.');
                }
                $query .= ' ' . $direction;
            }

            $stmt = Connect::getInstance()->prepare($query);
            $stmt->execute($params);
            $this->errorMessage = null;
            return $stmt->fetchAll();
        } catch (\Throwable $e) {
            $this->errorMessage = $e->getMessage();
            return [];
        }
    }

    public function selectPaginator(
        int $page = 1,
        int $perPage = 10,
        array $filters = [],
        ?string $orderBy = 'id',
        string $direction = 'ASC',
        array $params = []
    ): array {
        try {
            $page = max(1, $page);
            $perPage = min(100, max(1, $perPage));
            $where = $filters !== [] ? ' WHERE ' . implode(' AND ', $filters) : '';

            $countStmt = Connect::getInstance()->prepare("SELECT COUNT(*) AS total FROM {$this->table}{$where}");
            $countStmt->execute($params);
            $total = (int)$countStmt->fetch()->total;

            $query = "SELECT * FROM {$this->table}{$where}";
            if ($orderBy !== null) {
                $query .= ' ORDER BY ' . $this->safeIdentifier($orderBy);
                $direction = strtoupper($direction);
                if (!in_array($direction, ['ASC', 'DESC'], true)) {
                    throw new \InvalidArgumentException('Direção de ordenação inválida.');
                }
                $query .= ' ' . $direction;
            }
            $query .= ' LIMIT ' . (($page - 1) * $perPage) . ', ' . $perPage;

            $stmt = Connect::getInstance()->prepare($query);
            $stmt->execute($params);
            $this->errorMessage = null;

            return [
                'page' => $page,
                'perPage' => $perPage,
                'total' => $total,
                'data' => $stmt->fetchAll()
            ];
        } catch (\Throwable $e) {
            $this->errorMessage = $e->getMessage();
            return [];
        }
    }

    public function insert(): bool
    {
        try {
            $payload = $this->extractPayloadFromGetters();
            if ($payload === []) {
                $this->errorMessage = 'Nenhum campo válido para inserção.';
                return false;
            }

            $columns = array_keys($payload);
            $placeholders = array_map(static fn(string $column): string => ':' . $column, $columns);
            $query = sprintf(
                'INSERT INTO %s (%s) VALUES (%s)',
                $this->table,
                implode(', ', $columns),
                implode(', ', $placeholders)
            );

            $stmt = Connect::getInstance()->prepare($query);
            foreach ($payload as $column => $value) {
                $stmt->bindValue(':' . $column, $value);
            }
            $stmt->execute();

            if (method_exists($this, 'setId')) {
                $this->setId((int)Connect::getInstance()->lastInsertId());
            }

            $this->errorMessage = null;
            return true;
        } catch (PDOException $e) {
            $this->errorMessage = $e->getMessage();
            return false;
        }
    }

    public function updateById(int $id, array $includeNullFields = []): bool
    {
        try {
            $payload = $this->extractPayloadFromGetters($includeNullFields);
            if ($payload === []) {
                $this->errorMessage = 'Nenhum campo válido para atualização.';
                return false;
            }

            $setParts = [];
            foreach (array_keys($payload) as $column) {
                $setParts[] = "{$column} = :{$column}";
            }

            $query = sprintf(
                'UPDATE %s SET %s WHERE %s = :_id',
                $this->table,
                implode(', ', $setParts),
                $this->primaryKey
            );

            $stmt = Connect::getInstance()->prepare($query);
            foreach ($payload as $column => $value) {
                $type = $value === null ? PDO::PARAM_NULL : (is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR);
                $stmt->bindValue(':' . $column, $value, $type);
            }
            $stmt->bindValue(':_id', $id, PDO::PARAM_INT);
            $stmt->execute();

            // MySQL retorna zero quando o registro existe, mas recebeu os mesmos valores.
            if ($stmt->rowCount() === 0) {
                $check = Connect::getInstance()->prepare(
                    "SELECT 1 FROM {$this->table} WHERE {$this->primaryKey} = :id LIMIT 1"
                );
                $check->bindValue(':id', $id, PDO::PARAM_INT);
                $check->execute();
                if (!$check->fetchColumn()) {
                    $this->errorMessage = 'Registro não encontrado.';
                    return false;
                }
            }

            $this->errorMessage = null;
            return true;
        } catch (PDOException $e) {
            $this->errorMessage = $e->getMessage();
            return false;
        }
    }

    public function deleteById(int $id): bool
    {
        try {
            $query = "DELETE FROM {$this->table} WHERE {$this->primaryKey} = :id";
            $stmt = Connect::getInstance()->prepare($query);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() < 1) {
                $this->errorMessage = 'Registro não encontrado.';
                return false;
            }

            $this->errorMessage = null;
            return true;
        } catch (PDOException $e) {
            $this->errorMessage = $e->getMessage();
            return false;
        }
    }

    /**
     * Serializa Models usando os getters, mantendo as propriedades encapsuladas.
     */
    public function jsonSerialize(): array
    {
        $data = $this->extractPayloadFromGetters();
        if (method_exists($this, 'getId') && $this->getId() !== null) {
            return ['id' => $this->getId()] + $data;
        }
        return $data;
    }

    protected function extractPayloadFromGetters(array $includeNullFields = []): array
    {
        $payload = [];
        foreach ($this->fillable as $fieldCamel) {
            $getter = 'get' . ucfirst($fieldCamel);
            if (!method_exists($this, $getter)) {
                continue;
            }

            $value = $this->{$getter}();
            if ($value !== null || in_array($fieldCamel, $includeNullFields, true)) {
                $payload[$this->camelToSnake($fieldCamel)] = $value;
            }
        }
        return $payload;
    }

    protected function camelToSnake(string $field): string
    {
        return strtolower((string)preg_replace('/[A-Z]/', '_$0', $field));
    }

    protected function snakeToCamel(string $field): string
    {
        return lcfirst(str_replace(' ', '', ucwords(str_replace('_', ' ', strtolower($field)))));
    }

    private function safeIdentifier(string $identifier): string
    {
        if (!preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $identifier)) {
            throw new \InvalidArgumentException('Nome de coluna inválido.');
        }
        return $identifier;
    }
}
