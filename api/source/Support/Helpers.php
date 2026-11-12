<?php

function url(?string $path = null): string
{
    $host = $_SERVER['HTTP_HOST'] ?? '';
    $baseUrl = $host === 'localhost' ? CONF_URL_TEST : CONF_URL_BASE;

    if ($path === null || $path === '') {
        return rtrim($baseUrl, '/');
    }

    return rtrim($baseUrl, '/') . '/' . ltrim($path, '/');
}
