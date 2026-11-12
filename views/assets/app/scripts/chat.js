const chats = [

{
nome: "João Silva",

status: "🟢 Online",

imagem:
"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop",

mensagens: [

{
tipo: "other",
texto: "Olá! Tudo bem?",
hora: "10:30"
},

{
tipo: "own",
texto: "Tudo certo! E você?",
hora: "10:31"
},

{
tipo: "other",
texto: "Gostei bastante do seu perfil.",
hora: "10:32"
}

]

},



{
nome: "Tech Solutions",

status: "🟢 Online",

imagem:
"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=400&auto=format&fit=crop",

mensagens: [

{
tipo: "other",
texto: "Gostamos bastante do seu perfil.",
hora: "09:14"
},

{
tipo: "own",
texto: "Muito obrigado!",
hora: "09:16"
}

]

},



{
nome: "Maria Santos",

status: "🔴 Offline",

imagem:
"https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop",

mensagens: [

{
tipo: "other",
texto: "Você trabalha com UX?",
hora: "Ontem"
}

]

},



{
nome: "Pedro Oliveira",

status: "🟢 Online",

imagem:
"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop",

mensagens: [

{
tipo: "other",
texto: "Achei teu portfólio muito bom.",
hora: "12:04"
}

]

},



{
nome: "Innovation Corp",

status: "🟢 Online",

imagem:
"https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=400&auto=format&fit=crop",

mensagens: [

{
tipo: "other",
texto: "Tem interesse em uma entrevista?",
hora: "08:11"
}

]

},



{
nome: "Ana Costa",

status: "🔴 Offline",

imagem:
"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop",

mensagens: [

{
tipo: "other",
texto: "Oi! Vi seu perfil hoje.",
hora: "Ontem"
}

]

}

];



// ELEMENTOS

const chatMessages =
document.querySelector("#chat-messages");

const chatName =
document.querySelector("#chat-contact-name");

const chatStatus =
document.querySelector("#chat-contact-status");

const chatImage =
document.querySelector("#chat-image");

const chatForm =
document.querySelector("#chat-form");

const chatInput =
document.querySelector("#chat-input");



// CHAT ATUAL

const chatSelecionado =
Number(
localStorage.getItem(
"chatSelecionado"
)
) || 0;

const conversa =
chats[chatSelecionado];



// HEADER

chatName.textContent =
conversa.nome;

chatStatus.textContent =
conversa.status;

chatImage.src =
conversa.imagem;



// MENSAGENS

function renderMensagens(){

chatMessages.innerHTML = "";

conversa.mensagens.forEach(msg=>{

chatMessages.innerHTML += `

<article class="
message
message-${msg.tipo}
">

<article class="message-content">

<p>${msg.texto}</p>

<span class="message-time">
${msg.hora}
</span>

</article>

</article>

`;

});

chatMessages.scrollTop =
chatMessages.scrollHeight;

}

renderMensagens();



// ENVIAR MENSAGEM

chatForm.addEventListener(
"submit",
e=>{

e.preventDefault();

const texto =
chatInput.value.trim();

if(!texto) return;

conversa.mensagens.push({

tipo: "own",

texto,

hora:
new Date()
.toLocaleTimeString(
"pt-BR",
{
hour:"2-digit",
minute:"2-digit"
}
)

});

renderMensagens();

chatInput.value = "";

}
);



// BOTÕES

document
.querySelector("#btn-back")
.addEventListener(
"click",
()=>{

window.location.href =
"./matches";

}
);

document
.querySelector("#btn-logout")
.addEventListener(
"click",
()=>{

window.location.href =
"../public/";

}
);