// Seleciona os elementos do DOM e inicializa o array de dados
const cardContainer = document.querySelector('.card-container');
const overlay = document.getElementById('overlay');
const campoBusca = document.querySelector('header input');
let dados = [];

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
                <a href="${dado.link}" target="_blank">Ver na Wikipedia</a>
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

// Adiciona um ouvinte para carregar os dados e exibir todos os cards quando a página carregar
document.addEventListener('DOMContentLoaded', iniciarBusca);
// Adiciona um ouvinte para filtrar os cards em tempo real, enquanto o usuário digita
campoBusca.addEventListener('input', iniciarBusca);
// Adiciona um ouvinte para fechar o card se o usuário clicar no overlay
overlay.addEventListener('click', () => {
    const cardAberto = document.querySelector('.card.expanded');
    if (cardAberto) cardAberto.querySelector('.close-btn').click();
});