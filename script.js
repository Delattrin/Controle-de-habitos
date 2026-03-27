// ============================================
//  SELETORES
// ============================================
const listaHabitos   = document.getElementById('habit-list');
const inputHabito    = document.getElementById('habit-name');
const botaoAdicionar = document.getElementById('add-habit');
const streakNum      = document.getElementById('streak-num');
const streakBox      = document.getElementById('streak-box');
const progressoFill  = document.getElementById('progresso-fill');
const progressoTxt   = document.getElementById('progresso-txt');
const vaziMsg        = document.getElementById('vazio-msg');
const toastEl        = document.getElementById('toast');
const dataHojeEl     = document.getElementById('data-hoje');

// ============================================
//  DATA DE HOJE (string no formato YYYY-MM-DD)
// ============================================
function dataHoje() {
    return new Date().toISOString().split('T')[0];
}

// ============================================
//  EXIBE DATA NO HEADER
// ============================================
function exibirData() {
    const agora = new Date();
    const opcoes = { weekday: 'long', day: 'numeric', month: 'long' };
    dataHojeEl.textContent = agora.toLocaleDateString('pt-BR', opcoes);
}

// ============================================
//  TOAST (notificação rápida)
// ============================================
let toastTimeout;
function mostrarToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toastEl.classList.remove('show'), 2000);
}

// ============================================
//  ADICIONAR HÁBITO
// ============================================
function adicionarHabito() {
    const nome = inputHabito.value.trim();
    if (!nome) {
        inputHabito.focus();
        return;
    }

    const item = criarItemLista(nome, false, '', 0);
    listaHabitos.appendChild(item);
    inputHabito.value = '';
    inputHabito.focus();

    salvarHabitos();
    atualizarProgresso();
    atualizarVazio();
    mostrarToast('Hábito adicionado ✓');
}

// ============================================
//  CRIA O <LI> DE UM HÁBITO
// ============================================
function criarItemLista(nome, feito, ultimaData, sequencia) {
    const item = document.createElement('li');
    item.classList.add('habit-item');
    if (feito) item.classList.add('feito');
    item.dataset.ultimaData = ultimaData || '';
    item.dataset.sequencia  = sequencia  || 0;

    // -- Checkbox visual --
    const check = document.createElement('div');
    check.classList.add('check-circle');
    const checkIcon = document.createElement('span');
    checkIcon.classList.add('check-icon');
    checkIcon.textContent = '✓';
    check.appendChild(checkIcon);

    // -- Nome --
    const nomeEl = document.createElement('span');
    nomeEl.classList.add('habit-nome');
    nomeEl.textContent = nome;

    // -- Streak individual --
    const streakBadge = document.createElement('span');
    streakBadge.classList.add('habit-streak');
    atualizarBadgeStreak(streakBadge, Number(sequencia));

    // -- Botão deletar --
    const btnDel = document.createElement('button');
    btnDel.classList.add('btn-deletar');
    btnDel.innerHTML = '✕';
    btnDel.title = 'Remover hábito';
    btnDel.addEventListener('click', (e) => {
        e.stopPropagation(); // não aciona o toggle do hábito
        deletarHabito(item, nome);
    });

    item.append(check, nomeEl, streakBadge, btnDel);

    // -- Clique para marcar/desmarcar --
    item.addEventListener('click', () => {
        item.classList.toggle('feito');

        if (item.classList.contains('feito')) {
            atualizarSequencia(item);
            // animação
            item.classList.remove('animar');
            void item.offsetWidth; // reflow para reiniciar a animação
            item.classList.add('animar');
        } else {
            item.dataset.sequencia = 0;
        }

        atualizarBadgeStreak(streakBadge, Number(item.dataset.sequencia));
        salvarHabitos();
        atualizarStreakGeral();
        atualizarProgresso();
    });

    return item;
}

// ============================================
//  ATUALIZA O BADGE DE STREAK DO HÁBITO
// ============================================
function atualizarBadgeStreak(badge, seq) {
    if (seq >= 2) {
        badge.textContent = `🔥 ${seq} dias`;
        badge.classList.add('visivel');
    } else if (seq === 1) {
        badge.textContent = '🔥 1 dia';
        badge.classList.add('visivel');
    } else {
        badge.classList.remove('visivel');
    }
}

// ============================================
//  DELETAR HÁBITO (com confirmação simples)
// ============================================
function deletarHabito(item, nome) {
    if (!confirm(`Remover "${nome}"?`)) return;
    item.style.transition = 'opacity 0.2s, transform 0.2s';
    item.style.opacity = '0';
    item.style.transform = 'translateX(30px)';
    setTimeout(() => {
        item.remove();
        salvarHabitos();
        atualizarProgresso();
        atualizarVazio();
        mostrarToast('Hábito removido');
    }, 220);
}

// ============================================
//  SEQUÊNCIA POR HÁBITO
// ============================================
function atualizarSequencia(item) {
    const hoje  = dataHoje();
    const ultima = item.dataset.ultimaData;

    if (!ultima) {
        item.dataset.sequencia = 1;
    } else {
        const diff = (new Date(hoje) - new Date(ultima)) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
            item.dataset.sequencia = Number(item.dataset.sequencia) + 1;
        } else if (diff > 1) {
            item.dataset.sequencia = 1; // quebrou a sequência
        }
        // diff === 0 → já marcou hoje, não altera
    }

    item.dataset.ultimaData = hoje;
}

// ============================================
//  STREAK GERAL (foguinho do header)
// ============================================
function atualizarStreakGeral() {
    const hoje  = dataHoje();
    const ultima = localStorage.getItem('ultimaDataGeral');
    let streak   = Number(localStorage.getItem('streakGeral')) || 0;

    if (!ultima) {
        streak = 1;
    } else if (ultima === hoje) {
        // já contou hoje — não incrementa
    } else {
        // verifica se foi ontem
        const diffDias = (new Date(hoje) - new Date(ultima)) / (1000 * 60 * 60 * 24);
        if (diffDias === 1) streak++;
        else streak = 1; // quebrou a sequência
    }

    localStorage.setItem('ultimaDataGeral', hoje);
    localStorage.setItem('streakGeral', streak);

    streakNum.textContent = streak;

    // animação no badge
    streakBox.classList.remove('bump');
    void streakBox.offsetWidth;
    streakBox.classList.add('bump');
}

// ============================================
//  BARRA DE PROGRESSO
// ============================================
function atualizarProgresso() {
    const itens  = listaHabitos.querySelectorAll('.habit-item');
    const feitos = listaHabitos.querySelectorAll('.habit-item.feito');
    const total  = itens.length;
    const done   = feitos.length;
    const pct    = total === 0 ? 0 : Math.round((done / total) * 100);

    progressoFill.style.width = pct + '%';
    progressoTxt.textContent  = `${done} / ${total}`;

    // foguinho pulsa ao completar tudo
    const foguinho = document.getElementById('foguinho');
    if (total > 0 && done === total) {
        foguinho.style.animationDuration = '0.6s';
        mostrarToast('Todos os hábitos concluídos! 🔥');
    } else {
        foguinho.style.animationDuration = '1.8s';
    }
}

// ============================================
//  MENSAGEM LISTA VAZIA
// ============================================
function atualizarVazio() {
    const itens = listaHabitos.querySelectorAll('.habit-item');
    vaziMsg.classList.toggle('visivel', itens.length === 0);
}

// ============================================
//  SALVAR NO LOCALSTORAGE
// ============================================
function salvarHabitos() {
    const habitos = [];
    listaHabitos.querySelectorAll('.habit-item').forEach(item => {
        habitos.push({
            nome:       item.querySelector('.habit-nome').textContent,
            feito:      item.classList.contains('feito'),
            ultimaData: item.dataset.ultimaData,
            sequencia:  item.dataset.sequencia
        });
    });
    localStorage.setItem('habitos', JSON.stringify(habitos));
}

// ============================================
//  CARREGAR DO LOCALSTORAGE
// ============================================
function carregarHabitos() {
    const habitos = JSON.parse(localStorage.getItem('habitos')) || [];
    habitos.forEach(h => {
        const item = criarItemLista(h.nome, h.feito, h.ultimaData, h.sequencia);
        listaHabitos.appendChild(item);
    });
    carregarStreakGeral();
    atualizarProgresso();
    atualizarVazio();
}

function carregarStreakGeral() {
    streakNum.textContent = localStorage.getItem('streakGeral') || 0;
}

// ============================================
//  RESET DIÁRIO (hábitos voltam para não feitos
//  quando é um novo dia)
// ============================================
function verificarResetDiario() {
    const hoje   = dataHoje();
    const ultimo = localStorage.getItem('ultimoDiaReset');
    if (ultimo && ultimo !== hoje) {
        // Novo dia: desmarca todos os hábitos
        const habitos = JSON.parse(localStorage.getItem('habitos')) || [];
        habitos.forEach(h => { h.feito = false; });
        localStorage.setItem('habitos', JSON.stringify(habitos));
    }
    localStorage.setItem('ultimoDiaReset', hoje);
}

// ============================================
//  EVENTOS
// ============================================
botaoAdicionar.addEventListener('click', adicionarHabito);

// Enter no input adiciona o hábito
inputHabito.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') adicionarHabito();
});

// ============================================
//  INICIALIZAÇÃO
// ============================================
exibirData();
verificarResetDiario();
carregarHabitos();