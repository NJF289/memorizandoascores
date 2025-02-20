// Seleciona todos os botões do jogo
const buttons = document.querySelectorAll('.button');

// Arrays e variáveis para manter o estado do jogo
const sequence = [];
let playerSequence = [];
let round = 0;
let currentStep = 0;
let gameOver = false;
let sequencePlaying = false;
let playerName = '';

// Array de cores para os botões (10 cores)
const buttonColors = [
    'lime', 'red', 'blue', 'yellow', 'orange', 
    'purple', 'pink', 'cyan', 'green', 'brown'
];

// Adiciona evento de clique no botão de iniciar o jogo
document.getElementById('startButton').addEventListener('click', () => {
    playerName = document.getElementById('playerName').value;
    if (playerName.trim() !== '') {
        document.querySelector('.input-container').style.display = 'none';
        document.getElementById('gameContainer').style.display = 'flex';
        document.getElementById('playerDisplay').textContent = `Jogador: ${playerName}`;
        
        // Mostra o vídeo tutorial na primeira vez que o jogo é aberto
        if (!sessionStorage.getItem('tutorialShown')) {
            showVideoModal();
            sessionStorage.setItem('tutorialShown', 'true');
        } else {
            nextRound();
        }
    } else {
        alert('Por favor, digite seu nome.');
    }
});

// Função para iniciar a próxima rodada
function nextRound() {
    let randomButton;
    // Gera um novo botão aleatório que ainda não esteja na sequência
    do {
        randomButton = Math.floor(Math.random() * 10);
    } while (sequence.includes(randomButton));
    sequence.push(randomButton);
    round++;
    currentStep = 0;
    playSequence();
}

// Função para tocar a sequência de botões
function playSequence() {
    document.getElementById('message').textContent = `Fase ${round}`;
    sequencePlaying = true;
    let i = 0;
    const interval = setInterval(() => {
        if (i >= sequence.length) {
            clearInterval(interval);
            sequencePlaying = false;
            return;
        }
        const button = buttons[sequence[i]];
        const buttonIndex = sequence[i];
        const color = buttonColors[buttonIndex];
        button.style.backgroundColor = color;
        button.classList.add('active');
        setTimeout(() => {
            button.style.backgroundColor = '';
            button.classList.remove('active');
        }, 500); // Mantenha o botão aceso por 0.5 segundos
        i++;
    }, 1000); // Intervalo de 1 segundo
}

// Função para checar a jogada do jogador
function checkPlayerMove(index) {
    if (sequencePlaying) return;
    const button = buttons[index];
    const color = buttonColors[index];
    button.style.backgroundColor = color;
    button.classList.add('active');
    
    if (sequence[currentStep] === index) {
        currentStep++;
        if (currentStep === sequence.length) {
            currentStep = 0;
            playerSequence = [];
            updatePerformanceTable();
            setTimeout(() => {
                buttons.forEach(button => {
                    button.classList.remove('active');
                    button.style.backgroundColor = '';
                });
                nextRound();
            }, 1000);
        }
    } else {
        gameOver = true;
        showGameOverMessage();
    }
}

// Função para mostrar mensagem de fim de jogo
function showGameOverMessage() {
    const confirmation = confirm('Game Over! Deseja reiniciar o jogo? (Ok para continuar, Cancelar para voltar à tela inicial e exportar o desempenho)');
    if (confirmation) {
        resetGame(false);
    } else {
        exportPerformanceCSV();
        clearPerformanceTable();
        resetGame(true);
    }
}

// Função para exportar a tabela de desempenho para um arquivo CSV
function exportPerformanceCSV() {
    const table = document.getElementById('performanceTable');
    let csvContent = 'Rodada,Data\n';
    for (let i = 1; i < table.rows.length; i++) {
        let rowData = [];
        for (let cell of table.rows[i].cells) {
            rowData.push(cell.textContent);
        }
        csvContent += rowData.join(',') + '\n';
    }
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${playerName}_desempenho.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// Função para atualizar a tabela de desempenho
function updatePerformanceTable() {
    const tableBody = document.getElementById('performanceTable').querySelector('tbody');
    const newRow = document.createElement('tr');
    const roundCell = document.createElement('td');
    const dateCell = document.createElement('td');

    const now = new Date();
    const date = now.toLocaleDateString();

    roundCell.textContent = round;
    dateCell.textContent = date;

    newRow.appendChild(roundCell);
    newRow.appendChild(dateCell);
    tableBody.appendChild(newRow);
}

// Função para resetar o jogo
function resetGame(backToStart) {
    sequence.length = 0;
    playerSequence.length = 0;
    round = 0;
    currentStep = 0;
    gameOver = false;
    sequencePlaying = false;
    buttons.forEach(button => {
        button.classList.remove('active');
        button.style.backgroundColor = '';
    });
    if (backToStart) {
        document.querySelector('.input-container').style.display = 'flex';
        document.getElementById('gameContainer').style.display = 'none';
    } else {
        nextRound();
    }
}

// Função para limpar a tabela de desempenho
function clearPerformanceTable() {
    const tableBody = document.getElementById('performanceTable').querySelector('tbody');
    while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.firstChild);
    }
}

// Função para mostrar o modal de vídeo
function showVideoModal() {
    const videoModal = document.getElementById('videoModal');
    videoModal.style.display = 'flex';
    const tutorialVideo = document.getElementById('tutorialVideo');
    tutorialVideo.play();
    const closeVideoButton = document.getElementById('closeVideoButton');
    closeVideoButton.addEventListener('click', () => {
        videoModal.style.display = 'none';
        nextRound();
    });
}

// Adiciona evento de clique para cada botão do jogo
buttons.forEach((button, index) => {
    button.addEventListener('click', () => {
        if (!gameOver && !sequencePlaying) {
            playerSequence.push(index);
            checkPlayerMove(index);
        }
    });
});

// Adiciona evento de clique para exportar o desempenho
document.getElementById('exportButton').addEventListener('click', () => {
    exportPerformanceCSV();
});
