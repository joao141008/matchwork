CREATE DATABASE IF NOT EXISTS `db-acme-tarde`;

USE `db-acme-tarde`;


-- =========================================================
-- DROP TABLES
-- =========================================================

DROP TABLE IF EXISTS messages;

DROP TABLE IF EXISTS conversations;

DROP TABLE IF EXISTS matches;

DROP TABLE IF EXISTS company_likes;

DROP TABLE IF EXISTS vacancy_passes;

DROP TABLE IF EXISTS vacancy_images;

DROP TABLE IF EXISTS vacancy_likes;

DROP TABLE IF EXISTS interactions;

DROP TABLE IF EXISTS questions;

DROP TABLE IF EXISTS reports;

DROP TABLE IF EXISTS faqs;

DROP TABLE IF EXISTS faqs_categories;

DROP TABLE IF EXISTS vacancy_areas;

DROP TABLE IF EXISTS candidate_areas;

DROP TABLE IF EXISTS company_areas;

DROP TABLE IF EXISTS vacancies;

DROP TABLE IF EXISTS areas;

DROP TABLE IF EXISTS companies;

DROP TABLE IF EXISTS candidates;

DROP TABLE IF EXISTS users;

DROP TABLE IF EXISTS user_types;




-- =========================================================
-- USER TYPES
-- =========================================================

CREATE TABLE user_types (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(255) NOT NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


INSERT INTO user_types (name) VALUES
('ADMIN'),
('USER'),
('PESSOA'),
('EMPRESA');


-- =========================================================
-- USERS
-- =========================================================

CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT,

    type_id INT DEFAULT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password VARCHAR(255) NOT NULL,

    photo VARCHAR(255) DEFAULT NULL,

    active TINYINT(1) NOT NULL DEFAULT '1',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    KEY fk_users_user_types_idx (type_id),

    CONSTRAINT fk_users_user_types
    FOREIGN KEY (type_id)
    REFERENCES user_types(id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =========================================================
-- AREAS PROFISSIONAIS
-- =========================================================

CREATE TABLE areas (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(255) NOT NULL UNIQUE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


INSERT INTO areas (name) VALUES
('Tecnologia'),
('Administração'),
('Saúde'),
('Educação'),
('Engenharia'),
('Comércio'),
('Comunicação'),
('Indústria'),
('Serviços'),
('Logística'),
('Direito'),
('Design'),
('Marketing'),
('Outras');


-- =========================================================
-- PESSOAS / CANDIDATOS
-- =========================================================

CREATE TABLE candidates (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL UNIQUE,

    full_name VARCHAR(255) NOT NULL,

    cpf VARCHAR(14) NOT NULL UNIQUE,

    location VARCHAR(255),

    interest_area VARCHAR(255),

    salary_expectation VARCHAR(100),

    work_schedule VARCHAR(100),

    shift VARCHAR(100),

    work_model VARCHAR(100),

    employment_type VARCHAR(100),

    about TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_candidates_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =========================================================
-- EMPRESAS
-- =========================================================


CREATE TABLE companies (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL UNIQUE,

    company_name VARCHAR(255) NOT NULL,

    cnpj VARCHAR(18) NOT NULL UNIQUE,

    location VARCHAR(255),

    website VARCHAR(255) DEFAULT NULL,

    company_size VARCHAR(50) DEFAULT NULL,

    industry VARCHAR(255),

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_companies_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



-- =========================================================
-- RELACIONAMENTO DE AREAS DOS CANDIDATOS
-- =========================================================

CREATE TABLE candidate_areas (
    id INT AUTO_INCREMENT PRIMARY KEY,

    candidate_id INT NOT NULL,

    area_id INT NOT NULL,

    custom_area VARCHAR(255) DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(candidate_id, area_id),

    CONSTRAINT fk_candidate_areas_candidate
    FOREIGN KEY (candidate_id)
    REFERENCES candidates(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_candidate_areas_area
    FOREIGN KEY (area_id)
    REFERENCES areas(id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =========================================================
-- RELACIONAMENTO DE AREAS DAS EMPRESAS
-- =========================================================

CREATE TABLE company_areas (
    id INT AUTO_INCREMENT PRIMARY KEY,

    company_id INT NOT NULL,

    area_id INT NOT NULL,

    custom_area VARCHAR(255) DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(company_id, area_id),

    CONSTRAINT fk_company_areas_company
    FOREIGN KEY (company_id)
    REFERENCES companies(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_company_areas_area
    FOREIGN KEY (area_id)
    REFERENCES areas(id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =========================================================
-- VAGAS
-- =========================================================

CREATE TABLE vacancies (
    id INT AUTO_INCREMENT PRIMARY KEY,

    company_id INT NOT NULL,

    title VARCHAR(255) NOT NULL,

    description TEXT NOT NULL,

    requirements TEXT,

    salary_offer VARCHAR(100),

    workload VARCHAR(100),

    work_schedule VARCHAR(100),

    shift VARCHAR(100),

    work_model VARCHAR(100),

    employment_type VARCHAR(100),

    location VARCHAR(255),

    benefits TEXT,

    status ENUM('active', 'paused', 'closed')
    NOT NULL DEFAULT 'active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_vacancies_company
    FOREIGN KEY (company_id)
    REFERENCES companies(id)
    ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =========================================================
-- RELACIONAMENTO DE AREAS DAS VAGAS
-- =========================================================

CREATE TABLE vacancy_areas (
    id INT AUTO_INCREMENT PRIMARY KEY,

    vacancy_id INT NOT NULL,

    area_id INT NOT NULL,

    custom_area VARCHAR(255) DEFAULT NULL,

    UNIQUE(vacancy_id, area_id),

    CONSTRAINT fk_vacancy_areas_vacancy
    FOREIGN KEY (vacancy_id)
    REFERENCES vacancies(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_vacancy_areas_area
    FOREIGN KEY (area_id)
    REFERENCES areas(id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =========================================================
-- INTERACTIONS (ESTRUTURA ORIGINAL MANTIDA)
-- =========================================================

CREATE TABLE interactions (
    id INT AUTO_INCREMENT PRIMARY KEY,

    from_user_id INT NOT NULL,

    to_user_id INT NOT NULL,

    action ENUM('like', 'dislike') NOT NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (from_user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    FOREIGN KEY (to_user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    UNIQUE(from_user_id, to_user_id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =========================================================
-- LIKES DOS CANDIDATOS NAS VAGAS
-- =========================================================

CREATE TABLE vacancy_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,

    candidate_user_id INT NOT NULL,

    vacancy_id INT NOT NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(candidate_user_id, vacancy_id),

    CONSTRAINT fk_vacancy_likes_candidate
    FOREIGN KEY (candidate_user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_vacancy_likes_vacancy
    FOREIGN KEY (vacancy_id)
    REFERENCES vacancies(id)
    ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =========================================================
-- VAGAS DISPENSADAS PELOS CANDIDATOS
-- =========================================================

CREATE TABLE vacancy_passes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_user_id INT NOT NULL,
    vacancy_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(candidate_user_id, vacancy_id),

    CONSTRAINT fk_vacancy_passes_candidate
    FOREIGN KEY (candidate_user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_vacancy_passes_vacancy
    FOREIGN KEY (vacancy_id)
    REFERENCES vacancies(id)
    ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =========================================================
-- LIKES DE VOLTA DAS EMPRESAS NOS CANDIDATOS
-- =========================================================

CREATE TABLE company_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,

    company_user_id INT NOT NULL,

    candidate_user_id INT NOT NULL,

    vacancy_id INT NOT NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(company_user_id, candidate_user_id, vacancy_id),

    CONSTRAINT fk_company_likes_company
    FOREIGN KEY (company_user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_company_likes_candidate
    FOREIGN KEY (candidate_user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_company_likes_vacancy
    FOREIGN KEY (vacancy_id)
    REFERENCES vacancies(id)
    ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =========================================================
-- MATCHES
-- =========================================================

CREATE TABLE matches (
    id INT AUTO_INCREMENT PRIMARY KEY,

    candidate_user_id INT NOT NULL,

    company_user_id INT NOT NULL,

    vacancy_id INT NOT NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_matches_candidate
    FOREIGN KEY (candidate_user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_matches_company
    FOREIGN KEY (company_user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_matches_vacancy
    FOREIGN KEY (vacancy_id)
    REFERENCES vacancies(id)
    ON DELETE CASCADE,

    UNIQUE(candidate_user_id, company_user_id, vacancy_id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =========================================================
-- CONVERSATIONS
-- =========================================================

CREATE TABLE conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,

    match_id INT NOT NULL UNIQUE,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_conversation_match
    FOREIGN KEY (match_id)
    REFERENCES matches(id)
    ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =========================================================
-- MESSAGES
-- =========================================================

CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,

    conversation_id INT NOT NULL,

    sender_id INT NOT NULL,

    message TEXT NOT NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_messages_conversation
    FOREIGN KEY (conversation_id)
    REFERENCES conversations(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_messages_sender
    FOREIGN KEY (sender_id)
    REFERENCES users(id)
    ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =========================================================
-- REPORTS
-- =========================================================

CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    reported_user_id INT NOT NULL,

    reason VARCHAR(255) NOT NULL,

    description TEXT,

    admin_response TEXT DEFAULT NULL,

    status ENUM(
        'pending',
        'reviewed',
        'resolved'
    ) DEFAULT 'pending',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    FOREIGN KEY (reported_user_id)
    REFERENCES users(id)
    ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =========================================================
-- QUESTIONS
-- =========================================================

CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    request_type ENUM('question', 'report', 'bug', 'suggestion') NOT NULL DEFAULT 'question',

    subject VARCHAR(255) NOT NULL,

    question TEXT NOT NULL,

    answer TEXT,

    status ENUM(
        'open',
        'answered'
    ) DEFAULT 'open',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =========================================================
-- FAQS CATEGORIES
-- =========================================================

CREATE TABLE faqs_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(255) NOT NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


INSERT INTO faqs_categories (name) VALUES
('Cadastro e Conta'),
('Candidatos'),
('Empresas'),
('Vagas e Interesses'),
('Matches e Conversas');


-- =========================================================
-- FAQS
-- =========================================================

CREATE TABLE faqs (
    id INT AUTO_INCREMENT PRIMARY KEY,

    faqs_category_id INT NOT NULL,

    question VARCHAR(255) NOT NULL,

    answer TEXT NOT NULL,

    KEY fk_faqs_faqs_categories1_idx (faqs_category_id),

    CONSTRAINT fk_faqs_faqs_categories1
    FOREIGN KEY (faqs_category_id)
    REFERENCES faqs_categories(id)
    ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- VAGA IMAGENS
-- =========================================================

CREATE TABLE vacancy_images (
    id INT AUTO_INCREMENT PRIMARY KEY,

    vacancy_id INT NOT NULL,

    image_path VARCHAR(500) NOT NULL,

    position INT NOT NULL DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_vacancy_images_vacancy
    FOREIGN KEY (vacancy_id)
    REFERENCES vacancies(id)
    ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =========================================================
-- FAQS INICIAIS DO MATCHWORK
-- =========================================================

INSERT INTO faqs (faqs_category_id, question, answer) VALUES
(1, 'Como faço para criar uma conta?', 'Acesse a tela de cadastro, informe seus dados e siga as instruções para concluir seu registro.'),
(1, 'Como posso atualizar meus dados?', 'Acesse seu perfil para consultar e atualizar as informações disponíveis.'),
(2, 'Como demonstro interesse em uma vaga?', 'Ao visualizar uma vaga, clique no botão de like para registrar seu interesse.'),
(2, 'As empresas conseguem ver meu perfil?', 'As empresas conseguem visualizar os candidatos que demonstraram interesse em suas vagas.'),
(3, 'Como minha empresa publica uma vaga?', 'Acesse sua área de empresa e utilize a opção de cadastrar uma nova vaga.'),
(3, 'Como vejo os candidatos interessados?', 'Na área da empresa, consulte os interessados em cada vaga publicada.'),
(4, 'O que acontece quando dou like em uma vaga?', 'Seu interesse fica registrado e a empresa responsável pela vaga poderá visualizar seu perfil.'),
(4, 'Posso demonstrar interesse em mais de uma vaga?', 'Sim. Você pode demonstrar interesse em diferentes vagas disponíveis.'),
(5, 'Quando um match é criado?', 'O match é criado quando a empresa também demonstra interesse no candidato que curtiu uma de suas vagas.'),
(5, 'Quando posso conversar com uma empresa?', 'O chat é liberado depois que o candidato e a empresa demonstram interesse um no outro para a mesma vaga.');