// ===== ROLETA PROFISSIONAL COM EFEITO DE PARADA ULTRA FLUIDO =====

// Estados da roleta
const ESTADOS_ROLETA = {
    IDLE: 'idle',
    SPINNING: 'spinning',
    STOPPING: 'stopping',
    STOPPED: 'stopped'
};

// Estado do jogo
let gameState = {
    estadoRoleta: ESTADOS_ROLETA.IDLE,
    girosRestantes: 3,
    saldoAtual: 0,
    tempoInicioGiro: null,
    tempoMinimoGiro: 2000, // Mínimo 2 segundos antes de poder parar
    animationId: null,
    velocidadeAtual: 0,
    anguloAtual: 0,
    roletaElement: null,
    autoStopTimeout: null,
    anguloFinal: 0, // Ângulo onde a roleta deve parar
    desacelerando: false,
    // Parâmetros otimizados para efeito ultra profissional
    velocidadeInicial: 25, // Velocidade inicial mais alta para melhor efeito
    velocidadeMinima: 0.05, // Velocidade mínima mais baixa para parada mais suave
    tempoDesaceleracao: 0,
    duracaoDesaceleracao: 3500, // 3.5 segundos para desaceleração ultra suave
    anguloInicialDesaceleracao: 0,
    distanciaTotalDesaceleracao: 0,
    // Novos parâmetros para precisão máxima
    margemErroAngulo: 1, // Margem de erro reduzida para 1 grau
    ajusteFinalAtivo: false,
    // Parâmetros para efeitos visuais avançados
    intensidadeBrilho: 1,
    filtroAtual: '',
    // Controle de momentum para parada mais realista
    momentumAtual: 0,
    resistenciaBase: 0.985, // Resistência natural da roleta
    resistenciaParada: 0.92, // Resistência adicional quando parando
    // Parâmetros para oscilação final (efeito de mola)
    oscilacoesFinais: true,
    amplitudeOscilacao: 0.8, // Amplitude da oscilação em graus
    frequenciaOscilacao: 8, // Frequência da oscilação
    tempoOscilacao: 800 // Duração da oscilação em ms
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
    { inicio: 0, fim: 45, cor: 'dourado', premio: premiosPossiveis[1] },      // 0-45°
    { inicio: 45, fim: 90, cor: 'cinza', premio: premiosPossiveis[0] },       // 45-90°
    { inicio: 90, fim: 135, cor: 'vermelho', premio: premiosPossiveis[2] },   // 90-135°
    { inicio: 135, fim: 180, cor: 'cinza', premio: premiosPossiveis[0] },     // 135-180°
    { inicio: 180, fim: 225, cor: 'azul', premio: premiosPossiveis[3] },      // 180-225°
    { inicio: 225, fim: 270, cor: 'cinza', premio: premiosPossiveis[0] },     // 225-270°
    { inicio: 270, fim: 315, cor: 'dourado', premio: premiosPossiveis[1] },   // 270-315°
    { inicio: 315, fim: 360, cor: 'cinza', premio: premiosPossiveis[0] }      // 315-360°
];

// ===== FUNÇÕES DE EASING PROFISSIONAIS =====

// Easing cúbico ultra suave para desaceleração principal
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// Easing quártico para transições mais dramáticas
function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
}

// Easing exponencial para parada final
function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

// Easing personalizado para efeito de mola (bounce suave)
function easeOutElastic(t) {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

// Função de interpolação suave para transições
function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

// ===== FUNÇÕES PRINCIPAIS =====

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎰 RoletaWin - Iniciando sistema ultra profissional...');
    inicializarElementos();
    inicializarEventListeners();
    atualizarInterface();
    console.log('✅ Sistema inicializado com efeitos profissionais!');
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
    
    // Verificar se elementos essenciais existem
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
        console.log('✅ Event listener do botão GIRAR adicionado');
    }
    
    if (elements.btnParar) {
        elements.btnParar.addEventListener('click', pararGiro);
        console.log('✅ Event listener do botão PARAR adicionado');
    }
    
    if (elements.btnContinuar) {
        elements.btnContinuar.addEventListener('click', fecharModal);
    }
    
    // Fechar modal clicando fora
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
        console.log('❌ Não é possível girar agora. Estado:', gameState.estadoRoleta, 'Giros:', gameState.girosRestantes);
        return;
    }
    
    // Calcular ângulo final baseado no prêmio sorteado
    const premioSorteado = sortearPremio();
    const setorEscolhido = encontrarSetorPorPremio(premioSorteado);
    gameState.anguloFinal = calcularAnguloFinalProfissional(setorEscolhido);
    
    console.log('🎲 Prêmio sorteado:', premioSorteado);
    console.log('🎯 Setor escolhido:', setorEscolhido);
    console.log('📐 Ângulo final calculado:', gameState.anguloFinal);
    
    // Resetar estado para novo giro
    gameState.estadoRoleta = ESTADOS_ROLETA.SPINNING;
    gameState.girosRestantes--;
    gameState.tempoInicioGiro = Date.now();
    gameState.velocidadeAtual = gameState.velocidadeInicial;
    gameState.anguloAtual = 0;
    gameState.desacelerando = false;
    gameState.tempoDesaceleracao = 0;
    gameState.ajusteFinalAtivo = false;
    gameState.momentumAtual = gameState.velocidadeInicial;
    gameState.intensidadeBrilho = 1;
    
    console.log('✅ Estado atualizado para SPINNING');
    
    // Atualizar interface - trocar botões
    if (elements.btnGirar && elements.btnParar) {
        elements.btnGirar.classList.add('hidden');
        elements.btnParar.classList.remove('hidden');
        elements.btnParar.disabled = true; // Desabilitado inicialmente
        elements.btnParar.innerHTML = '<i class="fas fa-clock"></i><span>AGUARDE...</span>';
        console.log('✅ Botões trocados - GIRAR oculto, PARAR visível');
    }
    
    // Adicionar efeitos visuais à roleta
    if (elements.roleta) {
        elements.roleta.classList.remove('parada', 'desacelerando');
        elements.roleta.classList.add('girando');
        console.log('✅ Efeitos visuais aplicados à roleta');
    }
    
    mostrarToast('🎰 A roleta está girando! Aguarde para poder parar...', 'info');
    
    // Iniciar animação da roleta ultra profissional
    iniciarAnimacaoUltraProfissional();
    
    // Habilitar botão parar após tempo mínimo
    setTimeout(() => {
        if (gameState.estadoRoleta === ESTADOS_ROLETA.SPINNING) {
            elements.btnParar.disabled = false;
            elements.btnParar.innerHTML = '<i class="fas fa-stop"></i><span>PARAR</span>';
            mostrarToast('✋ Agora você pode parar a roleta!', 'success');
            console.log('✅ Botão PARAR habilitado');
        }
    }, gameState.tempoMinimoGiro);
    
    // Auto-parar após 10 segundos se o usuário não parar
    gameState.autoStopTimeout = setTimeout(() => {
        if (gameState.estadoRoleta === ESTADOS_ROLETA.SPINNING) {
            console.log('⏰ Auto-parando após 10 segundos');
            pararGiro();
        }
    }, 10000);
}

// Sortear prêmio baseado nas probabilidades
function sortearPremio() {
    const totalPeso = premiosPossiveis.reduce((total, premio) => total + premio.peso, 0);
    const random = Math.random() * totalPeso;
    
    let acumulado = 0;
    for (let i = 0; i < premiosPossiveis.length; i++) {
        acumulado += premiosPossiveis[i].peso;
        if (random <= acumulado) {
            return premiosPossiveis[i];
        }
    }
    
    // Fallback
    return premiosPossiveis[0];
}

// Encontrar setor correspondente ao prêmio
function encontrarSetorPorPremio(premio) {
    // Filtrar setores que correspondem ao prêmio
    const setoresValidos = setoresRoleta.filter(setor => 
        setor.premio.valor === premio.valor
    );
    
    // Escolher um setor aleatório entre os válidos
    const indiceAleatorio = Math.floor(Math.random() * setoresValidos.length);
    return setoresValidos[indiceAleatorio];
}

// ULTRA MELHORADO: Calcular ângulo final com precisão máxima
function calcularAnguloFinalProfissional(setor) {
    // Calcular o centro do setor para máxima precisão
    const centroSetor = setor.inicio + (setor.fim - setor.inicio) / 2;
    
    // Adicionar variação mínima para naturalidade (±3 graus)
    const variacao = (Math.random() - 0.5) * 6;
    const anguloNoSetor = centroSetor + variacao;
    
    // Garantir que o ângulo esteja dentro do setor com margem de segurança
    const anguloFinalSetor = Math.max(setor.inicio + 3, Math.min(setor.fim - 3, anguloNoSetor));
    
    // Adicionar voltas completas (4-5 voltas para efeito mais dramático)
    const voltasCompletas = 4 + Math.random(); // 4-5 voltas
    const anguloTotal = (voltasCompletas * 360) + anguloFinalSetor;
    
    console.log(`🎯 Setor: ${setor.inicio}-${setor.fim}°, Centro: ${centroSetor}°, Final: ${anguloFinalSetor}°`);
    
    return anguloTotal;
}

// ===== ANIMAÇÃO ULTRA PROFISSIONAL COM EFEITOS AVANÇADOS =====

// ULTRA MELHORADO: Animação contínua da roleta com controle de precisão máxima
function iniciarAnimacaoUltraProfissional() {
    console.log('🔄 Iniciando animação ultra profissional da roleta');
    
    function animar() {
        if (gameState.estadoRoleta === ESTADOS_ROLETA.SPINNING || gameState.estadoRoleta === ESTADOS_ROLETA.STOPPING) {
            
            if (gameState.estadoRoleta === ESTADOS_ROLETA.STOPPING && !gameState.desacelerando) {
                // Iniciar desaceleração ultra suave
                gameState.desacelerando = true;
                gameState.tempoDesaceleracao = Date.now();
                gameState.anguloInicialDesaceleracao = gameState.anguloAtual;
                gameState.distanciaTotalDesaceleracao = gameState.anguloFinal - gameState.anguloAtual;
                
                if (elements.roleta) {
                    elements.roleta.classList.remove('girando');
                    elements.roleta.classList.add('desacelerando');
                }
                console.log('🛑 Iniciando desaceleração ultra suave profissional');
                console.log(`📐 Ângulo atual: ${gameState.anguloAtual.toFixed(2)}°, Final: ${gameState.anguloFinal.toFixed(2)}°`);
            }
            
            // Calcular nova velocidade e ângulo
            if (gameState.desacelerando) {
                // Calcular progresso da desaceleração (0 a 1)
                const tempoDecorrido = Date.now() - gameState.tempoDesaceleracao;
                const progresso = Math.min(tempoDecorrido / gameState.duracaoDesaceleracao, 1);
                
                if (progresso >= 1) {
                    // Desaceleração completa, aplicar ajuste final ultra preciso
                    if (!gameState.ajusteFinalAtivo) {
                        gameState.ajusteFinalAtivo = true;
                        aplicarAjusteFinalUltraPreciso();
                        return;
                    } else {
                        // Finalizar no ângulo exato
                        gameState.anguloAtual = gameState.anguloFinal;
                        finalizarGiro();
                        return;
                    }
                } else {
                    // Aplicar curva de desaceleração ultra suave com múltiplas fases
                    let fatorEasing;
                    
                    if (progresso < 0.7) {
                        // Primeira fase: desaceleração suave
                        fatorEasing = easeOutCubic(progresso / 0.7);
                    } else if (progresso < 0.9) {
                        // Segunda fase: desaceleração mais acentuada
                        const progressoFase2 = (progresso - 0.7) / 0.2;
                        fatorEasing = 0.7 + (easeOutQuart(progressoFase2) * 0.25);
                    } else {
                        // Terceira fase: aproximação final ultra suave
                        const progressoFase3 = (progresso - 0.9) / 0.1;
                        fatorEasing = 0.95 + (easeOutExpo(progressoFase3) * 0.05);
                    }
                    
                    // Calcular novo ângulo usando interpolação ultra suave
                    const novoAngulo = gameState.anguloInicialDesaceleracao + 
                                     (gameState.distanciaTotalDesaceleracao * fatorEasing);
                    
                    gameState.anguloAtual = novoAngulo;
                    
                    // Calcular velocidade atual para efeitos visuais
                    const velocidadeNormalizada = Math.pow(1 - progresso, 2.5);
                    gameState.velocidadeAtual = gameState.velocidadeInicial * velocidadeNormalizada;
                    gameState.momentumAtual = gameState.velocidadeAtual;
                }
            } else {
                // Giro normal com resistência natural
                gameState.momentumAtual *= gameState.resistenciaBase;
                gameState.velocidadeAtual = Math.max(gameState.momentumAtual, gameState.velocidadeMinima);
                gameState.anguloAtual += gameState.velocidadeAtual;
            }
            
            // Aplicar rotação com efeitos visuais avançados
            aplicarEfeitosVisuaisAvancados();
            
            gameState.animationId = requestAnimationFrame(animar);
        }
    }
    
    gameState.animationId = requestAnimationFrame(animar);
}

// NOVO: Aplicar efeitos visuais avançados durante a rotação
function aplicarEfeitosVisuaisAvancados() {
    if (!elements.roleta) return;
    
    // Aplicar rotação principal
    elements.roleta.style.transform = `rotate(${gameState.anguloAtual}deg)`;
    
    // Calcular intensidade dos efeitos baseada na velocidade
    const intensidadeVelocidade = Math.min(gameState.velocidadeAtual / gameState.velocidadeInicial, 1);
    
    // Efeito de brilho dinâmico
    const brilho = 1 + (intensidadeVelocidade * 0.5);
    const saturacao = 1 + (intensidadeVelocidade * 0.6);
    const contraste = 1 + (intensidadeVelocidade * 0.3);
    
    // Efeito de blur sutil durante alta velocidade
    const blur = intensidadeVelocidade > 0.7 ? (intensidadeVelocidade - 0.7) * 2 : 0;
    
    // Aplicar filtros combinados
    const filtro = `brightness(${brilho}) saturate(${saturacao}) contrast(${contraste}) blur(${blur}px)`;
    elements.roleta.style.filter = filtro;
    
    // Efeito de sombra dinâmica
    const intensidadeSombra = intensidadeVelocidade * 20;
    const corSombra = `rgba(255, 215, 0, ${intensidadeVelocidade * 0.4})`;
    elements.roleta.style.boxShadow = `0 0 ${intensidadeSombra}px ${corSombra}`;
    
    // Animação do ponteiro baseada na velocidade
    if (elements.roletaPointer) {
        const escalaPointer = 1 + (intensidadeVelocidade * 0.2);
        const rotacaoPointer = Math.sin(Date.now() * 0.01) * intensidadeVelocidade * 5;
        elements.roletaPointer.style.transform = `scale(${escalaPointer}) rotate(${rotacaoPointer}deg)`;
    }
}

// ULTRA MELHORADO: Aplicar ajuste final para precisão máxima com efeito de mola
function aplicarAjusteFinalUltraPreciso() {
    console.log('🎯 Aplicando ajuste final ultra preciso com efeito de mola...');
    
    const diferencaAngular = gameState.anguloFinal - gameState.anguloAtual;
    const distanciaAjuste = Math.abs(diferencaAngular);
    
    console.log(`📐 Diferença angular: ${diferencaAngular.toFixed(2)}°`);
    
    if (distanciaAjuste <= gameState.margemErroAngulo) {
        // Já está próximo o suficiente, aplicar oscilação final
        if (gameState.oscilacoesFinais) {
            aplicarOscilacaoFinal();
        } else {
            gameState.anguloAtual = gameState.anguloFinal;
            finalizarGiro();
        }
        return;
    }
    
    // Aplicar micro-ajuste ultra suave
    const tempoAjuste = Math.min(800, distanciaAjuste * 15); // Máximo 800ms
    const anguloInicial = gameState.anguloAtual;
    const tempoInicioAjuste = Date.now();
    
    function ajustarPrecisaoUltra() {
        const tempoDecorrido = Date.now() - tempoInicioAjuste;
        const progressoAjuste = Math.min(tempoDecorrido / tempoAjuste, 1);
        
        if (progressoAjuste >= 1) {
            gameState.anguloAtual = gameState.anguloFinal;
            
            // Aplicar oscilação final se habilitada
            if (gameState.oscilacoesFinais) {
                aplicarOscilacaoFinal();
            } else {
                finalizarGiro();
            }
            return;
        }
        
        // Usar easing ultra suave para o ajuste final
        const fatorAjuste = easeOutExpo(progressoAjuste);
        gameState.anguloAtual = anguloInicial + (diferencaAngular * fatorAjuste);
        
        // Aplicar efeitos visuais durante o ajuste
        aplicarEfeitosVisuaisAvancados();
        
        requestAnimationFrame(ajustarPrecisaoUltra);
    }
    
    requestAnimationFrame(ajustarPrecisaoUltra);
}

// NOVO: Aplicar oscilação final para efeito de mola realista
function aplicarOscilacaoFinal() {
    console.log('🌊 Aplicando oscilação final para efeito de mola...');
    
    const anguloBase = gameState.anguloFinal;
    const tempoInicioOscilacao = Date.now();
    
    function oscilar() {
        const tempoDecorrido = Date.now() - tempoInicioOscilacao;
        const progressoOscilacao = Math.min(tempoDecorrido / gameState.tempoOscilacao, 1);
        
        if (progressoOscilacao >= 1) {
            gameState.anguloAtual = anguloBase;
            finalizarGiro();
            return;
        }
        
        // Calcular oscilação com amortecimento
        const fatorAmortecimento = 1 - progressoOscilacao;
        const anguloOscilacao = Math.sin(progressoOscilacao * Math.PI * gameState.frequenciaOscilacao) * 
                               gameState.amplitudeOscilacao * fatorAmortecimento;
        
        gameState.anguloAtual = anguloBase + anguloOscilacao;
        
        // Aplicar rotação com efeito de oscilação
        if (elements.roleta) {
            elements.roleta.style.transform = `rotate(${gameState.anguloAtual}deg)`;
            
            // Efeito visual sutil durante oscilação
            const intensidadeOscilacao = fatorAmortecimento * 0.3;
            elements.roleta.style.filter = `brightness(${1 + intensidadeOscilacao}) saturate(${1 + intensidadeOscilacao})`;
        }
        
        requestAnimationFrame(oscilar);
    }
    
    requestAnimationFrame(oscilar);
}

// Parar giro (chamado pelo botão)
function pararGiro() {
    console.log('🛑 Parando giro com desaceleração ultra profissional...');
    
    if (gameState.estadoRoleta !== ESTADOS_ROLETA.SPINNING) {
        console.log('❌ Não é possível parar agora. Estado:', gameState.estadoRoleta);
        return;
    }
    
    // Limpar o timeout de auto-parada se o usuário parar manualmente
    if (gameState.autoStopTimeout) {
        clearTimeout(gameState.autoStopTimeout);
        gameState.autoStopTimeout = null;
    }

    gameState.estadoRoleta = ESTADOS_ROLETA.STOPPING;
    
    // Atualizar botão com feedback visual melhorado
    if (elements.btnParar) {
        elements.btnParar.disabled = true;
        elements.btnParar.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>PARANDO...</span>';
        elements.btnParar.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)';
    }
    
    mostrarToast('⏳ Aplicando desaceleração ultra suave profissional...', 'warning');
    console.log('✅ Estado alterado para STOPPING - iniciando desaceleração ultra profissional');
}

// Finalizar giro com efeitos ultra melhorados
function finalizarGiro() {
    console.log('🏁 Finalizando giro com efeitos ultra profissionais...');
    
    gameState.estadoRoleta = ESTADOS_ROLETA.STOPPED;
    
    // Parar animação
    if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
        gameState.animationId = null;
    }
    
    // Remover efeitos visuais da roleta
    if (elements.roleta) {
        elements.roleta.classList.remove('girando', 'desacelerando');
        elements.roleta.classList.add('parada');
        
        // Resetar filtros e efeitos
        elements.roleta.style.filter = '';
        elements.roleta.style.boxShadow = '';
        
        // Aplicar efeito de destaque final
        setTimeout(() => {
            elements.roleta.style.filter = 'brightness(1.3) saturate(1.5)';
            setTimeout(() => {
                elements.roleta.style.filter = '';
            }, 500);
        }, 100);
    }
    
    // Resetar ponteiro
    if (elements.roletaPointer) {
        elements.roletaPointer.style.transform = '';
        elements.roletaPointer.style.animation = 'pulsePointer 0.5s ease-in-out 3';
    }
    
    // Determinar prêmio baseado no ângulo final
    const premio = determinarPremio(gameState.anguloAtual);
    gameState.saldoAtual += premio.valor;
    
    console.log(`🎉 Prêmio determinado: ${premio.texto} (Ângulo: ${gameState.anguloAtual.toFixed(2)}°)`);
    
    // Resetar botões
    resetarBotoes();
    
    // Mostrar resultado
    mostrarResultado(premio);
}

// Determinar prêmio baseado no ângulo final
function determinarPremio(anguloFinal) {
    // Normalizar ângulo para 0-360
    const anguloNormalizado = anguloFinal % 360;
    
    // Encontrar setor correspondente
    for (let setor of setoresRoleta) {
        if (anguloNormalizado >= setor.inicio && anguloNormalizado < setor.fim) {
            console.log(`🎯 Ângulo ${anguloNormalizado.toFixed(2)}° está no setor ${setor.cor} (${setor.inicio}-${setor.fim}°)`);
            return setor.premio;
        }
    }
    
    // Fallback para o último setor se houver problemas de arredondamento
    return setoresRoleta[setoresRoleta.length - 1].premio;
}

// Mostrar resultado
function mostrarResultado(premio) {
    console.log('🎊 Mostrando resultado:', premio);
    
    // Atualizar modal com informações do prêmio
    if (elements.premioValor) {
        elements.premioValor.textContent = premio.texto;
    }
    
    if (elements.novoSaldo) {
        elements.novoSaldo.textContent = `R$ ${gameState.saldoAtual.toFixed(2)}`;
    }
    
    // Mostrar modal com animação
    if (elements.resultadoModal) {
        elements.resultadoModal.style.display = 'flex';
        elements.resultadoModal.classList.add('show');
    }
    
    // Atualizar interface
    atualizarInterface();
    
    // Efeitos especiais baseados no prêmio
    if (premio.valor > 0) {
        mostrarToast(`🎉 Parabéns! Você ganhou ${premio.texto}!`, 'success');
        criarConfetes();
    } else {
        mostrarToast('😔 Que pena! Tente novamente!', 'error');
    }
}

// Resetar botões para estado inicial
function resetarBotoes() {
    console.log('🔄 Resetando botões para estado inicial');
    
    if (elements.btnGirar && elements.btnParar) {
        elements.btnGirar.classList.remove('hidden');
        elements.btnParar.classList.add('hidden');
        elements.btnParar.disabled = false;
        elements.btnParar.innerHTML = '<i class="fas fa-stop"></i><span>PARAR</span>';
        elements.btnParar.style.background = '';
    }
    
    gameState.estadoRoleta = ESTADOS_ROLETA.IDLE;
    console.log('✅ Estado resetado para IDLE');
}

// Fechar modal
function fecharModal() {
    if (elements.resultadoModal) {
        elements.resultadoModal.classList.remove('show');
        setTimeout(() => {
            elements.resultadoModal.style.display = 'none';
        }, 300);
    }
}

// Atualizar interface
function atualizarInterface() {
    if (elements.girosCount) {
        elements.girosCount.textContent = gameState.girosRestantes;
    }
    
    if (elements.saldoAtual) {
        elements.saldoAtual.textContent = gameState.saldoAtual.toFixed(2);
    }
    
    // Mostrar/ocultar informações de giros
    const girosInfo = document.getElementById('giros-info');
    if (girosInfo) {
        girosInfo.style.display = gameState.girosRestantes > 0 ? 'block' : 'none';
    }
    
    // Atualizar botão principal baseado nos giros restantes
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

// Mostrar toast notification
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
    
    // Animar entrada
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remover automaticamente após 4 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 4000);
    
    // Botão fechar
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

// Criar efeito de confetes
function criarConfetes() {
    const container = document.querySelector('.confetti-container');
    if (!container) return;
    
    for (let i = 0; i < 50; i++) {
        const confete = document.createElement('div');
        confete.className = 'confetti';
        confete.style.left = Math.random() * 100 + '%';
        confete.style.animationDelay = Math.random() * 3 + 's';
        confete.style.backgroundColor = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1'][Math.floor(Math.random() * 4)];
        
        container.appendChild(confete);
        
        // Remover após animação
        setTimeout(() => {
            if (confete.parentNode) {
                confete.parentNode.removeChild(confete);
            }
        }, 3000);
    }
}

// Adicionar CSS para animações ultra profissionais
const style = document.createElement('style');
style.textContent = `
    @keyframes pulsePointer {
        0%, 100% { transform: scale(1) rotate(0deg); }
        50% { transform: scale(1.3) rotate(8deg); }
    }
    
    .confetti {
        position: absolute;
        width: 10px;
        height: 10px;
        top: -10px;
        animation: confettiFall 3s linear forwards;
    }
    
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
    
    .toast {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border-radius: 12px;
        padding: 1rem 1.5rem;
        margin-bottom: 1rem;
        border-left: 4px solid;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 400px;
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
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    /* Efeitos visuais ultra profissionais para a roleta */
    .roleta.girando {
        transition: filter 0.3s ease;
    }
    
    .roleta.desacelerando {
        transition: filter 0.5s ease, box-shadow 0.5s ease;
    }
    
    .roleta.parada {
        transition: all 0.3s ease;
    }
    
    /* Animação suave para mudanças de estado */
    .roleta {
        transition: transform 0.1s linear;
        will-change: transform;
    }
`;
document.head.appendChild(style);

console.log('🎰 RoletaWin - Sistema ultra profissional carregado com sucesso!');

