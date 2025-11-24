import { WHATSAPP_PHONE_NUMBER } from './config.js';

const cardContainer = document.querySelector('.card-container');
const overlay = document.getElementById('overlay');
const campoBusca = document.querySelector('header input');
const botaoBusca = document.querySelector('.search-bar button');
const cartButton = document.getElementById('cart-button');
const cartModal = document.getElementById('cart-modal');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartCount = document.getElementById('cart-count');
const sendWhatsappBtn = document.getElementById('send-whatsapp-btn');
let dados = [];
let carrinho = [];

// Função para renderizar os cards na tela
function renderizarCards(itens) {
    cardContainer.innerHTML = ''; // Limpa os cards existentes
    if (itens.length === 0) {
        cardContainer.innerHTML = '<p>Nenhum resultado encontrado.</p>';
        return;
    }

    for (let dado of itens) {
        const article = document.createElement("article");
        article.classList.add("card");
        article.innerHTML = `
            <img src="${dado.imagem}" alt="${dado.nome}" class="card-image">
            <button class="close-btn hidden">x</button>
            <div class="card-content">
                <h2>${dado.nome}</h2>
                <p>Origem: ${dado.ano}</p>
                <p>${dado.descricao}</p>
                <a href="${dado.link}" target="_blank" rel="noopener noreferrer">Ver na Wikipedia</a>
                <button class="add-to-cart-btn">Adicionar ao Pedido</button>
            </div>
        `;

        // Adiciona o evento de clique na imagem
        const imagem = article.querySelector('.card-image');
        const closeBtn = article.querySelector('.close-btn');

        imagem.addEventListener('click', () => {
            article.classList.add('expanded');
            closeBtn.classList.remove('hidden');
            overlay.classList.remove('hidden');
        });

        // Função para fechar o card
        const fecharCard = () => {
            article.classList.remove('expanded');
            closeBtn.classList.add('hidden');
            overlay.classList.add('hidden');
        };

        closeBtn.addEventListener('click', fecharCard);

        // Adiciona evento ao botão de adicionar ao carrinho
        const addToCartBtn = article.querySelector('.add-to-cart-btn');
        addToCartBtn.addEventListener('click', () => {
            adicionarAoCarrinho(dado);
        });
        cardContainer.appendChild(article);
    }
}

// Função assíncrona para buscar e filtrar os dados
async function iniciarBusca() {
    // Se os dados ainda não foram carregados, busca do JSON.
    if (dados.length === 0) {
        try {
            const resposta = await fetch("data.json");
            dados = await resposta.json();
        } catch (error) {
            console.error("Falha ao buscar dados:", error);
            cardContainer.innerHTML = '<p>Ocorreu um erro ao carregar o menu. Tente novamente mais tarde.</p>';
            return; // Interrompe a execução se houver erro
        }
    }

    const termoBusca = campoBusca.value.toLowerCase();
    
    // Filtra os dados com base no nome OU na descrição
    const dadosFiltrados = dados.filter(dado => 
        dado.nome.toLowerCase().includes(termoBusca) ||
        dado.descricao.toLowerCase().includes(termoBusca)
    );

    renderizarCards(dadosFiltrados);
}

// --- LÓGICA DO CARRINHO ---

function adicionarAoCarrinho(item) {
    const itemExistente = carrinho.find(cartItem => cartItem.nome === item.nome);

    if (itemExistente) {
        itemExistente.quantity++;
    } else {
        carrinho.push({ nome: item.nome, quantity: 1 });
    }
    atualizarCarrinhoUI();
}

function atualizarCarrinhoUI() {
    // Atualiza o contador do botão flutuante
    const totalItens = carrinho.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItens;

    if (totalItens > 0) {
        cartButton.classList.remove('hidden');
    } else {
        cartButton.classList.add('hidden');
    }

    // Atualiza os itens no modal
    cartItemsContainer.innerHTML = '';
    if (carrinho.length === 0) {
        cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
    } else {
        carrinho.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <span>${item.quantity}x ${item.nome}</span>
                <span>
                    <button class="remove-one-btn" data-name="${item.nome}">-</button>
                    <button class="add-one-btn" data-name="${item.nome}">+</button>
                </span>
            `;
            cartItemsContainer.appendChild(itemElement);
        });
    }
}

// --- LÓGICA DE MANIPULAÇÃO DO CARRINHO ---

cartItemsContainer.addEventListener('click', (event) => {
    const target = event.target;
    const itemName = target.dataset.name;

    if (!itemName) {
        return; // Sai da função se o clique não foi em um botão com 'data-name'
    }

    const itemIndex = carrinho.findIndex(item => item.nome === itemName);
    if (itemIndex === -1) return;

    if (target.classList.contains('add-one-btn')) {
        carrinho[itemIndex].quantity++;
    } else if (target.classList.contains('remove-one-btn')) {
        carrinho[itemIndex].quantity--;
        if (carrinho[itemIndex].quantity === 0) {
            carrinho.splice(itemIndex, 1); // Remove o item do carrinho se a quantidade for 0
        }
    }
    atualizarCarrinhoUI();
});

// Função para enviar mensagem para o WhatsApp
const sendMessage = () => {
    if (carrinho.length === 0) return; // Não envia se o carrinho estiver vazio

    const message = carrinho
      .map(item => `${item.quantity}x ${item.nome}`)
      .join(', ');
    const fullMessage = `Olá, gostaria de solicitar um orçamento para os seguintes itens: ${message}.`;
    const url = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(fullMessage)}`;
    window.open(url, '_blank');

    // Fecha o modal e limpa o carrinho após enviar o pedido
    cartModal.classList.add('hidden');
    carrinho = [];
    atualizarCarrinhoUI();
};

function fecharModalCarrinho() {
    cartModal.classList.add('hidden');
    // Garante que o overlay do card expandido também seja fechado, se estiver aberto.
    if (!overlay.classList.contains('hidden')) {
        overlay.classList.add('hidden');
    }
}

// Adiciona um ouvinte para carregar os dados e exibir todos os cards quando a página carregar
document.addEventListener('DOMContentLoaded', iniciarBusca);
// Adiciona um ouvinte para filtrar os cards em tempo real, enquanto o usuário digita
campoBusca.addEventListener('input', iniciarBusca);
// Adiciona um ouvinte para o clique no botão de busca (funcionalidade dupla)
botaoBusca.addEventListener('click', iniciarBusca);

// Eventos do Carrinho (Modal)
cartButton.addEventListener('click', () => cartModal.classList.remove('hidden'));
closeCartBtn.addEventListener('click', fecharModalCarrinho); // Usa a nova função para fechar
sendWhatsappBtn.addEventListener('click', sendMessage);

// Adiciona um ouvinte para fechar o card se o usuário clicar no overlay
overlay.addEventListener('click', () => {
    const cardAberto = document.querySelector('.card.expanded');
    if (cardAberto) cardAberto.querySelector('.close-btn').click();
});