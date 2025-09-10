// ===== ROLETA COM SPRING PHYSICS OTIMIZADA - VERSÃO FINAL CORRIGIDA =====

// Estados da roleta
const ESTADOS_ROLETA = {
    IDLE: 'idle',
    SPINNING: 'spinning',
    STOPPING: 'stopping',
    STOPPED: 'stopped'
};

// Classe para Spring Physics Otimizada
class SpringPhysicsOptimized {
    constructor(mass = 1, tension = 170, friction = 26) {
        this.mass = mass;
        this.tension = tension;
        this.friction = friction;
        
        // Estado interno da mola
        this.position = 0;
        this.velocity = 0;
        this.target = 0;
        
        // Configurações de precisão otimizadas
        this.restThreshold = 0.01; // Reduzido para maior precisão
        this.velocityThreshold = 0.01; // Reduzido para maior precisão
        this.isAtRest = true;
        
        // Histórico para suavização
        this.positionHistory = [];
        this.maxHistorySize = 3;
    }
    
    // Atualizar a física da mola com otimizações
    update(deltaTime) {
        if (this.isAtRest) return this.position;
        
        // Força da mola (Lei de Hooke)
        const springForce = -this.tension * (this.position - this.target);
        
        // Força de amortecimento
        const dampingForce = -this.friction * this.velocity;
        
        // Força total
        const totalForce = springForce + dampingForce;
        
        // Aceleração (F = ma, então a = F/m)
        const acceleration = totalForce / this.mass;
        
        // Integração de Verlet melhorada
        this.velocity += acceleration * deltaTime;
        this.position += this.velocity * deltaTime;
        
        // Adicionar ao histórico para suavização
        this.positionHistory.push(this.position);
        if (this.positionHistory.length > this.maxHistorySize) {
            this.positionHistory.shift();
        }
        
        // Suavização baseada no histórico
        const smoothedPosition = this.positionHistory.reduce((sum, pos) => sum + pos, 0) / this.positionHistory.length;
        this.position = smoothedPosition;
        
        // Verificar se está em repouso com tolerância melhorada
        const displacement = Math.abs(this.position - this.target);
        const speed = Math.abs(this.velocity);
        
        if (displacement < this.restThreshold && speed < this.velocityThreshold) {
            this.position = this.target;
            this.velocity = 0;
            this.isAtRest = true;
        }
        
        return this.position;
    }
    
    // Definir novo alvo com suavização
    setTarget(newTarget) {
        this.target = newTarget;
        this.isAtRest = false;
        this.positionHistory = []; // Reset histórico
    }
    
    // Definir posição inicial
    setPosition(position) {
        this.position = position;
        this.velocity = 0;
        this.positionHistory = [position];
    }
    
    // Verificar se está em movimento
    isMoving() {
        return !this.isAtRest;
    }
    
    // Configurar parâmetros da mola
    configure(mass, tension, friction) {
        this.mass = mass;
        this.tension = tension;
        this.friction = friction;
    }
    
    // Obter velocidade atual
    getVelocity() {
        return this.velocity;
    }
}

// Estado do jogo com Spring Physics Otimizado
let gameState = {
    estadoRoleta: ESTADOS_ROLETA.IDLE,
    girosRestantes: 3,
    saldoAtual: 0,
    tempoInicioGiro: null,
    tempoMinimoGiro: 2000,
    animationId: null,
    anguloAtual: 0,
    anguloFinal: 0,
    autoStopTimeout: null,
    
    // Sistema de Spring Physics Otimizado
    springSystem: {
        // Mola principal para rotação (parâmetros otimizados)
        rotationSpring: new SpringPhysicsOptimized(1.0, 160, 25),
        
        // Mola para desaceleração suave (parâmetros otimizados)
        decelerationSpring: new SpringPhysicsOptimized(0.7, 140, 32),
        
        // Controle de velocidade otimizado
        velocidadeAtual: 0,
        velocidadeInicial: 12,
        velocidadeMinima: 0.05, // Reduzido para transição mais suave
        
        // Estados do sistema
        girando: false,
        desacelerando: false,
        finalizando: false,
        
        // Tempo para cálculos
        ultimoTempo: 0,
        
        // Configurações de precisão otimizadas
        precisaoAngular: 0.1, // Aumentado para maior precisão na parada
        suavizacaoVelocidade: 0.98, // Aumentado para desaceleração mais gradual
        
        // Sistema de interpolação suave
        interpolacao: {
            ativo: false,
            anguloInicial: 0,
            anguloFinal: 0,
            tempoInicio: 0,
            duracao: 1000 // Duração reduzida para interpolação mais rápida
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

// Configuração de prêmios
const premiosPossiveis = [
    { valor: 0, texto: 'Tente novamente!', peso: 50, setor: 'cinza' },
    { valor: 25, texto: 'R$ 25,00', peso: 25, setor: 'dourado' },
    { valor: 50, texto: 'R$ 50,00', peso: 15, setor: 'vermelho' },
    { valor: 75, texto: 'R$ 75,00', peso: 10, setor: 'azul' }
];

// Mapeamento dos setores da roleta
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

// ===== SISTEMA DE ANIMAÇÃO OTIMIZADO =====

// Função de easing suave para interpolação
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// Função principal de animação otimizada
function iniciarAnimacaoSpringPhysicsOtimizada() {
    console.log('🌸 Iniciando animação Spring Physics otimizada');
    
    const spring = gameState.springSystem;
    spring.ultimoTempo = performance.now();
    
    function animar(tempoAtual) {
        if (gameState.estadoRoleta === ESTADOS_ROLETA.STOPPED) {
            return;
        }
        
        // Calcular delta time (limitado para estabilidade)
        const deltaTime = Math.min((tempoAtual - spring.ultimoTempo) / 1000, 1/30);
        spring.ultimoTempo = tempoAtual;
        
        // Processar física baseada no estado
        if (spring.girando) {
            processarGiroNormalOtimizado(deltaTime);
        } else if (spring.desacelerando) {
            processarDesaceleracaoOtimizada(deltaTime);
        } else if (spring.finalizando) {
            processarFinalizacaoOtimizada(deltaTime);
        }
        
        // Aplicar rotação com aceleração de hardware
        if (elements.roleta) {
            elements.roleta.style.transform = `translate3d(0, 0, 0) rotate(${gameState.anguloAtual}deg)`;
            
            // Efeitos visuais otimizados
            aplicarEfeitosVisuaisOtimizados();
        }
        
        // Continuar animação
        gameState.animationId = requestAnimationFrame(animar);
    }
    
    gameState.animationId = requestAnimationFrame(animar);
}

// Processar giro normal otimizado
function processarGiroNormalOtimizado(deltaTime) {
    const spring = gameState.springSystem;
    
    // Aplicar velocidade constante com micro-variações mais sutis
    const microVariacao = Math.sin(Date.now() * 0.003) * 0.03;
    const velocidadeComVariacao = spring.velocidadeAtual + microVariacao;
    
    gameState.anguloAtual += velocidadeComVariacao * deltaTime * 60;
    
    // Aplicar atrito muito leve para realismo
    spring.velocidadeAtual *= 0.9998;
}

// Processar desaceleração otimizada
function processarDesaceleracaoOtimizada(deltaTime) {
    const spring = gameState.springSystem;
    
    // Calcular velocidade alvo com curva mais suave
    const fatorDesaceleracao = 0.97 + (Math.sin(Date.now() * 0.001) * 0.005);
    spring.velocidadeAtual *= fatorDesaceleracao;
    
    // Atualizar ângulo
    gameState.anguloAtual += spring.velocidadeAtual * deltaTime * 60;
    
    // Verificar se deve iniciar finalização
    if (spring.velocidadeAtual <= spring.velocidadeMinima) {
        iniciarFinalizacaoSpringOtimizada();
    }
}

// Processar finalização otimizada
function processarFinalizacaoOtimizada(deltaTime) {
    const spring = gameState.springSystem;
    
    if (spring.interpolacao.ativo) {
        // Usar interpolação suave para o ângulo final
        const tempoDecorrido = Date.now() - spring.interpolacao.tempoInicio;
        const progresso = Math.min(tempoDecorrido / spring.interpolacao.duracao, 1);
        
        if (progresso >= 1) {
            gameState.anguloAtual = spring.interpolacao.anguloFinal;
            spring.interpolacao.ativo = false;
            finalizarGiro();
            return;
        }
        
        const fatorEasing = easeOutCubic(progresso);
        const distanciaTotal = spring.interpolacao.anguloFinal - spring.interpolacao.anguloInicial;
        
        gameState.anguloAtual = spring.interpolacao.anguloInicial + (distanciaTotal * fatorEasing);
    } else {
        // Usar spring para movimento suave
        const anguloAtualizado = spring.rotationSpring.update(deltaTime);
        gameState.anguloAtual = anguloAtualizado;
        
        // Verificar se chegou ao destino com maior precisão
        if (spring.rotationSpring.isAtRest) {
            finalizarGiro();
        }
    }
}

// Iniciar finalização otimizada
function iniciarFinalizacaoSpringOtimizada() {
    console.log('🎯 Iniciando finalização Spring Physics otimizada');
    
    const spring = gameState.springSystem;
    spring.desacelerando = false;
    spring.finalizando = true;
    
    // Normalizar o anguloAtual para garantir que esteja no mesmo 


ciclo de 360 graus do anguloFinal
    const anguloNormalizado = gameState.anguloAtual % 360;
    const voltas = Math.floor(gameState.anguloAtual / 360);
    const anguloFinalNormalizado = gameState.anguloFinal % 360;
    
    let anguloFinalAjustado = (voltas * 360) + anguloFinalNormalizado;
    
    // Se o angulo final ajustado for menor que o atual, adiciona mais uma volta
    if (anguloFinalAjustado < gameState.anguloAtual) {
        anguloFinalAjustado += 360;
    }
    
    gameState.anguloFinal = anguloFinalAjustado;
    
    // Calcular distância para o ângulo final
    const distancia = Math.abs(gameState.anguloFinal - gameState.anguloAtual);
    
    if (distancia > 180) {
        // Usar interpolação para distâncias grandes
        spring.interpolacao.ativo = true;
        spring.interpolacao.anguloInicial = gameState.anguloAtual;
        spring.interpolacao.anguloFinal = gameState.anguloFinal;
        spring.interpolacao.tempoInicio = Date.now();
        spring.interpolacao.duracao = Math.min(1000, distancia * 2.5);
        
        console.log(`📐 Interpolação: ${gameState.anguloAtual.toFixed(2)}° → ${gameState.anguloFinal.toFixed(2)}°`);
    } else {
        // Usar spring para distâncias pequenas
        spring.rotationSpring.setPosition(gameState.anguloAtual);
        spring.rotationSpring.setTarget(gameState.anguloFinal);
        spring.rotationSpring.configure(0.9, 130, 26);
        
        console.log(`🌸 Spring: ${gameState.anguloAtual.toFixed(2)}° → ${gameState.anguloFinal.toFixed(2)}°`);
    }
}

// Aplicar efeitos visuais otimizados
function aplicarEfeitosVisuaisOtimizados() {
    const spring = gameState.springSystem;
    const intensidade = Math.min(spring.velocidadeAtual / spring.velocidadeInicial, 1);
    
    // Efeitos mais sutis e profissionais
    const brilho = 1 + intensidade * 0.1;
    const saturacao = 1 + intensidade * 0.15;
    const contraste = 1 + intensidade * 0.05;
    
    elements.roleta.style.filter = `brightness(${brilho}) saturate(${saturacao}) contrast(${contraste})`;
    
    // Sombra dinâmica mais sutil
    const sombra = intensidade * 8;
    const corSombra = `rgba(255, 215, 0, ${intensidade * 0.2})`;
    elements.roleta.style.boxShadow = `0 0 ${sombra}px ${corSombra}`;
}

// ===== FUNÇÕES PRINCIPAIS =====

// Inicialização
document.addEventListener("DOMContentLoaded", function() {
    console.log("🎰 RoletaWin - Sistema Spring Physics Otimizado Iniciando...");
    inicializarElementos();
    inicializarEventListeners();
    atualizarInterface();
    console.log("✅ Sistema Spring Physics otimizado inicializado com sucesso!");
});

// Inicializar elementos DOM
function inicializarElementos() {
    elements.btnGirar = document.getElementById("btn-girar");
    elements.btnParar = document.getElementById("btn-parar");
    elements.roleta = document.getElementById("roleta");
    elements.roletaPointer = document.getElementById("roleta-pointer");
    elements.toastContainer = document.getElementById("toast-container");
    elements.resultadoModal = document.getElementById("resultado-modal");
    elements.btnContinuar = document.getElementById("btn-continuar");
    elements.premioValor = document.getElementById("premio-valor");
    elements.novoSaldo = document.getElementById("novo-saldo");
    elements.girosCount = document.getElementById("giros-count");
    elements.saldoAtual = document.getElementById("saldo-atual");
    
    if (!elements.btnGirar || !elements.roleta) {
        console.error("❌ Elementos essenciais não encontrados!");
        return;
    }
    
    console.log("✅ Elementos DOM inicializados");
}

// Event listeners
function inicializarEventListeners() {
    if (elements.btnGirar) {
        elements.btnGirar.addEventListener("click", iniciarGiro);
    }
    
    if (elements.btnParar) {
        elements.btnParar.addEventListener("click", pararGiro);
    }
    
    if (elements.btnContinuar) {
        elements.btnContinuar.addEventListener("click", fecharModal);
    }
    
    if (elements.resultadoModal) {
        elements.resultadoModal.addEventListener("click", function(e) {
            if (e.target === elements.resultadoModal) {
                fecharModal();
            }
        });
    }
}

// Iniciar giro
function iniciarGiro() {
    console.log("🎯 Iniciando giro Spring Physics otimizado...");
    
    if (gameState.estadoRoleta !== ESTADOS_ROLETA.IDLE || gameState.girosRestantes <= 0) {
        return;
    }
    
    // Sortear prêmio e calcular ângulo final
    const premioSorteado = sortearPremio();
    const setorEscolhido = encontrarSetorPorPremio(premioSorteado);
    gameState.anguloFinal = calcularAnguloFinal(setorEscolhido);
    
    // Resetar estado
    gameState.estadoRoleta = ESTADOS_ROLETA.SPINNING;
    gameState.girosRestantes--;
    gameState.tempoInicioGiro = Date.now();
    gameState.anguloAtual = 0;
    
    // Resetar sistema Spring
    const spring = gameState.springSystem;
    spring.velocidadeAtual = spring.velocidadeInicial;
    spring.girando = true;
    spring.desacelerando = false;
    spring.finalizando = false;
    spring.interpolacao.ativo = false;
    
    // Resetar springs
    spring.rotationSpring.setPosition(0);
    spring.decelerationSpring.setPosition(spring.velocidadeInicial);
    
    console.log(`🎲 Prêmio: ${premioSorteado.texto}, Ângulo final: ${gameState.anguloFinal.toFixed(2)}°`);
    
    // Atualizar interface
    if (elements.btnGirar && elements.btnParar) {
        elements.btnGirar.classList.add("hidden");
        elements.btnParar.classList.remove("hidden");
        elements.btnParar.disabled = true;
        elements.btnParar.innerHTML = 	
<i class=\"fas fa-clock\"></i><span>AGUARDE...</span>	
;
    }
    
    // Efeitos visuais
    if (elements.roleta) {
        elements.roleta.classList.remove("parada", "desacelerando");
        elements.roleta.classList.add("girando");
    }
    
    mostrarToast("🌸 Roleta girando com Spring Physics otimizado!", "info");
    
    // Iniciar animação
    iniciarAnimacaoSpringPhysicsOtimizada();
    
    // Habilitar botão parar
    setTimeout(() => {
        if (gameState.
