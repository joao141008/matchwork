<?php

namespace source;

class Web
{

    public function dashboard()
    {
        require __DIR__ . "/../../views/app/dashboard.php";
    }

    public function chat()
    {
        require __DIR__ . "/../../views/app/chat.php";
    }

    public function matches()
    {
        require __DIR__ . "/../../views/app/matches.php";
    }

    public function profile()
    {
        require __DIR__ . "/../../views/app/profile.php";
    }

    public function login()
    {
        require __DIR__ . "/../../views/public/location.php";
    }
}