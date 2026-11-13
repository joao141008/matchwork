<?php

namespace Source\Support;

use RuntimeException;

class ProfilePhotoUpload
{
    public const MAX_FILE_SIZE = 5 * 1024 * 1024;

    private const MIME_EXTENSIONS = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp'
    ];

    private const RELATIVE_DIRECTORY = 'storage/profiles';

    private function getStorageDirectory(): string
    {
        return dirname(__DIR__, 2)
            . DIRECTORY_SEPARATOR
            . 'storage'
            . DIRECTORY_SEPARATOR
            . 'profiles';
    }

    /**
     * Valida e armazena uma foto de perfil.
     * O arquivo original é preservado, sem recompressão ou redução de resolução.
     */
    public function store(array $file): string
    {
        $uploadError = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);

        if ($uploadError !== UPLOAD_ERR_OK) {
            $messages = [
                UPLOAD_ERR_INI_SIZE => 'A foto ultrapassou o limite configurado no PHP.',
                UPLOAD_ERR_FORM_SIZE => 'A foto ultrapassou o limite permitido.',
                UPLOAD_ERR_PARTIAL => 'A foto foi enviada parcialmente.',
                UPLOAD_ERR_NO_FILE => 'Selecione uma foto de perfil.',
                UPLOAD_ERR_NO_TMP_DIR => 'A pasta temporária de upload não está disponível.',
                UPLOAD_ERR_CANT_WRITE => 'O servidor não conseguiu gravar a foto.',
                UPLOAD_ERR_EXTENSION => 'Uma extensão do PHP impediu o envio da foto.'
            ];

            throw new RuntimeException(
                $messages[$uploadError] ?? 'Ocorreu um erro durante o envio da foto.'
            );
        }

        $temporaryPath = (string) ($file['tmp_name'] ?? '');

        if ($temporaryPath === '' || !is_uploaded_file($temporaryPath)) {
            throw new RuntimeException('O arquivo recebido não é um upload válido.');
        }

        $size = filesize($temporaryPath);

        if ($size === false || $size < 1 || $size > self::MAX_FILE_SIZE) {
            throw new RuntimeException('A foto deve possuir no máximo 5 MB.');
        }

        if (!class_exists(\finfo::class)) {
            throw new RuntimeException(
                'A extensão Fileinfo do PHP precisa estar habilitada para validar imagens.'
            );
        }

        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($temporaryPath);

        if (!isset(self::MIME_EXTENSIONS[$mimeType])) {
            throw new RuntimeException(
                'Formato não permitido. Utilize JPEG, PNG ou WebP.'
            );
        }

        $imageInfo = getimagesize($temporaryPath);

        if (
            $imageInfo === false ||
            ($imageInfo['mime'] ?? null) !== $mimeType
        ) {
            throw new RuntimeException('O arquivo enviado não contém uma imagem válida.');
        }

        $storageDirectory = $this->getStorageDirectory();

        if (
            !is_dir($storageDirectory) &&
            !mkdir($storageDirectory, 0755, true) &&
            !is_dir($storageDirectory)
        ) {
            throw new RuntimeException(
                'Não foi possível criar a pasta de armazenamento das fotos.'
            );
        }

        if (!is_writable($storageDirectory)) {
            throw new RuntimeException(
                'A pasta de armazenamento das fotos não possui permissão de escrita.'
            );
        }

        $filename = bin2hex(random_bytes(16))
            . '.'
            . self::MIME_EXTENSIONS[$mimeType];

        $destination = $storageDirectory
            . DIRECTORY_SEPARATOR
            . $filename;

        if (!move_uploaded_file($temporaryPath, $destination)) {
            throw new RuntimeException('Não foi possível armazenar a foto enviada.');
        }

        return self::RELATIVE_DIRECTORY . '/' . $filename;
    }

    /**
     * Exclui somente arquivos pertencentes à pasta de fotos de perfil.
     */
    public function delete(?string $relativePath): bool
    {
        if ($relativePath === null || $relativePath === '') {
            return true;
        }

        $relativePath = str_replace('\\', '/', $relativePath);
        $prefix = self::RELATIVE_DIRECTORY . '/';

        if (!str_starts_with($relativePath, $prefix)) {
            return false;
        }

        $filename = substr($relativePath, strlen($prefix));

        if ($filename === '' || basename($filename) !== $filename) {
            return false;
        }

        $filePath = $this->getStorageDirectory()
            . DIRECTORY_SEPARATOR
            . $filename;

        if (!is_file($filePath)) {
            return true;
        }

        return unlink($filePath);
    }
}
