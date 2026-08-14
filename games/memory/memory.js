// PuzzleHub Memory Match — game logic (deck shuffling, flip/match
// detection, timer tracking). UI/rendering that consumes this lands in
// issue #10.

const MemoryGame = (() => {
  const SYMBOLS = ["🍎", "🍋", "🍇", "🍒", "🍉", "🍓", "🍍", "🥝", "🍑", "🥕"];
  const DEFAULT_PAIRS = 8;

  /** Fisher-Yates shuffle — returns a new array, doesn't mutate the input. */
  function shuffle(items) {
    const result = items.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Builds a shuffled deck of `pairCount` matched symbol pairs.
   * @param {number} pairCount
   * @returns {{ id: number, value: string, matched: boolean }[]}
   */
  function createDeck(pairCount = DEFAULT_PAIRS) {
    const symbols = SYMBOLS.slice(0, pairCount);
    const pairs = symbols.flatMap((value) => [value, value]);
    return shuffle(pairs).map((value, id) => ({ id, value, matched: false }));
  }

  /**
   * Compares two flipped cards. Returns a new deck (cards marked matched)
   * when they're a pair; returns the original deck unchanged otherwise so
   * the UI can flip them back after its own delay.
   */
  function evaluateFlip(deck, firstIndex, secondIndex) {
    const first = deck[firstIndex];
    const second = deck[secondIndex];
    const isMatch = firstIndex !== secondIndex && first.value === second.value;

    if (!isMatch) return { isMatch: false, deck };

    const nextDeck = deck.map((card, i) =>
      i === firstIndex || i === secondIndex ? { ...card, matched: true } : card
    );
    return { isMatch: true, deck: nextDeck };
  }

  function isGameComplete(deck) {
    return deck.every((card) => card.matched);
  }

  /** Simple elapsed-time tracker for the round, in whole seconds. */
  function createTimer() {
    let startedAt = null;
    let stoppedAt = null;

    return {
      start() {
        startedAt = Date.now();
        stoppedAt = null;
      },
      stop() {
        if (startedAt !== null && stoppedAt === null) stoppedAt = Date.now();
      },
      elapsedSeconds() {
        if (startedAt === null) return 0;
        const end = stoppedAt ?? Date.now();
        return Math.floor((end - startedAt) / 1000);
      },
    };
  }

  return {
    DEFAULT_PAIRS,
    createDeck,
    evaluateFlip,
    isGameComplete,
    createTimer,
  };
})();
