// Pegando elementos do HTML
let listaHabitos = document.getElementById('habit-list');
let inputHabito = document.getElementById('habit-name');
let botaoAdicionar = document.getElementById('add-habit');

// Função para adicionar um novo hábito
function adicionarHabito() {
    let nomeHabito = inputHabito.value.trim();
    if(nomeHabito){
        let itemLista = document.createElement('li');
        itemLista.textContent = nomeHabito;

        // Quando clicar no hábito, marca/desmarca como concluído
        itemLista.addEventListener('click', () => {
            itemLista.classList.toggle('feito');
            salvarHabitos();
        });

        listaHabitos.appendChild(itemLista);
        inputHabito.value = '';

        // Salva o hábito no localStorage
        salvarHabitos();
    }
}

// Função para carregar hábitos salvos
function carregarHabitos() {
    let habitos = JSON.parse(localStorage.getItem('habitos')) || [];
    habitos.forEach(habito => {
        let itemLista = document.createElement('li');
        itemLista.textContent = habito.nome;
        if(habito.feito){
            itemLista.classList.add('feito');
        }

        itemLista.addEventListener('click', () => {
            itemLista.classList.toggle('feito');
            salvarHabitos();
        });

        listaHabitos.appendChild(itemLista);
    });
}

// Função para salvar hábitos no localStorage
function salvarHabitos() {
    let habitos = [];
    listaHabitos.querySelectorAll('li').forEach(item => {
        habitos.push({nome: item.textContent, feito: item.classList.contains('feito')});
    });
    localStorage.setItem('habitos', JSON.stringify(habitos));
}

// Carrega os hábitos assim que a página abre
carregarHabitos();

// Adiciona evento de clique no botão
botaoAdicionar.addEventListener('click', adicionarHabito);
