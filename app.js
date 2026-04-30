const buildTimeNodes = document.querySelectorAll('#buildTime');
const currentPage = document.body.dataset.page;

buildTimeNodes.forEach((node) => {
  const now = new Date();
  node.textContent = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
});

document.querySelectorAll('[data-nav]').forEach((link) => {
  if (link.dataset.nav === currentPage) {
    link.classList.add('active');
  }
});

if (currentPage === 'home') {
  const GAME_DURATION = 30;
  const BEST_SCORE_KEY = 'openclaw-pulse-tap-best';

  const scoreValue = document.querySelector('#scoreValue');
  const timeValue = document.querySelector('#timeValue');
  const bestValue = document.querySelector('#bestValue');
  const target = document.querySelector('#target');
  const arena = document.querySelector('#gameArena');
  const overlay = document.querySelector('#gameOverlay');
  const statusText = document.querySelector('#statusText');
  const startButton = document.querySelector('#startGame');
  const resetButton = document.querySelector('#resetGame');

  let score = 0;
  let timeLeft = GAME_DURATION;
  let bestScore = Number.parseInt(localStorage.getItem(BEST_SCORE_KEY) || '0', 10);
  let timerId = null;
  let gameActive = false;

  bestValue.textContent = String(bestScore);
  target.disabled = true;

  const renderStats = () => {
    scoreValue.textContent = String(score);
    timeValue.textContent = String(timeLeft);
    bestValue.textContent = String(bestScore);
  };

  const moveTarget = () => {
    const arenaRect = arena.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const maxX = Math.max(arenaRect.width - targetRect.width - 12, 0);
    const maxY = Math.max(arenaRect.height - targetRect.height - 12, 0);
    const nextX = Math.round(Math.random() * maxX);
    const nextY = Math.round(Math.random() * maxY);
    target.style.left = `${nextX}px`;
    target.style.top = `${nextY}px`;
  };

  const finishGame = () => {
    gameActive = false;
    target.disabled = true;
    arena.classList.remove('is-active');
    overlay.hidden = false;
    startButton.textContent = '再来一局';

    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
      statusText.textContent = `时间到！你拿到了 ${score} 分，新的最高分诞生啦。`;
    } else {
      statusText.textContent = `时间到！你拿到了 ${score} 分，再试一次冲击 ${bestScore} 分吧。`;
    }

    renderStats();
  };

  const resetGameState = (message = '点击“开始游戏”后，能量球会随机跳动。') => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }

    gameActive = false;
    score = 0;
    timeLeft = GAME_DURATION;
    target.disabled = true;
    arena.classList.remove('is-active');
    overlay.hidden = false;
    statusText.textContent = message;
    startButton.textContent = '开始游戏';
    renderStats();
    moveTarget();
  };

  const startGame = () => {
    if (timerId) {
      clearInterval(timerId);
    }

    score = 0;
    timeLeft = GAME_DURATION;
    gameActive = true;
    target.disabled = false;
    arena.classList.add('is-active');
    overlay.hidden = true;
    startButton.textContent = '游戏进行中';
    statusText.textContent = '游戏进行中';
    renderStats();
    moveTarget();

    timerId = window.setInterval(() => {
      timeLeft -= 1;
      renderStats();

      if (timeLeft <= 0) {
        clearInterval(timerId);
        timerId = null;
        finishGame();
      }
    }, 1000);
  };

  startButton?.addEventListener('click', () => {
    if (!gameActive) {
      startGame();
    }
  });

  resetButton?.addEventListener('click', () => {
    resetGameState('已重置，准备好后再开始一局。');
  });

  target?.addEventListener('click', () => {
    if (!gameActive) {
      return;
    }

    score += 1;
    renderStats();
    moveTarget();
  });

  window.addEventListener('resize', () => {
    moveTarget();
  });

  resetGameState();
}
