<?php

namespace Source\Core;

use PDO;

abstract class Connect
{
    private const OPTIONS = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ,
        PDO::ATTR_CASE => PDO::CASE_NATURAL,
        PDO::ATTR_EMULATE_PREPARES => false
    ];

    private static ?PDO $instance = null;

    public static function getInstance(): PDO
    {
        if (self::$instance === null) {
            self::$instance = new PDO(
                'mysql:host=' . CONF_DB_HOST . ';port=' . CONF_DB_PORT . ';dbname=' . CONF_DB_NAME . ';charset=utf8mb4',
                CONF_DB_USER,
                CONF_DB_PASS,
                self::OPTIONS
            );
        }

        return self::$instance;
    }

    private function __construct()
    {
    }

    private function __clone()
    {
    }
}
