// PuzzleHub 2048 — board rendering, keyboard + swipe controls, and score
// display. Depends on Game2048 (2048.js) for rules and Scoreboard
// (scoreboard.js) for persisting results.

(() => {
  const DIRECTION_KEYS = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
  };
  const SWIPE_THRESHOLD = 30; // px

  const boardEl = document.getElementById("g2048-board");
  const scoreEl = document.getElementById("g2048-score");
  const messageEl = document.getElementById("g2048-message");
  const restartBtn = document.getElementById("g2048-restart");

  let grid;
  let score;
  let hasWon;
  let gameOver;

  function render() {
    boardEl.innerHTML = "";
    grid.forEach((row) => {
      row.forEach((value) => {
        const tile = document.createElement("div");
        tile.className = "g2048-tile";
        tile.dataset.value = String(value);
        tile.textContent = value === 0 ? "" : String(value);
        boardEl.appendChild(tile);
      });
    });
    scoreEl.textContent = `Score: ${score}`;
  }

  function finishGame() {
    gameOver = true;
    messageEl.textContent = hasWon
      ? `Game over — final score ${score} (you reached 2048!).`
      : `Game over — final score ${score}.`;
    if (typeof Scoreboard !== "undefined") {
      Scoreboard.record("2048", { score, won: hasWon });
    }
  }

  function applyMove(direction) {
    if (gameOver) return;

    const result = Game2048.move(grid, direction);
    if (!result.moved) return;

    grid = result.grid;
    score += result.scoreGained;
    Game2048.addRandomTile(grid);
    render();

    if (result.scoreGained > 0) {
      scoreEl.classList.remove("bump");
      void scoreEl.offsetWidth; // restart the animation even on consecutive merges
      scoreEl.classList.add("bump");
    }

    if (!hasWon && Game2048.hasWon(grid)) {
      hasWon = true;
      messageEl.textContent = "You reached 2048! Keep going for a higher score.";
      messageEl.classList.add("celebrate");
    }

    if (Game2048.isGameOver(grid)) {
      finishGame();
    }
  }

  function handleKeydown(event) {
    const direction = DIRECTION_KEYS[event.key];
    if (!direction) return;
    event.preventDefault();
    applyMove(direction);
  }

  let touchStartX = 0;
  let touchStartY = 0;

  function handleTouchStart(event) {
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }

  function handleTouchEnd(event) {
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;

    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      applyMove(dx > 0 ? "right" : "left");
    } else {
      applyMove(dy > 0 ? "down" : "up");
    }
  }

  function restart() {
    grid = Game2048.createGrid();
    score = 0;
    hasWon = false;
    gameOver = false;
    messageEl.textContent = "";
    messageEl.classList.remove("celebrate");
    scoreEl.classList.remove("bump");
    Game2048.addRandomTile(grid);
    Game2048.addRandomTile(grid);
    render();
  }

  document.addEventListener("keydown", handleKeydown);
  boardEl.addEventListener("touchstart", handleTouchStart, { passive: true });
  boardEl.addEventListener("touchend", handleTouchEnd, { passive: true });
  restartBtn.addEventListener("click", restart);

  restart();
})();
