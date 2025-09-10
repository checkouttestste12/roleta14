// ===== ROLETA PROFISSIONAL ONLINE - SISTEMA REALISTA DE CASSINO =====

// Estados da roleta profissional
const ESTADOS_ROLETA = {
    IDLE: 'idle',
    SPINNING: 'spinning',
    SLOWING_DOWN: 'slowing_down',
    FINAL_APPROACH: 'final_approach',
    STOPPED: 'stopped'
};

// Estado do jogo com física realista de cassino
let gameState = {
    estadoRoleta: ESTADOS_ROLETA.IDLE,
    girosRestantes: 3,
    saldoAtual: 0,
    tempoInicioGiro: null,
    tempoMinimoGiro: 2000,
    animationId: null,
    anguloAtual: 0,
    velocidadeAtual: 0,
    anguloFinal: 0,
    premioSorteado: null,
    autoStopTimeout: null,
    
    // Física realista de cassino profissional
    fisica: {
        // Parâmetros calibrados como cassinos reais
        velocidadeInicial: 15,
        velocidadeAtual: 0,
        anguloAtual: 0,
        
        // Desaceleração linear constante (como roletas físicas)
        desaceleracao: {
            ativa: false,
            fatorConstante: 0.98,  // Desaceleração exponencial suave
            tempoInicio: 0,
            duracaoTotal: 4500,    // 4.5 segundos para parar
            velocidadeFinal: 0.1
        },
        
        // Aproximação final precisa
        aproximacaoFinal: {
            ativa: false,
            anguloInicial: 0,
            anguloAlvo: 0,
            tempoInicio: 0,
            duracao: 1500,
            finalizada: false
        }
    },
    
    // Efeitos visuais sutis e profissionais
    efeitosVisuais: {
        intensidadeAtual: 0,
        intensidadeMaxima: 1,
        transicaoSuave: true
    }
};

// Elementos DOM
const elements = {
    btnGirar: null,
    btnParar: null,
    roleta: null,
    toastContainer: null,
    resultadoModal: null,
    btnContinuar: null,
    premioValor: null,
    novoSaldo: null,
    girosCount: null,
    saldoAtual: null
};

// Configuração de prêmios (distribuição realista)
const premiosPossiveis = [
    { valor: 0, texto: 'Tente novamente!', peso: 45, cor: 'cinza' },
    { valor: 25, texto: 'R$ 25,00', peso: 30, cor: 'dourado' },
    { valor: 50, texto: 'R$ 50,00', peso: 18, cor: 'vermelho' },
    { valor: 100, texto: 'R$ 100,00', peso: 7, cor: 'azul' }
];

// Setores da roleta (8 setores de 45° cada)
const setoresRoleta = [
    { inicio: 0, fim: 45, premio: premiosPossiveis[1] },      // Dourado
    { inicio: 45, fim: 90, premio: premiosPossiveis[0] },     // Cinza
    { inicio: 90, fim: 135, premio: premiosPossiveis[2] },    // Vermelho
    { inicio: 135, fim: 180, premio: premiosPossiveis[0] },   // Cinza
    { inicio: 180, fim: 225, premio: premiosPossiveis[3] },   // Azul
    { inicio: 225, fim: 270, premio: premiosPossiveis[0] },   // Cinza
    { inicio: 270, fim: 315, premio: premiosPossiveis[1] },   // Dourado
    { inicio: 315, fim: 360, premio: premiosPossiveis[0] }    // Cinza
];

// ===== SISTEMA DE FÍSICA REALISTA DE CASSINO =====

// Função de desaceleração exponencial suave (como roletas reais)
function calcularDesaceleracaoRealista(tempoDecorrido, duracaoTotal) {
    const progresso = Math.min(tempoDecorrido / duracaoTotal, 1);
    
    // Curva exponencial suave que imita roletas físicas
    const fatorExponencial = Math.pow(0.02, progresso);
    
    // Adiciona uma pequena curva no final para suavidade
    const ajusteFinal = progresso > 0.85 ? Math.pow(1 - progresso, 2) : 1;
    
    return fatorExponencial * ajusteFinal;
}

// Função de easing suave para aproximação final
function easingApproximacaoFinal(t) {
    // Curva cúbica suave para o posicionamento final
    return t * t * (3 - 2 * t);
}

// Sistema principal de física
function atualizarFisicaRealista(deltaTime) {
    const fisica = gameState.fisica;
    
    if (gameState.estadoRoleta === ESTADOS_ROLETA.SPINNING) {
        // Rotação constante durante o giro inicial
        gameState.anguloAtual += fisica.velocidadeAtual * deltaTime * 60;
        
    } else if (gameState.estadoRoleta === ESTADOS_ROLETA.SLOWING_DOWN) {
        // Desaceleração realista e constante
        const tempoDecorrido = Date.now() - fisica.desaceleracao.tempoInicio;
        const fatorDesaceleracao = calcularDesaceleracaoRealista(
            tempoDecorrido, 
            fisica.desaceleracao.duracaoTotal
        );
        
        fisica.velocidadeAtual = fisica.velocidadeInicial * fatorDesaceleracao;
        gameState.anguloAtual += fisica.velocidadeAtual * deltaTime * 60;
        
        // Verificar se deve iniciar aproximação final
        if (fisica.velocidadeAtual <= fisica.desaceleracao.velocidadeFinal) {
            iniciarAproximacaoFinal();
        }
        
    } else if (gameState.estadoRoleta === ESTADOS_ROLETA.FINAL_APPROACH) {
        // Aproximação final precisa ao resultado
        processarAproximacaoFinal();
    }
}

// Iniciar aproximação final
function iniciarAproximacaoFinal() {
    console.log('🎯 Iniciando aproximação final profissional');
    
    gameState.estadoRoleta = ESTADOS_ROLETA.FINAL_APPROACH;
    const aproximacao = gameState.fisica.aproximacaoFinal;
    
    aproximacao.ativa = true;
    aproximacao.anguloInicial = gameState.anguloAtual;
    aproximacao.anguloAlvo = gameState.anguloFinal;
    aproximacao.tempoInicio = Date.now();
    aproximacao.finalizada = false;
    
    // Calcular o caminho mais curto para o alvo
    let distancia = aproximacao.anguloAlvo - aproximacao.anguloInicial;
    while (distancia > 180) distancia -= 360;
    while (distancia < -180) distancia += 360;
    
    aproximacao.anguloAlvo = aproximacao.anguloInicial + distancia;
    
    console.log(`📐 Aproximação: ${aproximacao.anguloInicial.toFixed(1)}° → ${aproximacao.anguloAlvo.toFixed(1)}°`);
    
    // Atualizar interface
    mostrarToast('🎯 Finalizando posicionamento...', 'info');
}

// Processar aproximação final
function processarAproximacaoFinal() {
    const aproximacao = gameState.fisica.aproximacaoFinal;
    
    if (aproximacao.finalizada) return;
    
    const tempoDecorrido = Date.now() - aproximacao.tempoInicio;
    const progresso = Math.min(tempoDecorrido / aproximacao.duracao, 1);
    
    if (progresso >= 1) {
        // Aproximação concluída
        gameState.anguloAtual = aproximacao.anguloAlvo;
        aproximacao.ativa = false;
        aproximacao.finalizada = true;
        finalizarGiro();
        return;
    }
    
    // Aplicar movimento suave até o alvo
    const easingValue = easingApproximacaoFinal(progresso);
    const distanciaTotal = aproximacao.anguloAlvo - aproximacao.anguloInicial;
    
    gameState.anguloAtual = aproximacao.anguloInicial + (distanciaTotal * easingValue);
    
    // Atualizar velocidade visual para efeitos
    gameState.velocidadeAtual = (1 - easingValue) * 2;
}

// ===== SISTEMA DE ANIMAÇÃO PROFISSIONAL =====

let ultimoTempo = 0;

function iniciarAnimacaoProfissional() {
    console.log('🎰 Iniciando animação profissional de cassino');
    
    ultimoTempo = performance.now();
    
    function loop(tempoAtual) {
        if (gameState.estadoRoleta === ESTADOS_ROLETA.STOPPED) {
            return;
        }
        
        const deltaTime = Math.min((tempoAtual - ultimoTempo) / 1000, 1/30);
        ultimoTempo = tempoAtual;
        
        // Atualizar física
        atualizarFisicaRealista(deltaTime);
        
        // Aplicar rotação
        aplicarRotacao();
        
        // Atualizar efeitos visuais
        atualizarEfeitosVisuais();
        
        gameState.animationId = requestAnimationFrame(loop);
    }
    
    gameState.animationId = requestAnimationFrame(loop);
}

// Aplicar rotação com suavidade
function aplicarRotacao() {
    if (!elements.roleta) return;
    
    // Usar transform3d para máxima performance
    elements.roleta.style.transform = `translate3d(0, 0, 0) rotate(${gameState.anguloAtual}deg)`;
}

// Atualizar efeitos visuais sutis
function atualizarEfeitosVisuais() {
    if (!elements.roleta) return;
    
    const velocidadeNormalizada = Math.min(
        gameState.velocidadeAtual / gameState.fisica.velocidadeInicial, 1
    );
    
    // Efeitos sutis baseados na velocidade
    const brilho = 1 + velocidadeNormalizada * 0.1;
    const saturacao = 1 + velocidadeNormalizada * 0.15;
    const blur = velocidadeNormalizada * 0.8;
    
    elements.roleta.style.filter = `brightness(${brilho}) saturate(${saturacao}) blur(${blur}px)`;
    
    // Sombra sutil durante rotação rápida
    if (velocidadeNormalizada > 0.3) {
        const intensidadeSombra = velocidadeNormalizada * 8;
        elements.roleta.style.boxShadow = `0 0 ${intensidadeSombra}px rgba(255, 215, 0, 0.3)`;
    } else {
        elements.roleta.style.boxShadow = 'none';
    }
}

// ===== FUNÇÕES PRINCIPAIS =====

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎰 Sistema de Roleta Profissional Iniciando...');
    inicializarElementos();
    inicializarEventListeners();
    atualizarInterface();
    console.log('✅ Sistema profissional inicializado!');
});

// Inicializar elementos DOM
function inicializarElementos() {
    elements.btnGirar = document.getElementById('btn-girar');
    elements.btnParar = document.getElementById('btn-parar');
    elements.roleta = document.getElementById('roleta');
    elements.toastContainer = document.getElementById('toast-container');
    elements.resultadoModal = document.getElementById('resultado-modal');
    elements.btnContinuar = document.getElementById('btn-continuar');
    elements.premioValor = document.getElementById('premio-valor');
    elements.novoSaldo = document.getElementById('novo-saldo');
    elements.girosCount = document.getElementById('giros-count');
    elements.saldoAtual = document.getElementById('saldo-atual');
    
    console.log('✅ Elementos DOM carregados');
}

// Event listeners
function inicializarEventListeners() {
    if (elements.btnGirar) {
        elements.btnGirar.addEventListener('click', iniciarGiro);
    }
    
    if (elements.btnParar) {
        elements.btnParar.addEventListener('click', pararGiro);
    }
    
    if (elements.btnContinuar) {
        elements.btnContinuar.addEventListener('click', fecharModal);
    }
    
    if (elements.resultadoModal) {
        elements.resultadoModal.addEventListener('click', function(e) {
            if (e.target === elements.resultadoModal) {
                fecharModal();
            }
        });
    }
}

// Iniciar giro
function iniciarGiro() {
    if (gameState.estadoRoleta !== ESTADOS_ROLETA.IDLE || gameState.girosRestantes <= 0) {
        return;
    }
    
    console.log('🎲 Iniciando giro profissional...');
    
    // Sortear resultado
    gameState.premioSorteado = sortearPremio();
    gameState.anguloFinal = calcularAnguloFinal(gameState.premioSorteado);
    
    // Configurar estado inicial
    gameState.estadoRoleta = ESTADOS_ROLETA.SPINNING;
    gameState.girosRestantes--;
    gameState.tempoInicioGiro = Date.now();
    gameState.anguloAtual = 0;
    gameState.velocidadeAtual = gameState.fisica.velocidadeInicial;
    
    // Resetar física
    const fisica = gameState.fisica;
    fisica.velocidadeAtual = fisica.velocidadeInicial;
    fisica.desaceleracao.ativa = false;
    fisica.aproximacaoFinal.ativa = false;
    fisica.aproximacaoFinal.finalizada = false;
    
    console.log(`🎯 Resultado: ${gameState.premioSorteado.texto} (${gameState.anguloFinal.toFixed(1)}°)`);
    
    // Atualizar interface
    atualizarInterfaceGiro();
    
    // Iniciar animação
    iniciarAnimacaoProfissional();
    
    // Configurar timeouts
    setTimeout(() => {
        habilitarBotaoParar();
    }, gameState.tempoMinimoGiro);
    
    // Auto-stop após 12 segundos
    gameState.autoStopTimeout = setTimeout(() => {
        if (gameState.estadoRoleta === ESTADOS_ROLETA.SPINNING) {
            pararGiro();
        }
    }, 12000);
}

// Parar giro
function pararGiro() {
    if (gameState.estadoRoleta !== ESTADOS_ROLETA.SPINNING) {
        return;
    }
    
    console.log('⏸️ Iniciando parada profissional...');
    
    // Cancelar auto-stop
    if (gameState.autoStopTimeout) {
        clearTimeout(gameState.autoStopTimeout);
        gameState.autoStopTimeout = null;
    }
    
    // Iniciar desaceleração
    gameState.estadoRoleta = ESTADOS_ROLETA.SLOWING_DOWN;
    gameState.fisica.desaceleracao.ativa = true;
    gameState.fisica.desaceleracao.tempoInicio = Date.now();
    
    // Atualizar interface
    atualizarInterfaceParada();
    
    mostrarToast('⏳ Desacelerando suavemente...', 'warning');
}

// Finalizar giro
function finalizarGiro() {
    console.log('🏁 Finalizando giro...');
    
    gameState.estadoRoleta = ESTADOS_ROLETA.STOPPED;
    gameState.velocidadeAtual = 0;
    
    // Parar animação
    if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
        gameState.animationId = null;
    }
    
    // Limpar efeitos visuais suavemente
    setTimeout(() => {
        if (elements.roleta) {
            elements.roleta.style.transition = 'filter 0.8s ease, box-shadow 0.8s ease';
            elements.roleta.style.filter = 'brightness(1) saturate(1) blur(0px)';
            elements.roleta.style.boxShadow = 'none';
        }
    }, 200);
    
    // Calcular e mostrar resultado
    const premio = calcularPremio(gameState.anguloAtual);
    gameState.saldoAtual += premio.valor;
    
    setTimeout(() => {
        resetarInterface();
        mostrarResultado(premio);
    }, 600);
}

// ===== FUNÇÕES AUXILIARES =====

function sortearPremio() {
    const totalPeso = premiosPossiveis.reduce((total, premio) => total + premio.peso, 0);
    const random = Math.random() * totalPeso;
    
    let acumulado = 0;
    for (let premio of premiosPossiveis) {
        acumulado += premio.peso;
        if (random <= acumulado) {
            return premio;
        }
    }
    
    return premiosPossiveis[0];
}

function calcularAnguloFinal(premio) {
    // Encontrar setores válidos para o prêmio
    const setoresValidos = setoresRoleta.filter(setor => 
        setor.premio.valor === premio.valor
    );
    
    // Escolher setor aleatório
    const setorEscolhido = setoresValidos[Math.floor(Math.random() * setoresValidos.length)];
    
    // Calcular ângulo no centro do setor com pequena variação
    const centroSetor = setorEscolhido.inicio + (setorEscolhido.fim - setorEscolhido.inicio) / 2;
    const variacao = (Math.random() - 0.5) * 15; // Variação de ±7.5°
    const anguloNoSetor = Math.max(
        setorEscolhido.inicio + 3, 
        Math.min(setorEscolhido.fim - 3, centroSetor + variacao)
    );
    
    // Adicionar voltas completas (3-5 voltas)
    const voltasCompletas = 3 + Math.random() * 2;
    
    return (voltasCompletas * 360) + anguloNoSetor;
}

function calcularPremio(anguloFinal) {
    const anguloNormalizado = anguloFinal % 360;
    
    for (let setor of setoresRoleta) {
        if (anguloNormalizado >= setor.inicio && anguloNormalizado < setor.fim) {
            return setor.premio;
        }
    }
    
    return setoresRoleta[0].premio;
}

// ===== INTERFACE =====

function atualizarInterfaceGiro() {
    if (elements.btnGirar && elements.btnParar) {
        elements.btnGirar.classList.add('hidden');
        elements.btnParar.classList.remove('hidden');
        elements.btnParar.disabled = true;
        elements.btnParar.innerHTML = '<i class="fas fa-clock"></i> AGUARDE...';
    }
    
    mostrarToast('🎰 Roleta girando...', 'info');
}

function habilitarBotaoParar() {
    if (elements.btnParar && gameState.estadoRoleta === ESTADOS_ROLETA.SPINNING) {
        elements.btnParar.disabled = false;
        elements.btnParar.innerHTML = '<i class="fas fa-stop"></i> PARAR';
        mostrarToast('✋ Você pode parar a roleta agora!', 'success');
    }
}

function atualizarInterfaceParada() {
    if (elements.btnParar) {
        elements.btnParar.disabled = true;
        elements.btnParar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PARANDO...';
    }
}

function resetarInterface() {
    if (elements.btnGirar && elements.btnParar) {
        elements.btnGirar.classList.remove('hidden');
        elements.btnParar.classList.add('hidden');
        elements.btnParar.disabled = false;
        elements.btnParar.innerHTML = '<i class="fas fa-stop"></i> PARAR';
    }
    
    gameState.estadoRoleta = ESTADOS_ROLETA.IDLE;
}

function mostrarResultado(premio) {
    if (elements.premioValor) {
        elements.premioValor.textContent = premio.texto;
        elements.premioValor.style.color = premio.valor > 0 ? '#00d4aa' : '#ff6b6b';
    }
    
    if (elements.novoSaldo) {
        elements.novoSaldo.textContent = `R$ ${gameState.saldoAtual.toFixed(2)}`;
    }
    
    if (elements.resultadoModal) {
        elements.resultadoModal.style.display = 'flex';
        setTimeout(() => {
            elements.resultadoModal.classList.add('show');
        }, 50);
    }
    
    atualizarInterface();
    
    if (premio.valor > 0) {
        mostrarToast(`🎉 Parabéns! Você ganhou ${premio.texto}!`, 'success');
        criarConfetes();
        
        // Vibração de sucesso
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100, 50, 150]);
        }
    } else {
        mostrarToast('😔 Que pena! Tente novamente!', 'error');
    }
}

function fecharModal() {
    if (elements.resultadoModal) {
        elements.resultadoModal.classList.remove('show');
        setTimeout(() => {
            elements.resultadoModal.style.display = 'none';
        }, 300);
    }
}

function atualizarInterface() {
    if (elements.girosCount) {
        elements.girosCount.textContent = gameState.girosRestantes;
    }
    
    if (elements.saldoAtual) {
        elements.saldoAtual.textContent = gameState.saldoAtual.toFixed(2);
    }
    
    if (elements.btnGirar) {
        if (gameState.girosRestantes <= 0) {
            elements.btnGirar.disabled = true;
            elements.btnGirar.innerHTML = '<i class="fas fa-times"></i> SEM GIROS';
            elements.btnGirar.style.opacity = '0.6';
        } else {
            elements.btnGirar.disabled = false;
            elements.btnGirar.innerHTML = '<i class="fas fa-play"></i> GIRAR';
            elements.btnGirar.style.opacity = '1';
        }
    }
}

function mostrarToast(mensagem, tipo = 'info') {
    if (!elements.toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span>${mensagem}</span>
            <button class="toast-close">&times;</button>
        </div>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    
    const timer = setTimeout(() => {
        removerToast(toast);
    }, 4000);
    
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            clearTimeout(timer);
            removerToast(toast);
        });
    }
}

function removerToast(toast) {
    if (toast.parentNode) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
}

function criarConfetes() {
    const container = document.body;
    
    for (let i = 0; i < 50; i++) {
        const confete = document.createElement('div');
        confete.className = 'confetti';
        confete.style.position = 'fixed';
        confete.style.left = Math.random() * 100 + '%';
        confete.style.top = '-10px';
        confete.style.zIndex = '9999';
        confete.style.pointerEvents = 'none';
        
        // Cores do prêmio
        const cores = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#ff9ff3', '#54a0ff'];
        confete.style.backgroundColor = cores[Math.floor(Math.random() * cores.length)];
        
        // Tamanho e forma
        const tamanho = 4 + Math.random() * 6;
        confete.style.width = tamanho + 'px';
        confete.style.height = tamanho + 'px';
        confete.style.borderRadius = '2px';
        
        // Animação
        confete.style.animation = `confettiFall ${2.5 + Math.random() * 1.5}s linear forwards`;
        confete.style.animationDelay = Math.random() * 2 + 's';
        
        container.appendChild(confete);
        
        setTimeout(() => {
            if (confete.parentNode) {
                confete.parentNode.removeChild(confete);
            }
        }, 5000);
    }
}

// ===== ESTILOS CSS PROFISSIONAIS =====

const estilosProfissionais = document.createElement('style');
estilosProfissionais.textContent = `
    /* Otimizações de performance */
    .roleta {
        will-change: transform;
        backface-visibility: hidden;
        transform-style: preserve-3d;
        transition: none;
    }
    
    /* Animação de confetes */
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotateZ(720deg);
            opacity: 0;
        }
    }
    
    /* Sistema de toast profissional */
    .toast {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border-radius: 12px;
        padding: 1rem 1.5rem;
        margin-bottom: 0.8rem;
        border-left: 4px solid;
        transform: translateX(100%);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        max-width: 400px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
    
    .toast.show {
        transform: translateX(0);
    }
    
    .toast-info { border-left-color: #3498db; }
    .toast-success { border-left-color: #00d4aa; }
    .toast-warning { border-left-color: #f39c12; }
    .toast-error { border-left-color: #e74c3c; }
    
    .toast-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        font-size: 0.9rem;
        font-weight: 500;
    }
    
    .toast-close {
        background: none;
        border: none;
        color: #ffffff;
        font-size: 1.1rem;
        cursor: pointer;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
    }
    
    .toast-close:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }
    
    /* Botões com estados suaves */
    .btn {
        transition: all 0.2s ease;
        position: relative;
        overflow: hidden;
    }
    
    .btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .btn:active {
        transform: translateY(0);
    }
    
    .btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
    }
    
    /* Modal suave */
    .modal {
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
        opacity: 0;
    }
    
    .modal.show {
        opacity: 1;
    }
    
    .modal-content {
        transform: scale(0.95);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .modal.show .modal-content {
        transform: scale(1);
    }
    
    /* Classe utilitária */
    .hidden {
        display: none !important;
    }
    
    /* Aceleração GPU */
    .roleta,
    .btn,
    .toast,
    .modal-content {
        transform: translateZ(0);
    }
`;

document.head.appendChild(estilosProfissionais);

console.log('🎰 Sistema de Roleta Profissional carregado com sucesso!');

// ===== SISTEMA DE DEBUGGING E MONITORAMENTO =====

// Função para debug (pode ser removida em produção)
function logEstadoFisica() {
    if (gameState.estadoRoleta !== ESTADOS_ROLETA.IDLE) {
        console.log(`Estado: ${gameState.estadoRoleta} | Velocidade: ${gameState.velocidadeAtual.toFixed(2)} | Ângulo: ${gameState.anguloAtual.toFixed(1)}°`);
    }
}

// Monitoramento opcional de performance
let debugMode = false; // Definir como true para ativar debug

if (debugMode) {
    setInterval(logEstadoFisica, 1000);
}

// ===== PREVENÇÃO DE ERROS E FALLBACKS =====

// Fallback para requestAnimationFrame
window.requestAnimationFrame = window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame || 
    window.mozRequestAnimationFrame || 
    function(callback) { return setTimeout(callback, 16); };

window.cancelAnimationFrame = window.cancelAnimationFrame || 
    window.webkitCancelAnimationFrame || 
    window.mozCancelAnimationFrame || 
    function(id) { clearTimeout(id); };

// Verificação de compatibilidade de CSS
function verificarCompatibilidade() {
    const testElement = document.createElement('div');
    const supportsBackdropFilter = 'backdropFilter' in testElement.style || 
                                   'webkitBackdropFilter' in testElement.style;
    
    if (!supportsBackdropFilter) {
        console.warn('⚠️ Backdrop filter não suportado. Usando fallback.');
        // Adicionar fallback para navegadores antigos
        const fallbackStyle = document.createElement('style');
        fallbackStyle.textContent = `
            .toast {
                background: rgba(0, 0, 0, 0.8) !important;
                backdrop-filter: none !important;
            }
            .modal {
                background: rgba(0, 0, 0, 0.7) !important;
                backdrop-filter: none !important;
            }
        `;
        document.head.appendChild(fallbackStyle);
    }
}

// Executar verificação de compatibilidade
verificarCompatibilidade();

// ===== SISTEMA DE PERSISTÊNCIA LOCAL (OPCIONAL) =====

// Salvar estado do jogo
function salvarEstado() {
    try {
        const estado = {
            girosRestantes: gameState.girosRestantes,
            saldoAtual: gameState.saldoAtual,
            timestamp: Date.now()
        };
        // Nota: localStorage não funciona no ambiente Claude.ai
        // Em um ambiente real, descomente a linha abaixo:
        // localStorage.setItem('roletaGameState', JSON.stringify(estado));
        console.log('💾 Estado salvo:', estado);
    } catch (error) {
        console.warn('⚠️ Não foi possível salvar o estado:', error.message);
    }
}

// Carregar estado do jogo
function carregarEstado() {
    try {
        // Nota: localStorage não funciona no ambiente Claude.ai
        // Em um ambiente real, descomente as linhas abaixo:
        /*
        const estadoSalvo = localStorage.getItem('roletaGameState');
        if (estadoSalvo) {
            const estado = JSON.parse(estadoSalvo);
            const tempoDecorrido = Date.now() - estado.timestamp;
            
            // Se foi salvo há menos de 24 horas, restaurar
            if (tempoDecorrido < 24 * 60 * 60 * 1000) {
                gameState.girosRestantes = estado.girosRestantes;
                gameState.saldoAtual = estado.saldoAtual;
                console.log('📂 Estado carregado:', estado);
                atualizarInterface();
            }
        }
        */
    } catch (error) {
        console.warn('⚠️ Não foi possível carregar o estado:', error.message);
    }
}

// Salvar estado automaticamente quando necessário
function configurarAutoSave() {
    // Salvar ao ganhar prêmio
    const originalMostrarResultado = mostrarResultado;
    mostrarResultado = function(premio) {
        originalMostrarResultado(premio);
        salvarEstado();
    };
    
    // Salvar ao usar giro
    const originalIniciarGiro = iniciarGiro;
    iniciarGiro = function() {
        originalIniciarGiro();
        if (gameState.estadoRoleta === ESTADOS_ROLETA.SPINNING) {
            salvarEstado();
        }
    };
}

// Ativar auto-save (desabilitado por padrão no Claude.ai)
// configurarAutoSave();

// ===== SISTEMA DE EVENTOS PERSONALIZADOS =====

// Eventos customizados para integração externa
function dispararEvento(tipo, dados = {}) {
    const evento = new CustomEvent(`roleta:${tipo}`, {
        detail: {
            ...dados,
            timestamp: Date.now(),
            gameState: {
                estadoRoleta: gameState.estadoRoleta,
                girosRestantes: gameState.girosRestantes,
                saldoAtual: gameState.saldoAtual
            }
        }
    });
    
    document.dispatchEvent(evento);
}

// Integrar eventos no sistema existente
const originalFinalizarGiro = finalizarGiro;
finalizarGiro = function() {
    const premio = calcularPremio(gameState.anguloAtual);
    dispararEvento('giroFinalizado', { premio });
    originalFinalizarGiro();
};

// Exemplo de como escutar os eventos:
/*
document.addEventListener('roleta:giroFinalizado', (event) => {
    console.log('Evento de giro finalizado:', event.detail);
    // Aqui você pode integrar com sistemas externos
});
*/

// ===== OTIMIZAÇÕES DE PERFORMANCE AVANÇADAS =====

// Pool de objetos para reutilização (evita garbage collection)
const objetoPool = {
    elementos: [],
    obter() {
        return this.elementos.pop() || document.createElement('div');
    },
    retornar(elemento) {
        if (elemento && this.elementos.length < 50) { // Limite do pool
            elemento.className = '';
            elemento.style.cssText = '';
            elemento.innerHTML = '';
            this.elementos.push(elemento);
        }
    }
};

// Função otimizada para criação de confetes
function criarConfetesOtimizado() {
    const container = document.body;
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < 50; i++) {
        const confete = objetoPool.obter();
        confete.className = 'confetti';
        
        // Aplicar estilos de uma vez
        confete.style.cssText = `
            position: fixed;
            left: ${Math.random() * 100}%;
            top: -10px;
            z-index: 9999;
            pointer-events: none;
            background-color: ${['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#ff9ff3', '#54a0ff'][Math.floor(Math.random() * 6)]};
            width: ${4 + Math.random() * 6}px;
            height: ${4 + Math.random() * 6}px;
            border-radius: 2px;
            animation: confettiFall ${2.5 + Math.random() * 1.5}s linear forwards;
            animation-delay: ${Math.random() * 2}s;
        `;
        
        fragment.appendChild(confete);
        
        // Cleanup otimizado
        setTimeout(() => {
            if (confete.parentNode) {
                confete.parentNode.removeChild(confete);
                objetoPool.retornar(confete);
            }
        }, 5000);
    }
    
    container.appendChild(fragment);
}

// Substituir função original por versão otimizada
criarConfetes = criarConfetesOtimizado;

// ===== SISTEMA DE VALIDAÇÃO E INTEGRIDADE =====

// Validar integridade do jogo
function validarIntegridade() {
    const problemas = [];
    
    // Verificar elementos essenciais
    if (!elements.roleta) problemas.push('Elemento roleta não encontrado');
    if (!elements.btnGirar) problemas.push('Botão girar não encontrado');
    if (!elements.btnParar) problemas.push('Botão parar não encontrado');
    
    // Verificar estado do jogo
    if (gameState.girosRestantes < 0) problemas.push('Giros restantes inválidos');
    if (gameState.saldoAtual < 0) problemas.push('Saldo inválido');
    
    // Verificar configuração de prêmios
    const totalPeso = premiosPossiveis.reduce((total, premio) => total + premio.peso, 0);
    if (totalPeso !== 100) problemas.push('Pesos dos prêmios não somam 100%');
    
    if (problemas.length > 0) {
        console.error('❌ Problemas de integridade encontrados:', problemas);
        return false;
    }
    
    return true;
}

// Executar validação inicial
setTimeout(() => {
    if (validarIntegridade()) {
        console.log('✅ Validação de integridade concluída com sucesso');
    }
}, 1000);

// ===== SISTEMA DE RECUPERAÇÃO DE ERROS =====

// Handler global de erros
window.addEventListener('error', function(event) {
    console.error('🚨 Erro capturado:', event.error);
    
    // Tentar recuperar o estado do jogo
    if (gameState.estadoRoleta !== ESTADOS_ROLETA.IDLE && 
        gameState.estadoRoleta !== ESTADOS_ROLETA.STOPPED) {
        
        console.log('🔄 Tentando recuperar estado do jogo...');
        
        // Parar animações
        if (gameState.animationId) {
            cancelAnimationFrame(gameState.animationId);
            gameState.animationId = null;
        }
        
        // Resetar para estado seguro
        gameState.estadoRoleta = ESTADOS_ROLETA.IDLE;
        gameState.velocidadeAtual = 0;
        
        // Resetar interface
        resetarInterface();
        
        mostrarToast('⚠️ Estado do jogo recuperado após erro', 'warning');
    }
});

// ===== MELHORIAS DE ACESSIBILIDADE =====

// Adicionar suporte a teclado
document.addEventListener('keydown', function(event) {
    // Barra de espaço ou Enter para girar/parar
    if (event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault();
        
        if (gameState.estadoRoleta === ESTADOS_ROLETA.IDLE && 
            gameState.girosRestantes > 0 && 
            !elements.btnGirar.disabled) {
            iniciarGiro();
        } else if (gameState.estadoRoleta === ESTADOS_ROLETA.SPINNING && 
                   !elements.btnParar.disabled) {
            pararGiro();
        }
    }
    
    // ESC para fechar modal
    if (event.code === 'Escape' && 
        elements.resultadoModal && 
        elements.resultadoModal.classList.contains('show')) {
        fecharModal();
    }
});

// Adicionar atributos ARIA
function melhorarAcessibilidade() {
    if (elements.btnGirar) {
        elements.btnGirar.setAttribute('aria-label', 'Girar a roleta');
        elements.btnGirar.setAttribute('role', 'button');
    }
    
    if (elements.btnParar) {
        elements.btnParar.setAttribute('aria-label', 'Parar a roleta');
        elements.btnParar.setAttribute('role', 'button');
    }
    
    if (elements.roleta) {
        elements.roleta.setAttribute('aria-label', 'Roleta da sorte');
        elements.roleta.setAttribute('role', 'img');
    }
    
    console.log('♿ Acessibilidade aprimorada');
}

// Executar melhorias de acessibilidade
setTimeout(melhorarAcessibilidade, 500);

// ===== FINALIZAÇÃO E LIMPEZA =====

// Função de limpeza para evitar memory leaks
function limpezaGeral() {
    // Cancelar timeouts ativos
    if (gameState.autoStopTimeout) {
        clearTimeout(gameState.autoStopTimeout);
        gameState.autoStopTimeout = null;
    }
    
    // Cancelar animações
    if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
        gameState.animationId = null;
    }
    
    // Limpar pool de objetos
    objetoPool.elementos.length = 0;
    
    console.log('🧹 Limpeza geral concluída');
}

// Limpeza quando a página é fechada
window.addEventListener('beforeunload', limpezaGeral);

// Limpeza periódica (a cada 5 minutos)
setInterval(() => {
    // Limpar toasts órfãos
    const toastsOrfaos = document.querySelectorAll('.toast:not(.show)');
    toastsOrfaos.forEach(toast => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    });
    
    // Limitar pool de objetos
    if (objetoPool.elementos.length > 100) {
        objetoPool.elementos.length = 50;
    }
}, 5 * 60 * 1000);

console.log('🎰 Sistema de Roleta Profissional COMPLETAMENTE CARREGADO! 🎰');
console.log('📋 Funcionalidades ativas:');
console.log('  ✅ Física realista de cassino');
console.log('  ✅ Animações ultra suaves');
console.log('  ✅ Sistema de recuperação de erros');
console.log('  ✅ Otimizações de performance');
console.log('  ✅ Acessibilidade aprimorada');
console.log('  ✅ Eventos personalizados');
console.log('  ✅ Validação de integridade');
console.log('🚀 Pronto para uso profissional!');
