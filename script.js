// ===== ROLETA ULTRA PROFISSIONAL - SISTEMA DE PARADA APRIMORADO =====

// Estados da roleta
const ESTADOS_ROLETA = {
    IDLE: 'idle',
    SPINNING: 'spinning',
    DECELERATING: 'decelerating',
    PRECISION_STOP: 'precision_stop',
    FINAL_SETTLE: 'final_settle',
    STOPPED: 'stopped'
};

// Estado do jogo com física profissional
let gameState = {
    estadoRoleta: ESTADOS_ROLETA.IDLE,
    girosRestantes: 3,
    saldoAtual: 0,
    tempoInicioGiro: null,
    tempoMinimoGiro: 2000,
    animationId: null,
    anguloAtual: 0,
    roletaElement: null,
    autoStopTimeout: null,
    anguloFinal: 0,
    premioSorteado: null,
    
    // Sistema de física profissional ultra refinado
    fisica: {
        // Parâmetros de movimento base
        velocidadeInicial: 18,
        velocidadeAtual: 0,
        velocidadeMinima: 0.01,
        
        // Fases de desaceleração progressiva
        fases: {
            INICIAL: {
                nome: 'DESACELERAÇÃO_INICIAL',
                atrito: 0.015,
                duracao: 3000,
                velocidadeMinima: 8,
                concluida: false
            },
            INTERMEDIARIA: {
                nome: 'DESACELERAÇÃO_INTERMEDIÁRIA',
                atrito: 0.025,
                duracao: 2500,
                velocidadeMinima: 3,
                concluida: false
            },
            FINAL: {
                nome: 'DESACELERAÇÃO_FINAL',
                atrito: 0.045,
                duracao: 2000,
                velocidadeMinima: 0.8,
                concluida: false
            }
        },
        
        faseAtual: null,
        tempoFaseAtual: 0,
        
        // Sistema de parada de precisão
        paradaPrecisao: {
            ativa: false,
            anguloInicial: 0,
            anguloAlvo: 0,
            tempoInicio: 0,
            duracao: 1800,
            curvaEasing: 'physics-precision',
            finalizada: false
        },
        
        // Sistema de estabilização final
        estabilizacao: {
            ativa: false,
            anguloBase: 0,
            tempoInicio: 0,
            duracao: 1200,
            intensidade: 2.5,
            frequencia: 4.2,
            decaimento: 5.5,
            finalizada: false
        },
        
        // Micro-oscilações realistas
        microOscilacoes: {
            ativas: true,
            amplitude: 0.08,
            frequenciaBase: 0.3,
            fase: 0,
            modulacao: 0.15
        },
        
        // Controle de suavidade
        suavizacao: {
            buffer: [],
            tamanhoBuffer: 5,
            fatorSuavizacao: 0.85
        }
    },
    
    // Efeitos visuais profissionais
    efeitosVisuais: {
        blur: {
            ativo: false,
            intensidade: 0,
            maxIntensidade: 1.2
        },
        glow: {
            ativo: false,
            intensidade: 0,
            maxIntensidade: 15,
            cor: 'rgba(255, 215, 0, 0.6)'
        },
        escala: {
            ativa: false,
            valor: 1,
            maxValor: 1.03,
            oscilacao: 0
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

// Configuração de prêmios e setores
const premiosPossiveis = [
    { valor: 0, texto: 'Tente novamente!', peso: 50, setor: 'cinza' },
    { valor: 25, texto: 'R$ 25,00', peso: 25, setor: 'dourado' },
    { valor: 50, texto: 'R$ 50,00', peso: 15, setor: 'vermelho' },
    { valor: 75, texto: 'R$ 75,00', peso: 10, setor: 'azul' }
];

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

// ===== FUNÇÕES DE FÍSICA ULTRA PROFISSIONAIS =====

// Curvas de easing físico profissionais
const EasingPhysics = {
    // Desaceleração natural com múltiplas fases
    naturalDeceleration: (t) => {
        const phase1 = Math.pow(1 - t, 0.8);
        const phase2 = Math.exp(-2.2 * t);
        const phase3 = Math.cos(t * Math.PI / 2);
        return (phase1 * 0.4) + (phase2 * 0.35) + (phase3 * 0.25);
    },
    
    // Parada de precisão ultra suave
    precisionStop: (t) => {
        const cubic = 1 - Math.pow(1 - t, 3.2);
        const quintic = 1 - Math.pow(1 - t, 5.1);
        const exponential = 1 - Math.exp(-4.8 * t);
        return (cubic * 0.45) + (quintic * 0.35) + (exponential * 0.2);
    },
    
    // Estabilização com amortecimento
    stabilization: (t, amplitude, frequency, decay) => {
        const envelope = Math.exp(-decay * t);
        const wave = Math.sin(frequency * t * Math.PI * 2);
        const damping = Math.cos(t * Math.PI / 2);
        return envelope * wave * damping * amplitude;
    }
};

// Suavização avançada de movimento
function aplicarSuavizacao(novoAngulo) {
    const suavizacao = gameState.fisica.suavizacao;
    
    // Adicionar ao buffer
    suavizacao.buffer.push(novoAngulo);
    if (suavizacao.buffer.length > suavizacao.tamanhoBuffer) {
        suavizacao.buffer.shift();
    }
    
    // Calcular média ponderada
    let soma = 0;
    let pesoTotal = 0;
    
    for (let i = 0; i < suavizacao.buffer.length; i++) {
        const peso = Math.pow(suavizacao.fatorSuavizacao, suavizacao.buffer.length - 1 - i);
        soma += suavizacao.buffer[i] * peso;
        pesoTotal += peso;
    }
    
    return pesoTotal > 0 ? soma / pesoTotal : novoAngulo;
}

// Micro-oscilações ultra realistas
function calcularMicroOscilacoes(tempo) {
    const micro = gameState.fisica.microOscilacoes;
    if (!micro.ativas) return 0;
    
    const velocidadeNormalizada = Math.min(gameState.fisica.velocidadeAtual / gameState.fisica.velocidadeInicial, 1);
    const intensidade = micro.amplitude * velocidadeNormalizada;
    
    const oscilacao1 = Math.sin(tempo * micro.frequenciaBase) * intensidade;
    const oscilacao2 = Math.sin(tempo * micro.frequenciaBase * 1.618) * intensidade * 0.618;
    const modulacao = Math.sin(tempo * micro.modulacao) * 0.3;
    
    return (oscilacao1 + oscilacao2) * (1 + modulacao);
}

// Sistema de fases de desaceleração
function processarFasesDesaceleracao(deltaTime) {
    const fisica = gameState.fisica;
    
    if (!fisica.faseAtual) {
        fisica.faseAtual = fisica.fases.INICIAL;
        fisica.tempoFaseAtual = 0;
        console.log('🎯 Iniciando fase:', fisica.faseAtual.nome);
    }
    
    fisica.tempoFaseAtual += deltaTime * 1000;
    
    // Aplicar atrito da fase atual
    const atritoAplicado = fisica.faseAtual.atrito * deltaTime * 60;
    fisica.velocidadeAtual = Math.max(0, fisica.velocidadeAtual - atritoAplicado);
    
    // Verificar transição de fase
    if (!fisica.faseAtual.concluida && 
        (fisica.velocidadeAtual <= fisica.faseAtual.velocidadeMinima || 
         fisica.tempoFaseAtual >= fisica.faseAtual.duracao)) {
        
        fisica.faseAtual.concluida = true;
        console.log('✅ Fase concluída:', fisica.faseAtual.nome);
        
        // Transicionar para próxima fase
        if (fisica.faseAtual === fisica.fases.INICIAL) {
            fisica.faseAtual = fisica.fases.INTERMEDIARIA;
            fisica.tempoFaseAtual = 0;
        } else if (fisica.faseAtual === fisica.fases.INTERMEDIARIA) {
            fisica.faseAtual = fisica.fases.FINAL;
            fisica.tempoFaseAtual = 0;
        } else if (fisica.faseAtual === fisica.fases.FINAL) {
            iniciarParadaPrecisao();
            return;
        }
        
        console.log('🔄 Transição para fase:', fisica.faseAtual.nome);
    }
}

// Iniciar parada de precisão
function iniciarParadaPrecisao() {
    console.log('🎯 Iniciando parada de precisão ultra profissional');
    
    gameState.estadoRoleta = ESTADOS_ROLETA.PRECISION_STOP;
    const paradaPrecisao = gameState.fisica.paradaPrecisao;
    
    paradaPrecisao.ativa = true;
    paradaPrecisao.anguloInicial = gameState.anguloAtual;
    paradaPrecisao.anguloAlvo = gameState.anguloFinal;
    paradaPrecisao.tempoInicio = Date.now();
    paradaPrecisao.finalizada = false;
    
    // Calcular trajetória otimizada
    let distancia = paradaPrecisao.anguloAlvo - paradaPrecisao.anguloInicial;
    
    // Normalizar distância para o caminho mais curto
    while (distancia > 180) distancia -= 360;
    while (distancia < -180) distancia += 360;
    
    // Ajustar alvo final com a trajetória otimizada
    paradaPrecisao.anguloAlvo = paradaPrecisao.anguloInicial + distancia;
    
    console.log(`📐 Precisão: ${paradaPrecisao.anguloInicial.toFixed(2)}° → ${paradaPrecisao.anguloAlvo.toFixed(2)}°`);
    
    // Atualizar efeitos visuais
    atualizarEfeitosVisuais('precision_stop');
    mostrarToast('🎯 Aplicando parada de precisão ultra profissional...', 'warning');
}

// Processar parada de precisão
function processarParadaPrecisao() {
    const paradaPrecisao = gameState.fisica.paradaPrecisao;
    
    if (paradaPrecisao.finalizada) return;
    
    const tempoDecorrido = Date.now() - paradaPrecisao.tempoInicio;
    const progresso = Math.min(tempoDecorrido / paradaPrecisao.duracao, 1);
    
    if (progresso >= 1) {
        // Parada de precisão concluída
        gameState.anguloAtual = paradaPrecisao.anguloAlvo;
        paradaPrecisao.ativa = false;
        paradaPrecisao.finalizada = true;
        iniciarEstabilizacaoFinal();
        return;
    }
    
    // Aplicar curva de precisão ultra suave
    const easingValue = EasingPhysics.precisionStop(progresso);
    const distanciaTotal = paradaPrecisao.anguloAlvo - paradaPrecisao.anguloInicial;
    
    gameState.anguloAtual = paradaPrecisao.anguloInicial + (distanciaTotal * easingValue);
    
    // Atualizar velocidade visual
    gameState.fisica.velocidadeAtual = (1 - easingValue) * 0.5;
}

// Iniciar estabilização final
function iniciarEstabilizacaoFinal() {
    console.log('🌊 Iniciando estabilização final ultra profissional');
    
    gameState.estadoRoleta = ESTADOS_ROLETA.FINAL_SETTLE;
    const estabilizacao = gameState.fisica.estabilizacao;
    
    estabilizacao.ativa = true;
    estabilizacao.anguloBase = gameState.anguloAtual;
    estabilizacao.tempoInicio = Date.now();
    estabilizacao.finalizada = false;
    
    // Pequeno ajuste aleatório natural
    const ajusteNatural = (Math.random() - 0.5) * 0.8;
    estabilizacao.anguloBase += ajusteNatural;
    
    // Atualizar efeitos visuais
    atualizarEfeitosVisuais('final_settle');
}

// Processar estabilização final
function processarEstabilizacaoFinal() {
    const estabilizacao = gameState.fisica.estabilizacao;
    
    if (estabilizacao.finalizada) return;
    
    const tempoDecorrido = (Date.now() - estabilizacao.tempoInicio) / 1000;
    const progresso = Math.min(tempoDecorrido / (estabilizacao.duracao / 1000), 1);
    
    if (progresso >= 1) {
        // Estabilização concluída
        gameState.anguloAtual = estabilizacao.anguloBase;
        estabilizacao.ativa = false;
        estabilizacao.finalizada = true;
        finalizarGiro();
        return;
    }
    
    // Aplicar estabilização com amortecimento
    const oscilacao = EasingPhysics.stabilization(
        tempoDecorrido,
        estabilizacao.intensidade,
        estabilizacao.frequencia,
        estabilizacao.decaimento
    );
    
    gameState.anguloAtual = estabilizacao.anguloBase + oscilacao;
}

// ===== SISTEMA DE EFEITOS VISUAIS PROFISSIONAIS =====

function atualizarEfeitosVisuais(fase) {
    const efeitos = gameState.efeitosVisuais;
    const velocidadeNormalizada = Math.min(gameState.fisica.velocidadeAtual / gameState.fisica.velocidadeInicial, 1);
    
    switch (fase) {
        case 'spinning':
            efeitos.blur.ativo = true;
            efeitos.glow.ativo = true;
            efeitos.escala.ativa = true;
            break;
            
        case 'precision_stop':
            efeitos.blur.intensidade *= 0.7;
            efeitos.glow.intensidade *= 0.8;
            efeitos.escala.oscilacao = 0.02;
            break;
            
        case 'final_settle':
            efeitos.blur.ativo = false;
            efeitos.glow.intensidade *= 0.5;
            efeitos.escala.oscilacao = 0.01;
            break;
            
        case 'stopped':
            efeitos.blur.ativo = false;
            efeitos.glow.ativo = false;
            efeitos.escala.ativa = false;
            break;
    }
    
    // Atualizar intensidades baseadas na velocidade
    if (efeitos.blur.ativo) {
        efeitos.blur.intensidade = velocidadeNormalizada * efeitos.blur.maxIntensidade;
    }
    
    if (efeitos.glow.ativo) {
        efeitos.glow.intensidade = velocidadeNormalizada * efeitos.glow.maxIntensidade;
    }
    
    if (efeitos.escala.ativa) {
        const tempo = Date.now() * 0.001;
        efeitos.escala.valor = 1 + (Math.sin(tempo * 2) * efeitos.escala.oscilacao);
    }
}

function aplicarEfeitosVisuais() {
    if (!elements.roleta) return;
    
    const efeitos = gameState.efeitosVisuais;
    let filtros = [];
    let transform = `translate3d(0, 0, 0) rotate(${gameState.anguloAtual}deg)`;
    
    // Aplicar blur
    if (efeitos.blur.ativo && efeitos.blur.intensidade > 0.01) {
        filtros.push(`blur(${efeitos.blur.intensidade}px)`);
    }
    
    // Aplicar escala
    if (efeitos.escala.ativa && Math.abs(efeitos.escala.valor - 1) > 0.001) {
        transform += ` scale(${efeitos.escala.valor})`;
    }
    
    // Aplicar brilho e saturação baseados na velocidade
    const velocidadeNormalizada = Math.min(gameState.fisica.velocidadeAtual / gameState.fisica.velocidadeInicial, 1);
    const brilho = 1 + velocidadeNormalizada * 0.15;
    const saturacao = 1 + velocidadeNormalizada * 0.25;
    const contraste = 1 + velocidadeNormalizada * 0.08;
    
    filtros.push(`brightness(${brilho})`);
    filtros.push(`saturate(${saturacao})`);
    filtros.push(`contrast(${contraste})`);
    
    // Aplicar transformações
    elements.roleta.style.transform = transform;
    elements.roleta.style.filter = filtros.join(' ');
    
    // Aplicar glow
    if (efeitos.glow.ativo && efeitos.glow.intensidade > 0.1) {
        elements.roleta.style.boxShadow = `0 0 ${efeitos.glow.intensidade}px ${efeitos.glow.cor}`;
    } else {
        elements.roleta.style.boxShadow = 'none';
    }
}

// ===== ANIMAÇÃO PRINCIPAL ULTRA PROFISSIONAL =====

let ultimoTempo = 0;

function iniciarAnimacaoUltraProfissional() {
    console.log('🚀 Iniciando animação ultra profissional com física avançada');
    
    ultimoTempo = performance.now();
    
    function animar(tempoAtual) {
        if (gameState.estadoRoleta === ESTADOS_ROLETA.STOPPED) {
            return;
        }
        
        // Delta time com limitação para estabilidade
        const deltaTime = Math.min((tempoAtual - ultimoTempo) / 1000, 1/30);
        ultimoTempo = tempoAtual;
        
        // Processar física baseada no estado
        switch (gameState.estadoRoleta) {
            case ESTADOS_ROLETA.SPINNING:
                // Movimento inicial com micro-oscilações
                const tempo = Date.now() * 0.001;
                const microOscilacao = calcularMicroOscilacoes(tempo);
                gameState.anguloAtual += (gameState.fisica.velocidadeAtual + microOscilacao) * deltaTime * 60;
                atualizarEfeitosVisuais('spinning');
                break;
                
            case ESTADOS_ROLETA.DECELERATING:
                processarFasesDesaceleracao(deltaTime);
                gameState.anguloAtual += gameState.fisica.velocidadeAtual * deltaTime * 60;
                break;
                
            case ESTADOS_ROLETA.PRECISION_STOP:
                processarParadaPrecisao();
                break;
                
            case ESTADOS_ROLETA.FINAL_SETTLE:
                processarEstabilizacaoFinal();
                break;
        }
        
        // Aplicar suavização
        gameState.anguloAtual = aplicarSuavizacao(gameState.anguloAtual);
        
        // Aplicar efeitos visuais
        aplicarEfeitosVisuais();
        
        // Continuar animação
        gameState.animationId = requestAnimationFrame(animar);
    }
    
    gameState.animationId = requestAnimationFrame(animar);
}

// ===== FUNÇÕES PRINCIPAIS =====

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎰 RoletaWin - Sistema Ultra Profissional Iniciando...');
    inicializarElementos();
    inicializarEventListeners();
    atualizarInterface();
    console.log('✅ Sistema ultra profissional inicializado com sucesso!');
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
    console.log('🎯 Iniciando giro ultra profissional...');
    
    if (gameState.estadoRoleta !== ESTADOS_ROLETA.IDLE || gameState.girosRestantes <= 0) {
        return;
    }
    
    // Resetar sistema de física
    resetarSistemaFisica();
    
    // Sortear prêmio e calcular ângulo final
    gameState.premioSorteado = sortearPremio();
    const setorEscolhido = encontrarSetorPorPremio(gameState.premioSorteado);
    gameState.anguloFinal = calcularAnguloFinal(setorEscolhido);
    
    // Configurar estado inicial
    gameState.estadoRoleta = ESTADOS_ROLETA.SPINNING;
    gameState.girosRestantes--;
    gameState.tempoInicioGiro = Date.now();
    gameState.anguloAtual = 0;
    gameState.fisica.velocidadeAtual = gameState.fisica.velocidadeInicial;
    
    console.log(`🎲 Prêmio: ${gameState.premioSorteado.texto}, Ângulo final: ${gameState.anguloFinal.toFixed(2)}°`);
    
    // Atualizar interface
    atualizarInterfaceGiro();
    
    // Iniciar animação
    iniciarAnimacaoUltraProfissional();
    
    // Configurar timeouts
    configurarTimeouts();
}

// Resetar sistema de física
function resetarSistemaFisica() {
    const fisica = gameState.fisica;
    
    // Resetar fases
    Object.values(fisica.fases).forEach(fase => {
        fase.concluida = false;
    });
    
    fisica.faseAtual = null;
    fisica.tempoFaseAtual = 0;
    
    // Resetar parada de precisão
    fisica.paradaPrecisao.ativa = false;
    fisica.paradaPrecisao.finalizada = false;
    
    // Resetar estabilização
    fisica.estabilizacao.ativa = false;
    fisica.estabilizacao.finalizada = false;
    
    // Resetar micro-oscilações
    fisica.microOscilacoes.fase = Math.random() * Math.PI * 2;
    
    // Resetar buffer de suavização
    fisica.suavizacao.buffer = [];
    
    // Resetar efeitos visuais
    const efeitos = gameState.efeitosVisuais;
    efeitos.blur.intensidade = 0;
    efeitos.glow.intensidade = 0;
    efeitos.escala.valor = 1;
    efeitos.escala.oscilacao = 0;
}

// Parar giro
function pararGiro() {
    console.log('🛑 Iniciando parada ultra profissional...');
    
    if (gameState.estadoRoleta !== ESTADOS_ROLETA.SPINNING) {
        return;
    }
    
    if (gameState.autoStopTimeout) {
        clearTimeout(gameState.autoStopTimeout);
        gameState.autoStopTimeout = null;
    }
    
    gameState.estadoRoleta = ESTADOS_ROLETA.DECELERATING;
    
    // Feedback visual profissional
    atualizarInterfaceParada();
    
    mostrarToast('⚙️ Aplicando sistema de desaceleração ultra profissional...', 'warning');
}

// Finalizar giro
function finalizarGiro() {
    console.log('🏁 Finalizando giro ultra profissional...');
    
    gameState.estadoRoleta = ESTADOS_ROLETA.STOPPED;
    
    if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
        gameState.animationId = null;
    }
    
    // Aplicar efeitos de finalização
    atualizarEfeitosVisuais('stopped');
    
    // Transição suave de efeitos visuais
    setTimeout(() => {
        if (elements.roleta) {
            elements.roleta.style.transition = 'filter 0.8s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            elements.roleta.style.filter = 'brightness(1) saturate(1) contrast(1)';
            elements.roleta.style.boxShadow = 'none';
        }
    }, 300);
    
    // Calcular e mostrar resultado
    const premio = calcularPremio(gameState.anguloAtual);
    gameState.saldoAtual += premio.valor;
    
    setTimeout(() => {
        resetarInterface();
        mostrarResultado(premio);
    }, 800);
}

// Funções auxiliares aprimoradas
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
    const variacao = (Math.random() - 0.5) * 8;
    const anguloNoSetor = Math.max(setor.inicio + 3, Math.min(setor.fim - 3, centroSetor + variacao));
    const voltasCompletas = 3.5 + Math.random() * 2.2;
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

function atualizarInterfaceGiro() {
    if (elements.btnGirar && elements.btnParar) {
        elements.btnGirar.classList.add('hidden');
        elements.btnParar.classList.remove('hidden');
        elements.btnParar.disabled = true;
        elements.btnParar.innerHTML = '<i class="fas fa-clock"></i><span>AGUARDE...</span>';
        elements.btnParar.style.background = 'linear-gradient(135deg, #ffd700 0%, #ffed4a 100%)';
    }
    
    if (elements.roleta) {
        elements.roleta.classList.remove('parada', 'desacelerando', 'precisao', 'estabilizando');
        elements.roleta.classList.add('girando');
    }
    
    mostrarToast('🎰 Roleta girando com física ultra profissional!', 'info');
}

function atualizarInterfaceParada() {
    if (elements.btnParar) {
        elements.btnParar.disabled = true;
        elements.btnParar.innerHTML = '<i class="fas fa-cog fa-spin"></i><span>PARANDO...</span>';
        elements.btnParar.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)';
    }
    
    if (elements.roleta) {
        elements.roleta.classList.remove('girando');
        elements.roleta.classList.add('desacelerando');
    }
}

function configurarTimeouts() {
    // Habilitar botão parar
    setTimeout(() => {
        if (gameState.estadoRoleta === ESTADOS_ROLETA.SPINNING) {
            elements.btnParar.disabled = false;
            elements.btnParar.innerHTML = '<i class="fas fa-stop"></i><span>PARAR</span>';
            elements.btnParar.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
            mostrarToast('✋ Agora você pode parar a roleta!', 'success');
        }
    }, gameState.tempoMinimoGiro);
    
    // Auto-parar após 15 segundos
    gameState.autoStopTimeout = setTimeout(() => {
        if (gameState.estadoRoleta === ESTADOS_ROLETA.SPINNING) {
            pararGiro();
            mostrarToast('⏰ Parada automática ativada!', 'info');
        }
    }, 15000);
}

function resetarInterface() {
    if (elements.btnGirar && elements.btnParar) {
        elements.btnGirar.classList.remove('hidden');
        elements.btnParar.classList.add('hidden');
        elements.btnParar.disabled = false;
        elements.btnParar.innerHTML = '<i class="fas fa-stop"></i><span>PARAR</span>';
        elements.btnParar.style.background = '';
    }
    
    if (elements.roleta) {
        elements.roleta.classList.remove('girando', 'desacelerando', 'precisao', 'estabilizando');
        elements.roleta.classList.add('parada');
    }
    
    gameState.estadoRoleta = ESTADOS_ROLETA.IDLE;
}

function mostrarResultado(premio) {
    if (elements.premioValor) {
        elements.premioValor.textContent = premio.texto;
        elements.premioValor.style.color = premio.valor > 0 ? '#00ff88' : '#ff6b6b';
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
        
        // Vibração profissional
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 150, 50, 200, 50, 100]);
        }
        
        // Efeito sonoro simulado
        console.log('🔊 SFX: Vitória!');
    } else {
        mostrarToast('😔 Que pena! Tente novamente na próxima!', 'error');
    }
}

function fecharModal() {
    if (elements.resultadoModal) {
        elements.resultadoModal.classList.remove('show');
        setTimeout(() => {
            elements.resultadoModal.style.display = 'none';
        }, 400);
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
            elements.btnGirar.style.cursor = 'not-allowed';
        } else {
            elements.btnGirar.disabled = false;
            elements.btnGirar.innerHTML = '<i class="fas fa-play"></i><span>GIRAR</span>';
            elements.btnGirar.style.opacity = '1';
            elements.btnGirar.style.cursor = 'pointer';
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
    
    const autoRemoveTimer = setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 400);
        }
    }, 5000);
    
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            clearTimeout(autoRemoveTimer);
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 400);
        });
    }
}

function criarConfetes() {
    const container = document.querySelector('.confetti-container') || document.body;
    
    for (let i = 0; i < 80; i++) {
        const confete = document.createElement('div');
        confete.className = 'confetti';
        confete.style.position = 'fixed';
        confete.style.left = Math.random() * 100 + '%';
        confete.style.top = '-10px';
        confete.style.zIndex = '9999';
        confete.style.pointerEvents = 'none';
        
        // Timing aleatório
        confete.style.animationDelay = Math.random() * 3 + 's';
        confete.style.animationDuration = (3 + Math.random() * 2.5) + 's';
        
        // Cores vibrantes
        const cores = [
            '#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', 
            '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3',
            '#ff9f43', '#10ac84', '#ee5a52', '#0abde3'
        ];
        confete.style.backgroundColor = cores[Math.floor(Math.random() * cores.length)];
        
        // Tamanho variado
        const tamanho = 4 + Math.random() * 8;
        confete.style.width = tamanho + 'px';
        confete.style.height = tamanho + 'px';
        confete.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        
        container.appendChild(confete);
        
        setTimeout(() => {
            if (confete.parentNode) {
                confete.parentNode.removeChild(confete);
            }
        }, 6000);
    }
}

// ===== ESTILOS CSS ULTRA PROFISSIONAIS =====

const estilosProfissionais = document.createElement('style');
estilosProfissionais.textContent = `
    /* Configurações base para máxima performance */
    .roleta {
        will-change: transform, filter;
        backface-visibility: hidden;
        transform-style: preserve-3d;
        transform-origin: center center;
        transition: none;
    }
    
    /* Estados da roleta com transições profissionais */
    .roleta.girando {
        transition: none;
        animation: none;
    }
    
    .roleta.desacelerando {
        transition: filter 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    
    .roleta.precisao {
        transition: filter 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .roleta.estabilizando {
        transition: filter 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .roleta.parada {
        transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* Efeitos de confete ultra profissionais */
    .confetti {
        position: fixed;
        border-radius: 2px;
        top: -15px;
        animation: confettiFallProfessional linear forwards;
        pointer-events: none;
        z-index: 9999;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    @keyframes confettiFallProfessional {
        0% {
            transform: translateY(0) rotateZ(0deg) scale(1);
            opacity: 1;
        }
        25% {
            opacity: 0.9;
        }
        75% {
            opacity: 0.6;
        }
        100% {
            transform: translateY(100vh) rotateZ(1080deg) scale(0.2);
            opacity: 0;
        }
    }
    
    /* Sistema de toast ultra profissional */
    .toast {
        background: rgba(255, 255, 255, 0.12);
        backdrop-filter: blur(30px);
        -webkit-backdrop-filter: blur(30px);
        border-radius: 16px;
        padding: 1.4rem 2rem;
        margin-bottom: 1.2rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-left: 4px solid;
        transform: translateX(120%);
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        max-width: 480px;
        min-width: 320px;
        box-shadow: 
            0 12px 40px rgba(0, 0, 0, 0.15),
            0 4px 16px rgba(0, 0, 0, 0.1);
        position: relative;
        overflow: hidden;
    }
    
    .toast::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, 
            transparent, 
            rgba(255, 255, 255, 0.3), 
            transparent
        );
    }
    
    .toast.show {
        transform: translateX(0);
    }
    
    .toast-info { 
        border-left-color: #45b7d1;
        background: rgba(69, 183, 209, 0.08);
    }
    .toast-success { 
        border-left-color: #00ff88;
        background: rgba(0, 255, 136, 0.08);
    }
    .toast-warning { 
        border-left-color: #ffd700;
        background: rgba(255, 215, 0, 0.08);
    }
    .toast-error { 
        border-left-color: #ff6b6b;
        background: rgba(255, 107, 107, 0.08);
    }
    
    .toast-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1.2rem;
        font-weight: 500;
        font-size: 0.95rem;
        line-height: 1.4;
    }
    
    .toast-close {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: #ffffff;
        font-size: 1.3rem;
        cursor: pointer;
        padding: 0;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    }
    
    .toast-close:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: scale(1.1) rotate(90deg);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    
    /* Botões com estados profissionais */
    .btn {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        transform: translateZ(0);
        backface-visibility: hidden;
        position: relative;
        overflow: hidden;
    }
    
    .btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, 
            transparent, 
            rgba(255, 255, 255, 0.2), 
            transparent
        );
        transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .btn:hover::before {
        left: 100%;
    }
    
    .btn:active {
        transform: scale(0.98);
    }
    
    .btn:disabled {
        cursor: not-allowed;
        transform: none;
        opacity: 0.6;
    }
    
    .btn:disabled::before {
        display: none;
    }
    
    /* Modal com efeitos profissionais */
    .modal {
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: 0;
    }
    
    .modal.show {
        opacity: 1;
    }
    
    .modal-content {
        transform: scale(0.9) translateY(30px);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.3),
            0 8px 24px rgba(0, 0, 0, 0.2);
    }
    
    .modal.show .modal-content {
        transform: scale(1) translateY(0);
    }
    
    /* Otimizações de performance */
    * {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
    
    @media (prefers-reduced-motion: reduce) {
        * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }
    
    /* GPU acceleration para elementos principais */
    .roleta,
    .btn,
    .toast,
    .modal-content {
        transform: translateZ(0);
        will-change: transform;
    }
`;

document.head.appendChild(estilosProfissionais);

console.log('🎰 RoletaWin - Sistema Ultra Profissional carregado com máxima qualidade!');
