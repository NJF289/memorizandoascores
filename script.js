// Seleciona todos os botões do jogo
const buttons = document.querySelectorAll('.button');

// Array único de cores para ambos os níveis – cores mais conhecidas sem o preto
const colors = [
  { name: 'vermelho', css: 'red' },
  { name: 'azul', css: 'blue' },
  { name: 'amarelo', css: 'yellow' },
  { name: 'verde', css: 'green' },
  { name: 'laranja', css: 'orange' },
  { name: 'roxo', css: 'purple' },
  { name: 'rosa', css: 'pink' },
  { name: 'cinza', css: 'gray' },
  { name: 'marrom', css: 'brown' }
];

// Variáveis do Nível 1 (Jogo de Memória)
const sequence = [];
let playerSequence = [];
let round = 0;
let currentStep = 0;
let gameOver = false;
let sequencePlaying = false;
let playerName = '';

// Variáveis do Nível 2 (Desafio Final)
let finalPhase = 0; // Será reiniciado para 1 quando o Nível 2 começar
const finalPhasesTotal = 10; // Nível 2 terá 10 fases
let finalCorrectColor = '';

// Função auxiliar para exibir um indicador de nível dinâmico e colorido
function showLevelIndicator(message, callback) {
  const levelIndicator = document.getElementById('levelIndicator');
  levelIndicator.textContent = message;
  levelIndicator.style.display = 'block';
  levelIndicator.style.opacity = 1;
  setTimeout(() => {
    levelIndicator.style.opacity = 0;
    setTimeout(() => {
      levelIndicator.style.display = 'none';
      if (callback) callback();
    }, 1000);
  }, 2000);
}

// Inicia o jogo ao clicar em "Iniciar Jogo"
document.getElementById('startButton').addEventListener('click', () => {
  playerName = document.getElementById('playerName').value;
  if (playerName.trim() !== '') {
    document.querySelector('.input-container').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'flex';
    document.getElementById('playerDisplay').textContent = `Jogador: ${playerName}`;
    
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

// Nível 1 – Jogo de Memória
function nextRound() {
  let randomButton;
  do {
    randomButton = Math.floor(Math.random() * colors.length);
  } while (sequence.includes(randomButton));
  sequence.push(randomButton);
  round++;
  currentStep = 0;
  if (round === 1) {
    showLevelIndicator("NÍVEL 1", playSequence);
  } else {
    playSequence();
  }
}

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
    const color = colors[sequence[i]].css;
    button.style.backgroundColor = color;
    button.classList.add('active');
    setTimeout(() => {
      button.style.backgroundColor = '';
      button.classList.remove('active');
    }, 500);
    i++;
  }, 1000);
}

function checkPlayerMove(index) {
  if (sequencePlaying) return;
  const button = buttons[index];
  const color = colors[index].css;
  button.style.backgroundColor = color;
  button.classList.add('active');
  
  if (sequence[currentStep] === index) {
    currentStep++;
    if (currentStep === sequence.length) {
      currentStep = 0;
      playerSequence = [];
      setTimeout(() => {
        buttons.forEach(button => {
          button.classList.remove('active');
          button.style.backgroundColor = '';
        });
        if (round < 5) {
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

function showGameOverMessage() {
  const confirmation = confirm('Game Over! Deseja reiniciar o jogo? (Ok para continuar, Cancelar para voltar à tela inicial)');
  if (confirmation) {
    resetGame(false);
  } else {
    resetGame(true);
  }
}

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

function showVideoModal() {
  const videoModal = document.getElementById('videoModal');
  const tutorialVideo = document.getElementById('tutorialVideo');
  videoModal.style.display = 'flex';
  tutorialVideo.play();
  const closeVideoButton = document.getElementById('closeVideoButton');
  closeVideoButton.addEventListener('click', () => {
    tutorialVideo.pause();
    tutorialVideo.currentTime = 0;
    videoModal.style.display = 'none';
    nextRound();
  }, { once: true });
}

buttons.forEach((button, index) => {
  button.addEventListener('click', () => {
    if (!gameOver && !sequencePlaying) {
      playerSequence.push(index);
      checkPlayerMove(index);
    }
  });
});

// Transição para o Nível 2
function transitionToFinalLevel() {
  buttons.forEach(button => {
    button.style.transition = "opacity 1s ease";
    button.style.opacity = 0;
  });
  setTimeout(() => {
    buttons.forEach((button, index) => {
      button.style.backgroundColor = colors[index].css;
      button.style.opacity = 1;
      button.textContent = '';
    });
    showLevelIndicator("NÍVEL 2", () => {
      finalPhase = 1; // Reinicia a fase para 1 no Nível 2
      updateFinalPhaseIndicator();
      startFinalLevel();
    });
  }, 1000);
}

// Nível 2 – Desafio Final (usando o array "colors")
function startFinalLevel() {
  buttons.forEach(button => {
    button.style.transition = "opacity 1s ease";
    button.style.opacity = 0;
  });
  setTimeout(() => {
    buttons.forEach((button, index) => {
      button.style.backgroundColor = colors[index].css;
      button.style.opacity = 1;
      button.textContent = '';
    });
    const targetIndex = Math.floor(Math.random() * colors.length);
    finalCorrectColor = colors[targetIndex].name;
    let otherColors = colors.filter(color => color.name !== finalCorrectColor);
    let randomWrongColor = otherColors[Math.floor(Math.random() * otherColors.length)].name;
    buttons[targetIndex].textContent = randomWrongColor;
    
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

function transitionFinalPhase() {
  document.getElementById('finalAnswer').value = '';
  buttons.forEach(button => {
    button.style.transition = "opacity 1s ease";
    button.style.opacity = 0;
  });
  setTimeout(() => {
    buttons.forEach((button, index) => {
      button.style.backgroundColor = colors[index].css;
      button.style.opacity = 1;
      button.textContent = '';
    });
    const targetIndex = Math.floor(Math.random() * colors.length);
    finalCorrectColor = colors[targetIndex].name;
    let otherColors = colors.filter(color => color.name !== finalCorrectColor);
    let randomWrongColor = otherColors[Math.floor(Math.random() * otherColors.length)].name;
    buttons[targetIndex].textContent = randomWrongColor;
  }, 1000);
}

function updateFinalPhaseIndicator() {
  document.getElementById('finalPhaseIndicator').textContent = `Fase ${finalPhase}`;
}

function checkFinalAnswer() {
  const userAnswer = document.getElementById('finalAnswer').value.trim().toLowerCase();
  if (userAnswer === finalCorrectColor.toLowerCase()) {
    finalPhase++;
    if (finalPhase <= finalPhasesTotal) {
      updateFinalPhaseIndicator();
      transitionFinalPhase();
    }
    if (finalPhase > finalPhasesTotal) {
      showLevelIndicator("Você venceu!", () => {
        resetGame(true);
      });
    }
  } else {
    alert("Resposta incorreta. Game Over!");
    resetGame(true);
  }
}

document.getElementById('submitFinalAnswer').addEventListener('click', checkFinalAnswer);
