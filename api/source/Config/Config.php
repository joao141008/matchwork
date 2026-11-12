<?php

/**
 * Carrega variáveis opcionais de api/.env sem sobrescrever variáveis do servidor.
 * Em produção, prefira configurar essas variáveis diretamente no ambiente.
 */
$environmentFile = dirname(__DIR__, 2) . '/.env';
if (is_file($environmentFile)) {
    foreach (file($environmentFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }

        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim(trim($value), "\"'");
        if ($key !== '' && getenv($key) === false) {
            putenv($key . '=' . $value);
        }
    }
}

$constants = [
    'CONF_URL_BASE' => getenv('CONF_URL_BASE') ?: 'http://localhost/joaowork',
    'CONF_URL_TEST' => getenv('CONF_URL_TEST') ?: 'http://localhost/joaowork',
    'CONF_DB_HOST' => getenv('CONF_DB_HOST') ?: 'localhost',
    'CONF_DB_NAME' => getenv('CONF_DB_NAME') ?: 'db-acme-tarde',
    'CONF_DB_USER' => getenv('CONF_DB_USER') ?: 'root',
    'CONF_DB_PORT' => getenv('CONF_DB_PORT') ?: '3306',
    'CONF_DB_PASS' => getenv('CONF_DB_PASS') !== false ? getenv('CONF_DB_PASS') : '',
    // Chave apenas para desenvolvimento local. Defina uma chave longa e aleatória no .env.
    'JWT_SECRET_KEY' => getenv('JWT_SECRET_KEY') ?: 'matchwork-local-development-secret-key-2026-HS512-change-before-production-9f3a7c2d'
];

foreach ($constants as $name => $value) {
    if (!defined($name)) {
        define($name, $value);
    }
}
