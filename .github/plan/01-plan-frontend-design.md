# Planejamento do Frontend

Em um primeiro momento, os dados serão renderizados de forma estática, sendo possível criar algumas funcionalidades que serão de responsabilidade do `JavaScript`, por exemplo: responsividade, controle de menus e listas, aparência, etc. O consumo da API e a renderização dinâmica dos dados serão implementados posteriormente.
 
O sistema será composto por três áreas distintas, cada uma com suas próprias interfaces e funcionalidades:

## Área Pública
[
 Na área pública terá um botão de login e cadastro ambos na parte superior direta.
 Centralizado no meio  o nome do site "MatchWork", enquanto na área superior esquerda também aparecerá mas em menor tamanho e destaque de forma fixa.
 Terá um footer fixo na parte inferior da página onde ficará as redes sociais.
 Ao descer a tela encontraremos um texto do lado esquerdo esplicando resumidamente 
 o intuito e funcionamento da pagina e ao seu lado uma image/gif ilustrando isso.
 Abaixo disso se localizarão textos clicáves com as perguntas onde ao serem acionados mostraram a resposta das mesmas.
]

## Área de Aplicação
[
Na área principal da aplicação, o nome do site ficará localizado no canto superior esquerdo da tela, enquanto a foto de perfil do usuário logado ficará no canto superior direito, permitindo que, ao clicar nela, o usuário seja direcionado para sua página de perfil. Entre o nome do site e a foto de perfil estarão posicionados os filtros de busca, que deverão variar conforme o tipo de conta utilizada. Para usuários do tipo pessoa, os filtros poderão incluir área de interesse,  localização, carga horária e salário Já para empresas, os filtros poderão envolver competências,salário de interesse, disponibilidade de horário, localização.

No centro da tela principal será exibida a foto da empresa ou da pessoa cadastrada no sistema. Ao lado direito dessa foto haverá um botão de confirmação de interesse, representado por um ícone de “✔”, e logo abaixo dele haverá um botão de rejeição, representado por um “X”. No lado esquerdo da foto ficará a descrição do perfil apresentado, contendo informações resumidas sobre a empresa ou candidato, facilitando a visualização rápida antes de decidir dar match ou não.

Ao acessar a página de perfil, o usuário encontrará, no canto superior esquerdo, um botão que abrirá uma nova página contendo todos os matches realizados. No centro superior da página ficará a foto de perfil do usuário logado e, no canto superior direito, haverá um botão de voltar para retornar à área principal da aplicação. Na página de matches serão exibidas as fotos de perfil de todos os usuários com quem houve match e, ao clicar em uma dessas fotos, será aberta uma tela de bate-papo para conversa entre os usuários.

Ainda na página de perfil, a área central será destinada às informações do usuário logado, permitindo que elas sejam editadas de forma simples e organizada. Já na parte inferior da página haverá um espaço destinado ao envio de perguntas ou dúvidas para a área administrativa do sistema.
 O layout da aplicação deve seguir um estilo moderno, intuitivo e organizado, inspirado em aplicativos de match mas investindo em uma aparência formal, garantindo uma navegação clara e prática entre as áreas de perfil, matches e bate-papo.
 Como base utilizar os tons:
 #2E3130
 #5F5246
 #B17146
Focando mais nessas:
#446368
 #D8AF87
]

## Área Administrativa
[
Na parte superior da tela estarão os dados gerais do sistema, como a quantidade total de matches realizados entre empresas e candidatos cadastrados no site. Essas informações poderão aparecer em cards informativos para facilitar a visualização rápida dos principais dados da plataforma.

No centro da área administrativa haverá uma seção destinada ao gerenciamento das perguntas frequentes (FAQ). Nessa área, os administradores poderão adicionar novas perguntas, editar perguntas já existentes, atualizar respostas e excluir conteúdos quando necessário.
 Os botões de ação deverão ficar visíveis e organizados, facilitando o gerenciamento das informações do sistema.

Também haverá uma seção voltada para o monitoramento de denúncias feitas contra empresas e funcionários cadastrados na plataforma abaixo das perguntas frequentes. Em vez de um gráfico geral, essa área contará com um ranking dos usuários mais denunciados, mostrando a posição no ranking, a foto de perfil, o nome do usuário ou empresa e a quantidade de denúncias recebidas. Isso permitirá que os administradores identifiquem rapidamente quais contas apresentam mais problemas dentro da plataforma.
Possibiltando a exclusão.
]
