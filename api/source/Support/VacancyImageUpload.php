<?php

namespace Source\Support;

use RuntimeException;

class VacancyImageUpload
{
    public const MAX_FILE_SIZE = 5 * 1024 * 1024;

    public const MAX_IMAGES_PER_VACANCY = 6;

    private const MIME_EXTENSIONS = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp'
    ];

    private const RELATIVE_DIRECTORY = 'storage/vacancies';

    private function getStorageDirectory(): string
    {
        return dirname(__DIR__, 2)
            . DIRECTORY_SEPARATOR
            . 'storage'
            . DIRECTORY_SEPARATOR
            . 'vacancies';
    }

    /**
     * Recebe os arquivos enviados em $_FILES['images'].
     *
     * Retorna os caminhos relativos à pasta api/.
     */
    public function storeMany(
        array $files,
        int $maxFilesAllowed
    ): array {

        $normalizedFiles = $this->normalizeFiles($files);

        if ($normalizedFiles === []) {
            throw new RuntimeException(
                'Selecione pelo menos uma imagem.'
            );
        }

        if (
            $maxFilesAllowed < 1 ||
            count($normalizedFiles) > $maxFilesAllowed
        ) {
            throw new RuntimeException(
                'Cada vaga pode possuir no máximo '
                . self::MAX_IMAGES_PER_VACANCY
                . ' imagens.'
            );
        }

        // Validar todos os arquivos antes de armazenar qualquer um.

        $validatedFiles = [];

        foreach ($normalizedFiles as $file) {
            $validatedFiles[] = $this->validateFile($file);
        }

        $storageDirectory = $this->getStorageDirectory();

        if (
            !is_dir($storageDirectory) &&
            !mkdir($storageDirectory, 0755, true) &&
            !is_dir($storageDirectory)
        ) {
            throw new RuntimeException(
                'Não foi possível criar a pasta de armazenamento das imagens.'
            );
        }

        if (!is_writable($storageDirectory)) {
            throw new RuntimeException(
                'A pasta de armazenamento das imagens não possui permissão de escrita.'
            );
        }

        $storedPaths = [];

        try {

            foreach ($validatedFiles as $file) {

                $filename = bin2hex(random_bytes(16))
                    . '.'
                    . $file['extension'];

                $destination = $storageDirectory
                    . DIRECTORY_SEPARATOR
                    . $filename;

                if (!move_uploaded_file(
                    $file['tmp_name'],
                    $destination
                )) {
                    throw new RuntimeException(
                        'Não foi possível armazenar uma das imagens enviadas.'
                    );
                }

                $storedPaths[] = self::RELATIVE_DIRECTORY
                    . '/'
                    . $filename;
            }

            return $storedPaths;

        } catch (\Throwable $exception) {

            $this->deleteMany($storedPaths);

            throw $exception;
        }
    }

    /**
     * Remove um arquivo armazenado pela classe.
     */
    public function delete(string $relativePath): bool
    {
        $relativePath = str_replace('\\', '/', $relativePath);

        $prefix = self::RELATIVE_DIRECTORY . '/';

        if (!str_starts_with($relativePath, $prefix)) {
            return false;
        }

        $filename = substr(
            $relativePath,
            strlen($prefix)
        );

        if (
            $filename === '' ||
            basename($filename) !== $filename
        ) {
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

    /**
     * Remove vários arquivos.
     */
    public function deleteMany(array $relativePaths): void
    {
        foreach ($relativePaths as $relativePath) {

            if (is_string($relativePath)) {
                $this->delete($relativePath);
            }
        }
    }

    /**
     * Normaliza o formato de $_FILES.
     */
    private function normalizeFiles(array $files): array
    {
        if (!isset($files['name'])) {
            return [];
        }

        if (!is_array($files['name'])) {
            return [$files];
        }

        $normalized = [];

        $count = count($files['name']);

        for ($index = 0; $index < $count; $index++) {

            $normalized[] = [
                'name' => $files['name'][$index] ?? '',
                'type' => $files['type'][$index] ?? '',
                'tmp_name' => $files['tmp_name'][$index] ?? '',
                'error' => $files['error'][$index] ?? UPLOAD_ERR_NO_FILE,
                'size' => $files['size'][$index] ?? 0
            ];
        }

        return $normalized;
    }

    /**
     * Valida o arquivo utilizando seu conteúdo real.
     * Não confia na extensão ou no MIME enviado pelo navegador.
     */
    private function validateFile(array $file): array
    {
        $uploadError = (int) (
            $file['error'] ?? UPLOAD_ERR_NO_FILE
        );

        if ($uploadError !== UPLOAD_ERR_OK) {

            $messages = [
                UPLOAD_ERR_INI_SIZE =>
                    'Uma imagem ultrapassou o limite configurado no PHP.',

                UPLOAD_ERR_FORM_SIZE =>
                    'Uma imagem ultrapassou o limite permitido pelo formulário.',

                UPLOAD_ERR_PARTIAL =>
                    'Uma imagem foi enviada parcialmente.',

                UPLOAD_ERR_NO_FILE =>
                    'Uma das imagens não foi selecionada.',

                UPLOAD_ERR_NO_TMP_DIR =>
                    'A pasta temporária de upload não está disponível.',

                UPLOAD_ERR_CANT_WRITE =>
                    'O servidor não conseguiu gravar uma imagem.',

                UPLOAD_ERR_EXTENSION =>
                    'Uma extensão do PHP impediu o envio de uma imagem.'
            ];

            throw new RuntimeException(
                $messages[$uploadError]
                    ?? 'Ocorreu um erro durante o envio de uma imagem.'
            );
        }

        $temporaryPath = (string) (
            $file['tmp_name'] ?? ''
        );

        if (
            $temporaryPath === '' ||
            !is_uploaded_file($temporaryPath)
        ) {
            throw new RuntimeException(
                'O arquivo recebido não é um upload válido.'
            );
        }

        $size = filesize($temporaryPath);

        if (
            $size === false ||
            $size < 1 ||
            $size > self::MAX_FILE_SIZE
        ) {
            throw new RuntimeException(
                'Cada imagem deve possuir no máximo 5 MB.'
            );
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
                'Formato de imagem não permitido. Utilize JPEG, PNG ou WebP.'
            );
        }

        $imageInfo = getimagesize($temporaryPath);

        if (
            $imageInfo === false ||
            ($imageInfo['mime'] ?? null) !== $mimeType
        ) {
            throw new RuntimeException(
                'O arquivo enviado não contém uma imagem válida.'
            );
        }

        return [
            'tmp_name' => $temporaryPath,
            'extension' => self::MIME_EXTENSIONS[$mimeType]
        ];
    }
}
