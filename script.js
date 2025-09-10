// ===== ROLETA ULTRA REALISTA SEM TRAVAMENTOS - VERSÃO FINAL CORRIGIDA =====

// Estados da roleta
const ESTADOS_ROLETA = {
    IDLE: 'idle',
    SPINNING: 'spinning',
    STOPPING: 'stopping',
    STOPPED: 'stopped'
};

// Estado do jogo com física avançada
let gameState = {
    estadoRoleta: ESTADOS_ROLETA.IDLE,
    girosRestantes: 3,
    saldoAtual: 0,
    tempoInicioGiro: null,
    tempoMinimoGiro: 2000,
    animationId: null,
    velocidadeAtual: 0,
    anguloAtual: 0,
    roletaElement: null,
    autoStopTimeout: null,
    anguloFinal: 0,
    
    // Sistema de física avançada para máximo realismo
    fisica: {
        velocidadeInicial: 16,
        velocidadeAtual: 0,
        atrito: 0.018, // Atrito constante mais realista
        inercia: 0.985, // Coeficiente de inércia
        
        // Controle de desaceleração progressiva
        desaceleracaoIniciada: false,
        fatorDesaceleracaoBase: 0.025,
        fatorDesaceleracaoProgressivo: 0.0008,
        tempoDesaceleracao: 0,
        
        // Sistema de parada suave sem travamentos
        paradaSuave: {
            ativo: false,
            velocidadeMinima: 0.05,
            tempoTransicao: 2000,
            tempoInicio: 0,
            anguloInicial: 0,
            anguloFinal: 0,
            finalizada: false
        },
        
        // Sistema de amortecimento final
        amortecimento: {
            ativo: false,
            amplitude: 1.5,
            frequencia: 3.5,
            decaimento: 4.0,
            tempoInicio: 0,
            duracao: 1500,
            finalizado: false
        },
        
        // Micro-variações para naturalidade
        microVariacoes: {
            ativo: true,
            amplitude: 0.06,
            frequencia: 0.25,
            fase: 0
        }
    }
};

// Elementos DOM
const elements = {
    btnGirar: null,
    btnParar: null,
    roleta: null,
    roletaPointer: null,
    toastContainer: null,
    resultadoModal: null,
    btnContinuar: null,
    premioValor: null,
    novoSaldo: null,
    girosCount: null,
    saldoAtual: null
};

// Configuração de prêmios com setores da roleta
const premiosPossiveis = [
    { valor: 0, texto: 'Tente novamente!', peso: 50, setor: 'cinza' },
    { valor: 25, texto: 'R$ 25,00', peso: 25, setor: 'dourado' },
    { valor: 50, texto: 'R$ 50,00', peso: 15, setor: 'vermelho' },
    { valor: 75, texto: 'R$ 75,00', peso: 10, setor: 'azul' }
];

// Mapeamento dos setores da roleta (8 setores de 45 graus cada)
const setoresRoleta = [
    { inicio: 0, fim: 45, cor: 'dourado', premio: premiosPossiveis[1] },
    { inicio: 45, fim: 90, cor: 'cinza', premio: premiosPossiveis[0] },
    { inicio: 90, fim: 135, cor: 'vermelho', premio: premiosPossiveis[2] },
    { inicio: 135, fim: 180, cor: 'cinza', premio: premiosPossiveis[0] },
    { inicio: 180, fim: 225, cor: 'azul', premio: premiosPossiveis[3] },
    { inicio: 225, fim: 270, cor: 'cinza', premio: premiosPossiveis[0] },
    { inicio: 270, fim: 315, cor: 'dourado', premio: premiosPossiveis[1] },
    { inicio: 315, fim: 360, cor: 'cinza', premio: premiosPossiveis[0] }
];

// ===== FUNÇÕES DE FÍSICA AVANÇADA =====

// Função de easing ultra suave para transições naturais
function easeOutPhysical(t) {
    // Simula desaceleração física real com múltiplas curvas
    const exponential = 1 - Math.exp(-3.5 * t);
    const cubic = 1 - Math.pow(1 - t, 3);
    const sine = Math.sin(t * Math.PI / 2);
    
    // Combina as curvas para máximo realismo
    return (exponential * 0.5) + (cubic * 0.3) + (sine * 0.2);
}

// Função de amortecimento físico realista
function calcularAmortecimento(t, amplitude, frequencia, decaimento) {
    const envelope = Math.exp(-decaimento * t);
    const oscilacao = Math.sin(frequencia * t * Math.PI * 2);
    return envelope * oscilacao * amplitude;
}

// Função para micro-variações naturais
function calcularMicroVariacoes(tempo, amplitude, frequencia) {
    const ruido1 = Math.sin(tempo * frequencia) * amplitude;
    const ruido2 = Math.sin(tempo * frequencia * 1.7) * amplitude * 0.5;
    return ruido1 + ruido2;
}

// Sistema de física avançada para movimento realista
function atualizarFisica(deltaTime) {
    const fisica = gameState.fisica;
    
    if (gameState.estadoRoleta === ESTADOS_ROLETA.SPINNING) {
        // Aplicar atrito constante
        const atritoAplicado = fisica.atrito * deltaTime * 60;
        fisica.velocidadeAtual = Math.max(0, fisica.velocidadeAtual - atritoAplicado);
        
        // Aplicar micro-variações para naturalidade
        if (fisica.microVariacoes.ativo) {
            const tempo = Date.now() * 0.001;
            const variacao = calcularMicroVariacoes(
                tempo,
                fisica.microVariacoes.amplitude,
                fisica.microVariacoes.frequencia
            );
            fisica.velocidadeAtual += variacao;
        }
        
    } else if (gameState.estadoRoleta === ESTADOS_ROLETA.STOPPING) {
        // Iniciar desaceleração progressiva se não foi iniciada
        if (!fisica.desaceleracaoIniciada) {
            fisica.desaceleracaoIniciada = true;
            fisica.tempoDesaceleracao = Date.now();
            console.log('🛑 Iniciando desaceleração física progressiva');
        }
        
        // Calcular desaceleração progressiva
        const tempoDecorrido = (Date.now() - fisica.tempoDesaceleracao) / 1000;
        const fatorDesaceleracao = fisica.fatorDesaceleracaoBase + 
                                 (fisica.fatorDesaceleracaoProgressivo * tempoDecorrido);
        
        // Aplicar desaceleração suave
        fisica.velocidadeAtual *= (1 - fatorDesaceleracao * deltaTime * 60);
        
        // Verificar se deve iniciar parada suave
        if (!fisica.paradaSuave.ativo && !fisica.paradaSuave.finalizada && 
            fisica.velocidadeAtual <= fisica.paradaSuave.velocidadeMinima) {
            iniciarParadaSuave();
        }
    }
    
    // Atualizar ângulo baseado na velocidade
    gameState.anguloAtual += fisica.velocidadeAtual * deltaTime * 60;
}

// Iniciar parada suave sem travamentos
function iniciarParadaSuave() {
    console.log('🎯 Iniciando parada suave ultra realista');
    
    const fisica = gameState.fisica;
    fisica.paradaSuave.ativo = true;
    fisica.paradaSuave.tempoInicio = Date.now();
    fisica.paradaSuave.anguloInicial = gameState.anguloAtual;
    
    // Calcular distância restante de forma mais inteligente
    let distanciaRestante = gameState.anguloFinal - gameState.anguloAtual;
    
    // Se a distância for muito pequena, ir direto para o amortecimento
    if (Math.abs(distanciaRestante) < 5) {
        fisica.paradaSuave.anguloFinal = gameState.anguloFinal;
    } else {
        // Normalizar para sempre ir na direção mais curta
        while (distanciaRestante > 180) distanciaRestante -= 360;
        while (distanciaRestante < -180) distanciaRestante += 360;
        fisica.paradaSuave.anguloFinal = gameState.anguloAtual + distanciaRestante;
    }
    
    console.log(`📐 Parada suave: ${gameState.anguloAtual.toFixed(2)}° → ${fisica.paradaSuave.anguloFinal.toFixed(2)}°`);
}

// Processar parada suave
function processarParadaSuave(deltaTime) {
    const fisica = gameState.fisica;
    const paradaSuave = fisica.paradaSuave;
    
    if (paradaSuave.finalizada) return;
    
    const tempoDecorrido = Date.now() - paradaSuave.tempoInicio;
    const progresso = Math.min(tempoDecorrido / paradaSuave.tempoTransicao, 1);
    
    if (progresso >= 1) {
        // Parada suave completa
        gameState.anguloAtual = paradaSuave.anguloFinal;
        paradaSuave.ativo = false;
        paradaSuave.finalizada = true;
        iniciarAmortecimento();
        return;
    }
    
    // Aplicar easing físico ultra suave
    const fatorEasing = easeOutPhysical(progresso);
    const distanciaTotal = paradaSuave.anguloFinal - paradaSuave.anguloInicial;
    
    gameState.anguloAtual = paradaSuave.anguloInicial + (distanciaTotal * fatorEasing);
    
    // Atualizar velocidade visual baseada no progresso
    fisica.velocidadeAtual = (1 - fatorEasing) * 0.3;
}

// Iniciar amortecimento final
function iniciarAmortecimento() {
    console.log('🌊 Iniciando amortecimento final ultra realista');
    
    const fisica = gameState.fisica;
    fisica.amortecimento.ativo = true;
    fisica.amortecimento.tempoInicio = Date.now();
    fisica.amortecimento.finalizado = false;
    
    // Pequeno ajuste aleatório para naturalidade
    const ajusteNatural = (Math.random() - 0.5) * 1.0;
    gameState.anguloFinal += ajusteNatural;
}

// Processar amortecimento
function processarAmortecimento() {
    const fisica = gameState.fisica;
    const amortecimento = fisica.amortecimento;
    
    if (amortecimento.finalizado) return;
    
    const tempoDecorrido = (Date.now() - amortecimento.tempoInicio) / 1000;
    const progresso = Math.min(tempoDecorrido / (amortecimento.duracao / 1000), 1);
    
    if (progresso >= 1) {
        // Amortecimento completo
        gameState.anguloAtual = gameState.anguloFinal;
        amortecimento.ativo = false;
        amortecimento.finalizado = true;
        finalizarGiro();
        return;
    }
    
    const valorAmortecimento = calcularAmortecimento(
        tempoDecorrido,
        amortecimento.amplitude,
        amortecimento.frequencia,
        amortecimento.decaimento
    );
    
    gameState.anguloAtual = gameState.anguloFinal + valorAmortecimento;
}

// ===== ANIMAÇÃO PRINCIPAL ULTRA REALISTA =====

let ultimoTempo = 0;

function iniciarAnimacaoUltraRealista() {
    console.log('🔄 Iniciando animação ultra realista com física avançada');
    
    ultimoTempo = performance.now();
    
    function animar(tempoAtual) {
        if (gameState.estadoRoleta === ESTADOS_ROLETA.STOPPED) {
            return;
        }
        
        // Calcular delta time para animação independente de framerate
        const deltaTime = Math.min((tempoAtual - ultimoTempo) / 1000, 1/30);
        ultimoTempo = tempoAtual;
        
        // Processar estados da física
        if (gameState.fisica.paradaSuave.ativo) {
            processarParadaSuave(deltaTime);
        } else if (gameState.fisica.amortecimento.ativo) {
            processarAmortecimento();
        } else {
            // Atualizar física normal
            atualizarFisica(deltaTime);
        }
        
        // Aplicar rotação com interpolação suave
        if (elements.roleta) {
            // Usar transform3d para aceleração de hardware
            elements.roleta.style.transform = `translate3d(0, 0, 0) rotate(${gameState.anguloAtual}deg)`;
            
            // Efeitos visuais baseados na velocidade
            const intensidadeVelocidade = Math.min(gameState.fisica.velocidadeAtual / gameState.fisica.velocidadeInicial, 1);
            
            // Aplicar efeitos visuais suaves
            const brilho = 1 + intensidadeVelocidade * 0.2;
            const saturacao = 1 + intensidadeVelocidade * 0.3;
            const contraste = 1 + intensidadeVelocidade * 0.1;
            
            elements.roleta.style.filter = `brightness(${brilho}) saturate(${saturacao}) contrast(${contraste})`;
            
            // Sombra dinâmica ultra suave
            const intensidadeSombra = intensidadeVelocidade * 12;
            const corSombra = `rgba(255, 215, 0, ${intensidadeVelocidade * 0.3})`;
            elements.roleta.style.boxShadow = `0 0 ${intensidadeSombra}px ${corSombra}`;
        }
        
        // Continuar animação
        gameState.animationId = requestAnimationFrame(animar);
    }
    
    gameState.animationId = requestAnimationFrame(animar);
}

// ===== FUNÇÕES PRINCIPAIS =====

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎰 RoletaWin - Sistema Ultra Realista Final Iniciando...');
    inicializarElementos();
    inicializarEventListeners();
    atualizarInterface();
    console.log('✅ Sistema ultra realista final inicializado com sucesso!');
});

// Inicializar elementos DOM
function inicializarElementos() {
    elements.btnGirar = document.getElementById('btn-girar');
    elements.btnParar = document.getElementById('btn-parar');
    elements.roleta = document.getElementById('roleta');
    elements.roletaPointer = document.getElementById('roleta-pointer');
    elements.toastContainer = document.getElementById('toast-container');
    elements.resultadoModal = document.getElementById('resultado-modal');
    elements.btnContinuar = document.getElementById('btn-continuar');
    elements.premioValor = document.getElementById('premio-valor');
    elements.novoSaldo = document.getElementById('novo-saldo');
    elements.girosCount = document.getElementById('giros-count');
    elements.saldoAtual = document.getElementById('saldo-atual');
    
    if (!elements.btnGirar || !elements.roleta) {
        console.error('❌ Elementos essenciais não encontrados!');
        return;
    }
    
    console.log('✅ Elementos DOM inicializados');
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
    console.log('🎯 Iniciando giro ultra realista...');
    
    if (gameState.estadoRoleta !== ESTADOS_ROLETA.IDLE || gameState.girosRestantes <= 0) {
        return;
    }
    
    // Sortear prêmio e calcular ângulo final
    const premioSorteado = sortearPremio();
    const setorEscolhido = encontrarSetorPorPremio(premioSorteado);
    gameState.anguloFinal = calcularAnguloFinal(setorEscolhido);
    
    // Resetar estado físico
    gameState.estadoRoleta = ESTADOS_ROLETA.SPINNING;
    gameState.girosRestantes--;
    gameState.tempoInicioGiro = Date.now();
    gameState.anguloAtual = 0;
    
    // Resetar física
    const fisica = gameState.fisica;
    fisica.velocidadeAtual = fisica.velocidadeInicial;
    fisica.desaceleracaoIniciada = false;
    fisica.amortecimento.ativo = false;
    fisica.amortecimento.finalizado = false;
    fisica.paradaSuave.ativo = false;
    fisica.paradaSuave.finalizada = false;
    fisica.microVariacoes.fase = Math.random() * Math.PI * 2;
    
    console.log(`🎲 Prêmio: ${premioSorteado.texto}, Ângulo final: ${gameState.anguloFinal.toFixed(2)}°`);
    
    // Atualizar interface
    if (elements.btnGirar && elements.btnParar) {
        elements.btnGirar.classList.add('hidden');
        elements.btnParar.classList.remove('hidden');
        elements.btnParar.disabled = true;
        elements.btnParar.innerHTML = '<i class="fas fa-clock"></i><span>AGUARDE...</span>';
    }
    
    // Efeitos visuais
    if (elements.roleta) {
        elements.roleta.classList.remove('parada', 'desacelerando');
        elements.roleta.classList.add('girando');
    }
    
    mostrarToast('🎰 Roleta girando com física ultra realista!', 'info');
    
    // Iniciar animação
    iniciarAnimacaoUltraRealista();
    
    // Habilitar botão parar
    setTimeout(() => {
        if (gameState.estadoRoleta === ESTADOS_ROLETA.SPINNING) {
            elements.btnParar.disabled = false;
            elements.btnParar.innerHTML = '<i class="fas fa-stop"></i><span>PARAR</span>';
            mostrarToast('✋ Agora você pode parar a roleta!', 'success');
        }
    }, gameState.tempoMinimoGiro);
    
    // Auto-parar após 12 segundos
    gameState.autoStopTimeout = setTimeout(() => {
        if (gameState.estadoRoleta === ESTADOS_ROLETA.SPINNING) {
            pararGiro();
        }
    }, 12000);
}

// Parar giro
function pararGiro() {
    console.log('🛑 Iniciando parada ultra realista...');
    
    if (gameState.estadoRoleta !== ESTADOS_ROLETA.SPINNING) {
        return;
    }
    
    if (gameState.autoStopTimeout) {
        clearTimeout(gameState.autoStopTimeout);
        gameState.autoStopTimeout = null;
    }
    
    gameState.estadoRoleta = ESTADOS_ROLETA.STOPPING;
    
    // Feedback visual
    if (elements.btnParar) {
        elements.btnParar.disabled = true;
        elements.btnParar.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>PARANDO...</span>';
        elements.btnParar.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)';
    }
    
    if (elements.roleta) {
        elements.roleta.classList.remove('girando');
        elements.roleta.classList.add('desacelerando');
    }
    
    mostrarToast('⏳ Aplicando física de desaceleração ultra realista...', 'warning');
}

// Finalizar giro
function finalizarGiro() {
    console.log('🏁 Finalizando giro ultra realista...');
    
    gameState.estadoRoleta = ESTADOS_ROLETA.STOPPED;
    
    if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
        gameState.animationId = null;
    }
    
    // Remover efeitos visuais suavemente
    if (elements.roleta) {
        elements.roleta.classList.remove('girando', 'desacelerando');
        elements.roleta.classList.add('parada');
        
        setTimeout(() => {
            elements.roleta.style.filter = 'brightness(1) saturate(1) contrast(1)';
            elements.roleta.style.boxShadow = 'none';
            elements.roleta.style.transition = 'filter 0.6s ease, box-shadow 0.6s ease';
        }, 200);
    }
    
    // Calcular e mostrar resultado
    const premio = calcularPremio(gameState.anguloAtual);
    gameState.saldoAtual += premio.valor;
    
    setTimeout(() => {
        resetarBotoes();
        mostrarResultado(premio);
    }, 500);
}

// Funções auxiliares
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

function encontrarSetorPorPremio(premio) {
    const setoresValidos = setoresRoleta.filter(setor => 
        setor.premio.valor === premio.valor
    );
    return setoresValidos[Math.floor(Math.random() * setoresValidos.length)];
}

function calcularAnguloFinal(setor) {
    const centroSetor = setor.inicio + (setor.fim - setor.inicio) / 2;
    const variacao = (Math.random() - 0.5) * 6;
    const anguloNoSetor = Math.max(setor.inicio + 2, Math.min(setor.fim - 2, centroSetor + variacao));
    const voltasCompletas = 3.2 + Math.random() * 1.8;
    return (voltasCompletas * 360) + anguloNoSetor;
}

function calcularPremio(anguloFinal) {
    const anguloNormalizado = anguloFinal % 360;
    
    for (let setor of setoresRoleta) {
        if (anguloNormalizado >= setor.inicio && anguloNormalizado < setor.fim) {
            return setor.premio;
        }
    }
    
    return setoresRoleta[setoresRoleta.length - 1].premio;
}

function mostrarResultado(premio) {
    if (elements.premioValor) {
        elements.premioValor.textContent = premio.texto;
    }
    
    if (elements.novoSaldo) {
        elements.novoSaldo.textContent = `R$ ${gameState.saldoAtual.toFixed(2)}`;
    }
    
    if (elements.resultadoModal) {
        elements.resultadoModal.style.display = 'flex';
        elements.resultadoModal.classList.add('show');
    }
    
    atualizarInterface();
    
    if (premio.valor > 0) {
        mostrarToast(`🎉 Parabéns! Você ganhou ${premio.texto}!`, 'success');
        criarConfetes();
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100, 50, 200]);
        }
    } else {
        mostrarToast('😔 Que pena! Tente novamente!', 'error');
    }
}

function resetarBotoes() {
    if (elements.btnGirar && elements.btnParar) {
        elements.btnGirar.classList.remove('hidden');
        elements.btnParar.classList.add('hidden');
        elements.btnParar.disabled = false;
        elements.btnParar.innerHTML = '<i class="fas fa-stop"></i><span>PARAR</span>';
        elements.btnParar.style.background = '';
    }
    
    gameState.estadoRoleta = ESTADOS_ROLETA.IDLE;
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
    
    const girosInfo = document.getElementById('giros-info');
    if (girosInfo) {
        girosInfo.style.display = gameState.girosRestantes > 0 ? 'block' : 'none';
    }
    
    if (elements.btnGirar) {
        if (gameState.girosRestantes <= 0) {
            elements.btnGirar.disabled = true;
            elements.btnGirar.innerHTML = '<i class="fas fa-times"></i><span>SEM GIROS</span>';
            elements.btnGirar.style.opacity = '0.5';
        } else {
            elements.btnGirar.disabled = false;
            elements.btnGirar.innerHTML = '<i class="fas fa-play"></i><span>GIRAR</span>';
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
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 4000);
    
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        });
    }
}

function criarConfetes() {
    const container = document.querySelector('.confetti-container');
    if (!container) return;
    
    for (let i = 0; i < 60; i++) {
        const confete = document.createElement('div');
        confete.className = 'confetti';
        confete.style.left = Math.random() * 100 + '%';
        confete.style.animationDelay = Math.random() * 3 + 's';
        confete.style.animationDuration = (2.5 + Math.random() * 2) + 's';
        
        const cores = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#ff9ff3', '#54a0ff'];
        confete.style.backgroundColor = cores[Math.floor(Math.random() * cores.length)];
        
        const tamanho = 6 + Math.random() * 6;
        confete.style.width = tamanho + 'px';
        confete.style.height = tamanho + 'px';
        
        container.appendChild(confete);
        
        setTimeout(() => {
            if (confete.parentNode) {
                confete.parentNode.removeChild(confete);
            }
        }, 4500);
    }
}

// CSS para animações ultra suaves
const style = document.createElement('style');
style.textContent = `
    .roleta {
        will-change: transform;
        backface-visibility: hidden;
        transform-style: preserve-3d;
    }
    
    .roleta.girando {
        transition: none;
    }
    
    .roleta.desacelerando {
        transition: filter 0.3s ease, box-shadow 0.3s ease;
    }
    
    .roleta.parada {
        transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .confetti {
        position: absolute;
        border-radius: 2px;
        top: -10px;
        animation: confettiFall linear forwards;
        pointer-events: none;
    }
    
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(720deg) scale(0.3);
            opacity: 0;
        }
    }
    
    .toast {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(25px);
        border-radius: 14px;
        padding: 1.2rem 1.8rem;
        margin-bottom: 1rem;
        border-left: 4px solid;
        transform: translateX(100%);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        max-width: 450px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    }
    
    .toast.show {
        transform: translateX(0);
    }
    
    .toast-info { border-left-color: #45b7d1; }
    .toast-success { border-left-color: #00ff88; }
    .toast-warning { border-left-color: #ffd700; }
    .toast-error { border-left-color: #ff6b6b; }
    
    .toast-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
    }
    
    .toast-close {
        background: none;
        border: none;
        color: #ffffff;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
    }
    
    .toast-close:hover {
        background-color: rgba(255, 255, 255, 0.2);
        transform: scale(1.1);
    }
`;
document.head.appendChild(style);

console.log('🎰 RoletaWin - Sistema Ultra Realista Final carregado com sucesso!');

