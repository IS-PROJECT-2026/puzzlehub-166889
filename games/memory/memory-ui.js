// PuzzleHub Memory Match — card grid rendering, flip interaction, and the
// timer/move counter display. Depends on MemoryGame (memory.js) for rules
// and Scoreboard (scoreboard.js) for persisting results.

(() => {
  const FLIP_BACK_DELAY_MS = 800;

  const gridEl = document.getElementById("memory-grid");
  const movesEl = document.getElementById("memory-moves");
  const timerEl = document.getElementById("memory-timer");
  const messageEl = document.getElementById("memory-message");
  const restartBtn = document.getElementById("memory-restart");

  let deck;
  let flippedIndices;
  let moves;
  let locked;
  let timer;
  let tickHandle;

  function renderCard(card, index) {
    const cardEl = document.createElement("div");
    cardEl.className = "memory-card";
    cardEl.dataset.index = String(index);

    const inner = document.createElement("div");
    inner.className = "memory-card-inner";

    const back = document.createElement("div");
    back.className = "memory-card-face back";
    back.textContent = "?";

    const front = document.createElement("div");
    front.className = "memory-card-face front";
    front.textContent = card.value;

    inner.append(back, front);
    cardEl.appendChild(inner);
    cardEl.addEventListener("click", () => handleCardClick(index));
    return cardEl;
  }

  function render() {
    gridEl.innerHTML = "";
    deck.forEach((card, index) => {
      const cardEl = renderCard(card, index);
      if (flippedIndices.includes(index)) cardEl.classList.add("flipped");
      if (card.matched) cardEl.classList.add("matched");
      gridEl.appendChild(cardEl);
    });
    movesEl.textContent = `Moves: ${moves}`;
  }

  function updateTimerDisplay() {
    timerEl.textContent = `Time: ${timer.elapsedSeconds()}s`;
  }

  function finishGame() {
    timer.stop();
    clearInterval(tickHandle);
    updateTimerDisplay();
    messageEl.textContent = `Solved in ${moves} moves and ${timer.elapsedSeconds()}s!`;
    messageEl.classList.add("celebrate");
    if (typeof Scoreboard !== "undefined") {
      Scoreboard.record("memory", { moves, timeSeconds: timer.elapsedSeconds() });
    }
  }

  function handleCardClick(index) {
    if (locked) return;
    if (flippedIndices.includes(index)) return;
    if (deck[index].matched) return;

    if (flippedIndices.length === 0 && timer.elapsedSeconds() === 0) {
      timer.start();
      tickHandle = setInterval(updateTimerDisplay, 1000);
    }

    flippedIndices.push(index);
    render();

    if (flippedIndices.length < 2) return;

    moves += 1;
    locked = true;
    const [first, second] = flippedIndices;
    const result = MemoryGame.evaluateFlip(deck, first, second);

    if (!result.isMatch) {
      [first, second].forEach((i) => {
        const cardEl = gridEl.querySelector(`[data-index="${i}"]`);
        if (cardEl) cardEl.classList.add("mismatch");
      });
    }

    setTimeout(() => {
      deck = result.deck;
      flippedIndices = [];
      locked = false;
      render();
      if (MemoryGame.isGameComplete(deck)) finishGame();
    }, FLIP_BACK_DELAY_MS);
  }

  function restart() {
    clearInterval(tickHandle);
    deck = MemoryGame.createDeck(MemoryGame.DEFAULT_PAIRS);
    flippedIndices = [];
    moves = 0;
    locked = false;
    timer = MemoryGame.createTimer();
    messageEl.textContent = "";
    messageEl.classList.remove("celebrate");
    updateTimerDisplay();
    render();
  }

  restartBtn.addEventListener("click", restart);
  restart();
})();
