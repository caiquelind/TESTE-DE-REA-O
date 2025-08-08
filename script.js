document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos do DOM ---
    const lights = document.querySelectorAll('.light');
    const reactionArea = document.getElementById('reaction-area');
    const message = document.getElementById('message');
    const startButton = document.getElementById('startButton');
    const leaderboardBody = document.getElementById('leaderboard-body');
    const clearButton = document.getElementById('clearButton');

    // --- Estado do Jogo ---
    let state = 'waiting'; // Estados: waiting, lights, go
    let gameTimer = null;
    let startTime = 0;

    // --- Funções Principais ---

    const startGame = () => {
        state = 'lights';
        message.textContent = 'Prepare-se...';
        startButton.disabled = true;

        // Resetar luzes
        lights.forEach(light => light.classList.remove('on'));
        reactionArea.classList.remove('go');

        // Ligar luzes em sequência
        const lightOnDelay = 650; // ms
        for (let i = 0; i < lights.length; i++) {
            setTimeout(() => {
                if (state === 'lights') lights[i].classList.add('on');
            }, (i + 1) * lightOnDelay);
        }

        // --- ALTERAÇÃO PRINCIPAL AQUI ---
        // Agendar o "VAI!" com um atraso muito mais variável
        // Atraso entre 0.2 segundos (instantâneo) e 5 segundos (demorado)
        const randomGoDelay = Math.random() * 4800 + 200; 
        
        const totalLightTime = lights.length * lightOnDelay;
        
        gameTimer = setTimeout(() => {
            if (state === 'lights') {
                state = 'go';
                lights.forEach(light => light.classList.remove('on'));
                reactionArea.classList.add('go');
                message.textContent = 'REAJAM!';
                startTime = Date.now();
            }
        }, totalLightTime + randomGoDelay);
    };
    
    const handleReaction = () => {
        if (state === 'lights') {
            // Queimou a largada
            clearTimeout(gameTimer);
            message.textContent = 'Queimou a Largada!';
            saveScore(null); // Salva como "Queimada"
            endRound();
        } else if (state === 'go') {
            // Reação bem-sucedida
            const reactionTime = Date.now() - startTime;
            message.textContent = `${reactionTime} ms`;
            saveScore(reactionTime);
            endRound();
        }
    };
    
    const endRound = () => {
        state = 'waiting';
        startButton.disabled = false;
    }

    // --- Lógica da Tabela de Tempos ---

    const saveScore = (time) => {
        const scores = JSON.parse(localStorage.getItem('f1ReactionTimes')) || [];
        const newScore = {
            time: time,
            date: new Date().toLocaleDateString('pt-BR')
        };
        scores.push(newScore);
        
        // Ordena por tempo (menor para maior), com "Queimadas" no final
        scores.sort((a, b) => {
            if (a.time === null) return 1;
            if (b.time === null) return -1;
            return a.time - b.time;
        });

        localStorage.setItem('f1ReactionTimes', JSON.stringify(scores));
        loadLeaderboard();
    };

    const loadLeaderboard = () => {
        const scores = JSON.parse(localStorage.getItem('f1ReactionTimes')) || [];
        leaderboardBody.innerHTML = ''; // Limpa a tabela antes de recarregar
        
        scores.forEach((score, index) => {
            const row = document.createElement('tr');
            const timeCellContent = score.time === null ? '<span style="color: #ff4d4d;">Queimada</span>' : score.time;
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${timeCellContent}</td>
                <td>${score.date}</td>
            `;
            leaderboardBody.appendChild(row);
        });
    };
    
    const clearLeaderboard = () => {
        if (confirm('Tem certeza que deseja apagar todos os tempos?')) {
            localStorage.removeItem('f1ReactionTimes');
            loadLeaderboard();
        }
    };

    // --- Event Listeners ---
    startButton.addEventListener('click', startGame);
    reactionArea.addEventListener('click', handleReaction);
    clearButton.addEventListener('click', clearLeaderboard);

    // Carregar a tabela de classificação ao iniciar a página
    loadLeaderboard();
});
