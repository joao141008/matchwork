<?php

namespace Source\Controller;

class Web
{
    private function redirectToView(string $relativePath): void
    {
        $target = rtrim(CONF_URL_BASE, '/') . '/views/' . ltrim($relativePath, '/');
        header('Location: ' . $target, true, 302);
        exit;
    }

    public function dashboard(): void { $this->redirectToView('app/dashboard.html'); }
    public function chat(): void { $this->redirectToView('app/chat.html'); }
    public function matches(): void { $this->redirectToView('app/matches.html'); }
    public function profile(): void { $this->redirectToView('app/profile.html'); }
    public function login(): void { $this->redirectToView('public/login.html'); }
    public function signup(): void { $this->redirectToView('public/signup.html'); }
}
