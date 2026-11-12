<?php

error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);
date_default_timezone_set('America/Sao_Paulo');

ob_start();
require __DIR__ . '/vendor/autoload.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Token');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

use CoffeeCode\Router\Router;

$route = new Router(url('api'), ':');
$route->namespace('Source\\Controller');

$route->get('/hello', 'Api:hello');

// Usuários
$route->group('/users');
$route->post('/register', 'Users:register');
$route->post('/login', 'Users:auth');
$route->put('/update', 'Users:update');
$route->get('/list', 'Users:list');
$route->get('/list/{userId}', 'Users:listById');
$route->delete('/delete/{userId}', 'Users:deleteUser');
$route->post('/register-admin', 'Users:registerAdmin');
$route->post('/login-admin', 'Users:authAdmin');
$route->put('/update-admin', 'Users:updateAdmin');
$route->group(null);

// FAQs (leitura pública; alterações exclusivas de administrador)
$route->get('/faqs/list', 'Faqs\\Faqs:faqList');
$route->get('/faqs/list/{faqId}', 'Faqs\\Faqs:faqsListById');
$route->post('/faqs', 'Faqs\\Faqs:insert');
$route->put('/faqs/{faqId}', 'Faqs\\Faqs:update');
$route->delete('/faqs/{faqsId}', 'Faqs\\Faqs:delete');
$route->get('/faqs-categories/list', 'Faqs\\FaqsCategories:faqCategoryList');
$route->get('/faqs-categories/list/{categoryId}', 'Faqs\\FaqsCategories:faqCategoryListId');
$route->post('/faqs-categories', 'Faqs\\FaqsCategories:insert');
$route->put('/faqs-categories/{categoryId}', 'Faqs\\FaqsCategories:update');
$route->delete('/faqs-categories/{categoryId}', 'Faqs\\FaqsCategories:delete');

// Candidatos
$route->post('/candidates/register', 'Candidates:register');
$route->put('/candidates/update', 'Candidates:update');
$route->delete('/candidates/delete', 'Candidates:delete');
$route->get('/candidates/list', 'Candidates:candidatesList');
$route->get('/candidates/list/{candidatesId}', 'Candidates:candidatesListById');

// Empresas
$route->post('/companies/register', 'Companies:register');
$route->put('/companies/update', 'Companies:update');
$route->delete('/companies/delete', 'Companies:delete');
$route->get('/companies/list', 'Companies:companiesList');
$route->get('/companies/list/{companyId}', 'Companies:companiesListById');

// Perguntas e denúncias
$route->post('/questions/register', 'Questions:register');
$route->get('/questions/list', 'Questions:list');
$route->get('/questions/listall', 'Questions:listAll');
$route->delete('/questions/delete', 'Questions:delete');
$route->get('/reports/list', 'Reports:list');
$route->get('/reports/list/{reportId}', 'Reports:listById');
$route->post('/reports/register', 'Reports:register');
$route->put('/reports/update', 'Reports:update');
$route->delete('/reports/delete/{deleteId}', 'Reports:delete');

// Interações separadas por tipo de usuário
// Candidato: curtir vagas e consultar seus interesses
$route->post('/interactions/candidate/like', 'Interactions:registerCandidateLike');
$route->get('/interactions/candidate/list', 'Interactions:listCandidateLikes');
$route->post('/interactions/candidate/pass', 'Interactions:registerCandidatePass');
$route->get('/interactions/candidate/passes', 'Interactions:listCandidatePasses');

// Empresa: curtir candidatos interessados e consultar interessados
$route->post('/interactions/company/like', 'Interactions:registerCompanyLike');
$route->get('/interactions/company/list', 'Interactions:listCompanyLikes');

// Matches, conversas e mensagens
$route->get('/matches/list', 'Matches:list');
$route->get('/matches/view/{matchId}', 'Matches:listById');
$route->get('/conversations/list', 'Conversations:list');
$route->post('/conversations/register', 'Conversations:register');
$route->delete('/conversations/delete/{deleteId}', 'Conversations:delete');
$route->get('/conversations/list/{listId}', 'Conversations:listById');
$route->get('/messages/list/{conversationId}', 'Messages:list');
$route->get('/messages/view/{messageId}', 'Messages:listById');
$route->post('/messages/register', 'Messages:register');
$route->delete('/messages/delete/{deleteId}', 'Messages:delete');

// Vagas
$route->get('/vacancies/list', 'Vacancies:vacanciesList');
$route->get('/vacancies/list/{vacancyId}', 'Vacancies:vacanciesListById');
$route->get('/vacancies/company/list', 'Vacancies:vacanciesListByCompany');
$route->post('/vacancies/insert', 'Vacancies:insert');
$route->put('/vacancies/update/{vacancyId}', 'Vacancies:update');
$route->delete('/vacancies/delete/{vacancyId}', 'Vacancies:delete');

$route->post('/vacancies/{vacancyId}/images', 'VacancyImages:upload');

$route->delete('/vacancies/{vacancyId}/images/{imageId}', 'VacancyImages:delete');

// Áreas profissionais
$route->get('/areas/list', 'Areas:areasList');
$route->get('/areas/list/{areaId}', 'Areas:areasListById');

// Páginas HTML
$route->get('/app/dashboard', 'Web:dashboard');
$route->get('/app/chat', 'Web:chat');
$route->get('/app/matches', 'Web:matches');
$route->get('/app/profile', 'Web:profile');
$route->get('/public/login', 'Web:login');
$route->get('/public/signup', 'Web:signup');

try {
    $route->dispatch();
    if ($route->error()) {
        http_response_code(404);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode([
            'code' => 404,
            'status' => 'not_found',
            'message' => 'URL não encontrada.'
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }
} catch (Throwable $e) {
    ob_clean();
    http_response_code(500);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([
        'code' => 500,
        'status' => 'internal_server_error',
        'message' => 'Ocorreu um erro interno na API.'
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}

ob_end_flush();
