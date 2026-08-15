// PuzzleHub Wordle — game logic (word list, guess validation, letter-state
// evaluation). The UI/keyboard input that consumes this lands in issue #6.
//
// Depends on WORDLE_VALID_WORDS (words.js) being loaded first: it's the
// ~14.8k-word dictionary that guesses are checked against. ANSWERS below
// is a much smaller curated pool the *secret* word is drawn from, so
// answers stay common and guessable while almost any real word is
// accepted as a guess.

const WordleGame = (() => {
  const WORD_LENGTH = 5;
  const MAX_GUESSES = 6;

  // Set for O(1) lookups — words.js loads first and defines this global.
  const VALID_WORDS = typeof WORDLE_VALID_WORDS !== "undefined" ? new Set(WORDLE_VALID_WORDS) : null;

  const ANSWERS = [
    "crane", "slate", "pride", "ghost", "flame",
    "brisk", "vivid", "quilt", "mango", "zebra",
    "spork", "glyph", "haunt", "jolly", "knead",
    "train", "house", "plant", "world", "music",
    "light", "bread", "chair", "river", "stone",
    "cloud", "beach", "tiger", "lemon", "sugar",
    "peace", "dream", "smile", "storm", "plane",
  ];

  function pickWord() {
    return ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
  }

  /**
   * Checks a guess is well-formed and a recognized word before it's scored.
   * @param {string} guess
   * @returns {{ ok: boolean, reason?: string }}
   */
  function validateGuess(guess) {
    const normalized = (guess || "").toLowerCase();
    if (normalized.length !== WORD_LENGTH) {
      return { ok: false, reason: `Guess must be ${WORD_LENGTH} letters.` };
    }
    if (!/^[a-z]+$/.test(normalized)) {
      return { ok: false, reason: "Guess must contain only letters." };
    }
    if (VALID_WORDS && !VALID_WORDS.has(normalized)) {
      return { ok: false, reason: "Not in word list." };
    }
    return { ok: true };
  }

  /**
   * Scores a guess against the answer, Wordle-style.
   * Two-pass so duplicate letters are marked correctly: exact matches are
   * claimed first, then remaining letters are checked for presence.
   * @param {string} guess
   * @param {string} answer
   * @returns {("correct"|"present"|"absent")[]} one state per letter
   */
  function evaluateGuess(guess, answer) {
    const g = guess.toLowerCase().split("");
    const a = answer.toLowerCase().split("");
    const states = new Array(WORD_LENGTH).fill("absent");
    const remaining = {};

    // Pass 1: exact position matches, tally what's left over in `answer`.
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (g[i] === a[i]) {
        states[i] = "correct";
      } else {
        remaining[a[i]] = (remaining[a[i]] || 0) + 1;
      }
    }

    // Pass 2: right letter, wrong spot — only while copies remain.
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (states[i] === "correct") continue;
      if (remaining[g[i]] > 0) {
        states[i] = "present";
        remaining[g[i]] -= 1;
      }
    }

    return states;
  }

  function isWin(states) {
    return states.every((state) => state === "correct");
  }

  return {
    WORD_LENGTH,
    MAX_GUESSES,
    pickWord,
    validateGuess,
    evaluateGuess,
    isWin,
  };
})();
