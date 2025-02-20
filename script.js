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

// Variáveis para o nível final (desafio Stroop modificado)
let finalPhase = 0;
const finalPhasesTotal = 3;
let finalCorrectColor = '';

// Define o número máximo de rodadas do jogo de memória (nível 1) antes do desafio final
const maxRounds = 5;

// Array de cores em português (10 cores)
const buttonColors = [
  'lima', 'vermelho', 'azul', 'amarelo', 'laranja',
  'roxo', 'rosa', 'ciano', 'verde', 'marrom'
];

// Evento para iniciar o jogo
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

// Função para iniciar a próxima rodada da memória (nível 1)
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

// Função para tocar a sequência de botões (nível 1)
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
    }, 500); // Mantém o botão aceso por 0.5 segundos
    i++;
  }, 1000); // Intervalo de 1 segundo
}

// Função para checar a jogada do jogador (nível 1)
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
        // Se ainda não atingiu o máximo de rodadas, continua o jogo de memória;
        // caso contrário, inicia a transição para o nível final.
        if (round < maxRounds) {
          nextRound();
        } else {
          transitionToFinalLevel();
        }
      }, 1000);
    }
  } else {
    gameOver = true;
    showGameOverMessage();
  }
}

// Função para mostrar mensagem de fim de jogo (game over)
function showGameOverMessage() {
  const confirmation = confirm('Game Over! Deseja reiniciar o jogo? (Ok para continuar, Cancelar para voltar à tela inicial)');
  if (confirmation) {
    resetGame(false);
  } else {
    resetGame(true);
  }
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
  finalPhase = 0;
  buttons.forEach(button => {
    button.classList.remove('active');
    button.style.backgroundColor = '';
    button.textContent = '';
  });
  document.getElementById('finalLevel').style.display = 'none';
  document.getElementById('finalLevel').classList.remove('show');
  document.getElementById('finalAnswer').value = '';
  
  if (backToStart) {
    document.querySelector('.input-container').style.display = 'flex';
    document.getElementById('gameContainer').style.display = 'none';
  } else {
    nextRound();
  }
}

// Função para mostrar o modal de vídeo tutorial
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

// Evento de clique para cada botão do jogo (nível 1)
buttons.forEach((button, index) => {
  button.addEventListener('click', () => {
    if (!gameOver && !sequencePlaying) {
      playerSequence.push(index);
      checkPlayerMove(index);
    }
  });
});


// TRANSIÇÃO PARA O NÍVEL FINAL

function transitionToFinalLevel() {
  // Aplica efeito de fade out nos botões
  buttons.forEach(button => {
    button.style.transition = "opacity 1s ease";
    button.style.opacity = 0;
  });
  setTimeout(() => {
    // Reinicia os botões para exibir suas cores reais
    buttons.forEach((button, index) => {
      button.style.backgroundColor = buttonColors[index];
      button.style.opacity = 1;
      button.textContent = ''; // Limpa qualquer texto anterior
    });
    // Inicia a primeira fase do nível final
    finalPhase = 0;
    startFinalLevel();
  }, 1000);
}

// FUNÇÕES DO NÍVEL FINAL

// Inicia uma fase do desafio final (nível 2)
function startFinalLevel() {
  // Aplica transição (fade) aos botões se necessário
  buttons.forEach(button => {
    button.style.transition = "opacity 1s ease";
    button.style.opacity = 0;
  });
  setTimeout(() => {
    // Exibe todas as cores e limpa textos anteriores
    buttons.forEach((button, index) => {
      button.style.backgroundColor = buttonColors[index];
      button.style.opacity = 1;
      button.textContent = '';
    });
    // Seleciona um botão aleatório para exibir o nome incorreto
    const targetIndex = Math.floor(Math.random() * 10);
    finalCorrectColor = buttonColors[targetIndex];
    // Escolhe um nome de cor diferente (em português)
    let otherColors = buttonColors.filter(color => color !== finalCorrectColor);
    let randomWrongColor = otherColors[Math.floor(Math.random() * otherColors.length)];
    buttons[targetIndex].textContent = randomWrongColor;
    
    // Exibe o bloco do desafio final com efeito fade-in
    const finalDiv = document.getElementById('finalLevel');
    finalDiv.style.display = 'flex';
    finalDiv.style.opacity = 0;
    finalDiv.style.transition = "opacity 1s ease";
    setTimeout(() => {
      finalDiv.classList.add('show');
      finalDiv.style.opacity = 1;
    }, 10);
  }, 1000);
}

// Função para transição entre fases do nível final
function transitionFinalPhase() {
  // Limpa o campo de resposta
  document.getElementById('finalAnswer').value = '';
  // Aplica fade-out nos botões
  buttons.forEach(button => {
    button.style.transition = "opacity 1s ease";
    button.style.opacity = 0;
  });
  setTimeout(() => {
    // Reinicia os botões para nova fase do desafio final
    buttons.forEach((button, index) => {
      button.style.backgroundColor = buttonColors[index];
      button.style.opacity = 1;
      button.textContent = '';
    });
    const targetIndex = Math.floor(Math.random() * 10);
    finalCorrectColor = buttonColors[targetIndex];
    let otherColors = buttonColors.filter(color => color !== finalCorrectColor);
    let randomWrongColor = otherColors[Math.floor(Math.random() * otherColors.length)];
    buttons[targetIndex].textContent = randomWrongColor;
  }, 1000);
}

// Função para checar a resposta do desafio final
function checkFinalAnswer() {
  const userAnswer = document.getElementById('finalAnswer').value.trim().toLowerCase();
  if (userAnswer === finalCorrectColor.toLowerCase()) {
    finalPhase++;
    if (finalPhase < finalPhasesTotal) {
      alert("Resposta correta! Próxima fase final.");
      transitionFinalPhase();
    } else {
      alert("Parabéns! Você venceu o jogo!");
      resetGame(true);
    }
  } else {
    alert("Resposta incorreta. Game Over!");
    resetGame(true);
  }
}

// Evento para o botão de envio do desafio final
document.getElementById('submitFinalAnswer').addEventListener('click', checkFinalAnswer);
