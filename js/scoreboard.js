// PuzzleHub shared scoreboard — persists per-game stats to localStorage.
// Each game calls Scoreboard.record(gameId, entry) after a round ends and
// Scoreboard.getBest(gameId) / Scoreboard.getHistory(gameId) to read them back.

const Scoreboard = (() => {
  const STORAGE_KEY = "puzzlehub:scores";

  function readAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (err) {
      console.warn("Scoreboard: failed to read localStorage, resetting.", err);
      return {};
    }
  }

  function writeAll(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  /**
   * Record a finished round for a game.
   * @param {string} gameId - e.g. "wordle", "2048", "memory"
   * @param {object} entry - arbitrary result data, e.g. { score, moves, timeMs, won }
   */
  function record(gameId, entry) {
    const data = readAll();
    if (!data[gameId]) data[gameId] = [];
    data[gameId].push({ ...entry, playedAt: new Date().toISOString() });
    writeAll(data);
  }

  function getHistory(gameId) {
    return readAll()[gameId] || [];
  }

  function getBest(gameId, compareFn) {
    const history = getHistory(gameId);
    if (history.length === 0) return null;
    return history.reduce((best, cur) =>
      compareFn(cur, best) ? cur : best
    );
  }

  function clear(gameId) {
    const data = readAll();
    delete data[gameId];
    writeAll(data);
  }

  return { record, getHistory, getBest, clear };
})();
