// PuzzleHub Wordle — grid rendering, keyboard input, and color feedback.
// Depends on WordleGame (wordle.js) for rules and Scoreboard (scoreboard.js)
// for persisting results.

(() => {
  const KEY_ROWS = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["enter", "z", "x", "c", "v", "b", "n", "m", "back"],
  ];
  const STATE_RANK = { absent: 0, present: 1, correct: 2 };

  const gridEl = document.getElementById("wordle-grid");
  const keyboardEl = document.getElementById("wordle-keyboard");
  const messageEl = document.getElementById("wordle-message");

  const answer = WordleGame.pickWord();
  let currentGuess = "";
  let row = 0;
  let gameOver = false;
  const keyStates = {};

  function buildGrid() {
    for (let r = 0; r < WordleGame.MAX_GUESSES; r++) {
      const rowEl = document.createElement("div");
      rowEl.className = "wordle-row";
      for (let c = 0; c < WordleGame.WORD_LENGTH; c++) {
        const tile = document.createElement("div");
        tile.className = "wordle-tile";
        tile.id = `tile-${r}-${c}`;
        rowEl.appendChild(tile);
      }
      gridEl.appendChild(rowEl);
    }
  }

  function buildKeyboard() {
    KEY_ROWS.forEach((keys) => {
      const rowEl = document.createElement("div");
      rowEl.className = "wordle-keyboard-row";
      keys.forEach((key) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.id = `key-${key}`;
        btn.className = "wordle-key" + (key === "enter" || key === "back" ? " wide" : "");
        btn.textContent = key === "back" ? "⌫" : key === "enter" ? "Enter" : key;
        btn.addEventListener("click", () => handleKey(key));
        rowEl.appendChild(btn);
      });
      keyboardEl.appendChild(rowEl);
    });
  }

  function setMessage(text) {
    messageEl.textContent = text;
  }

  function updateCurrentRow() {
    for (let c = 0; c < WordleGame.WORD_LENGTH; c++) {
      const tile = document.getElementById(`tile-${row}-${c}`);
      const letter = currentGuess[c] || "";
      tile.textContent = letter;
      tile.classList.toggle("filled", Boolean(letter));
    }
  }

  function paintKeyboard(letter, state) {
    const current = keyStates[letter];
    if (current !== undefined && STATE_RANK[current] >= STATE_RANK[state]) return;
    keyStates[letter] = state;
    const btn = document.getElementById(`key-${letter}`);
    if (!btn) return;
    btn.classList.remove("correct", "present", "absent");
    btn.classList.add(state);
  }

  function submitGuess() {
    const validation = WordleGame.validateGuess(currentGuess);
    if (!validation.ok) {
      setMessage(validation.reason);
      return;
    }

    const states = WordleGame.evaluateGuess(currentGuess, answer);
    states.forEach((state, c) => {
      const tile = document.getElementById(`tile-${row}-${c}`);
      tile.classList.add("flip");
      setTimeout(() => {
        tile.classList.remove("flip");
        tile.classList.add(state);
      }, 150);
      paintKeyboard(currentGuess[c], state);
    });

    const won = WordleGame.isWin(states);
    const isLastRow = row === WordleGame.MAX_GUESSES - 1;

    if (won || isLastRow) {
      gameOver = true;
      setMessage(won ? "You got it! 🎉" : `Out of guesses — the word was "${answer}".`);
      if (typeof Scoreboard !== "undefined") {
        Scoreboard.record("wordle", { won, guesses: row + 1 });
      }
    } else {
      setMessage("");
    }

    row += 1;
    currentGuess = "";
  }

  function handleKey(key) {
    if (gameOver) return;

    if (key === "enter") {
      if (currentGuess.length === WordleGame.WORD_LENGTH) submitGuess();
      else setMessage(`Guess must be ${WordleGame.WORD_LENGTH} letters.`);
      return;
    }

    if (key === "back") {
      currentGuess = currentGuess.slice(0, -1);
      updateCurrentRow();
      return;
    }

    if (/^[a-z]$/.test(key) && currentGuess.length < WordleGame.WORD_LENGTH) {
      currentGuess += key;
      updateCurrentRow();
    }
  }

  function handlePhysicalKeydown(event) {
    if (event.key === "Enter") handleKey("enter");
    else if (event.key === "Backspace") handleKey("back");
    else if (/^[a-zA-Z]$/.test(event.key)) handleKey(event.key.toLowerCase());
  }

  buildGrid();
  buildKeyboard();
  document.addEventListener("keydown", handlePhysicalKeydown);
})();
