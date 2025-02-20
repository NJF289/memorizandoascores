// Seleciona todos os botões do jogo
const buttons = document.querySelectorAll('.button');

// Array de cores: cada objeto contém o nome em português e o valor CSS correspondente
const buttonColors = [
  { name: 'lima', css: 'lime' },
  { name: 'vermelho', css: 'red' },
  { name: 'azul', css: 'blue' },
  { name: 'amarelo', css: 'yellow' },
  { name: 'laranja', css: 'orange' },
  { name: 'roxo', css: 'purple' },
  { name: 'rosa', css: 'pink' },
  { name: 'ciano', css: 'cyan' },
  { name: 'verde', css: 'green' },
  { name: 'marrom', css: 'brown' }
];

// Arrays e variáveis para manter o estado do jogo (nível 1)
const sequence = [];
let playerSequence = [];
let round = 0;
let currentStep = 0;
let gameOver = false;
let sequencePlaying = false;
let playerName = '';

// Variáveis para o nível final (desafio final)
let finalPhase = 0;
const finalPhasesTotal = 3;
let finalCorrectColor = '';

// Define o número máximo de rodadas do jogo de memória antes do desafio final
const maxRounds = 5;

/* FUNÇÃO AUXILIAR: Exibe um indicador de nível dinâmico e colorido.
   O indicador é mostrado por 2 segundos e depois faz fade out.
   Quando a animação termina, chama o callback passado (se houver). */
function showLevelIndicator(message, callback) {
  const levelIndicator = document.getElementById('levelIndicator');
  levelIndicator.textContent = message;
  levelIndicator.style.display = 'block';
  levelIndicator.style.opacity = 1;
  // Após 2 segundos, inicia fade-out
  setTimeout(() => {
    levelIndicator.style.opacity = 0;
    setTimeout(() => {
      levelIndicator.style.display = 'none';
      if (callback) callback();
    }, 1000);
  }, 2000);
}

// EVENTO PARA INICIAR O JOGO
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

// NÍVEL 1 - JOGO DE MEMÓRIA

function nextRound() {
  let randomButton;
  do {
    randomButton = Math.floor(Math.random() * 10);
  } while (sequence.includes(randomButton));
  sequence.push(randomButton);
  round++;
  currentStep = 0;
  // Se for a primeira rodada, mostra "NÍVEL 1" antes de tocar a sequência
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
    const buttonIndex = sequence[i];
    const color = buttonColors[buttonIndex].css;
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
  const color = buttonColors[index].css;
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
  videoModal.style.display = 'flex';
  const tutorialVideo = document.getElementById('tutorialVideo');
  tutorialVideo.play();
  const closeVideoButton = document.getElementById('closeVideoButton');
  closeVideoButton.addEventListener('click', () => {
    videoModal.style.display = 'none';
    nextRound();
  });
}

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
  buttons.forEach(button => {
    button.style.transition = "opacity 1s ease";
    button.style.opacity = 0;
  });
  setTimeout(() => {
    buttons.forEach((button, index) => {
      button.style.backgroundColor = buttonColors[index].css;
      button.style.opacity = 1;
      button.textContent = '';
    });
    showLevelIndicator("NÍVEL 2", () => {
      finalPhase = 0;
      startFinalLevel();
    });
  }, 1000);
}

// NÍVEL 2 - DESAFIO FINAL

function startFinalLevel() {
  buttons.forEach(button => {
    button.style.transition = "opacity 1s ease";
    button.style.opacity = 0;
  });
  setTimeout(() => {
    buttons.forEach((button, index) => {
      button.style.backgroundColor = buttonColors[index].css;
      button.style.opacity = 1;
      button.textContent = '';
    });
    const targetIndex = Math.floor(Math.random() * 10);
    finalCorrectColor = buttonColors[targetIndex].name;
    let otherColors = buttonColors.filter(color => color.name !== finalCorrectColor);
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
      button.style.backgroundColor = buttonColors[index].css;
      button.style.opacity = 1;
      button.textContent = '';
    });
    const targetIndex = Math.floor(Math.random() * 10);
    finalCorrectColor = buttonColors[targetIndex].name;
    let otherColors = buttonColors.filter(color => color.name !== finalCorrectColor);
    let randomWrongColor = otherColors[Math.floor(Math.random() * otherColors.length)].name;
    buttons[targetIndex].textContent = randomWrongColor;
  }, 1000);
}

function checkFinalAnswer() {
  const userAnswer = document.getElementById('finalAnswer').value.trim().toLowerCase();
  if (userAnswer === finalCorrectColor.toLowerCase()) {
    finalPhase++;
    if (finalPhase < finalPhasesTotal) {
      transitionFinalPhase();
    } else {
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
