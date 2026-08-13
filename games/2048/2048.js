// PuzzleHub 2048 — game logic (grid state, slide/merge rules, win/lose
// detection). UI/controls that consume this land in issue #8.

const Game2048 = (() => {
  const SIZE = 4;
  const WIN_VALUE = 2048;

  function createGrid() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  }

  function cloneGrid(grid) {
    return grid.map((row) => row.slice());
  }

  function getEmptyCells(grid) {
    const cells = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (grid[r][c] === 0) cells.push([r, c]);
      }
    }
    return cells;
  }

  /**
   * Drops a new tile (90% a 2, 10% a 4) into a random empty cell.
   * Mutates `grid` in place. Returns false if the grid is already full.
   */
  function addRandomTile(grid) {
    const empty = getEmptyCells(grid);
    if (empty.length === 0) return false;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    return true;
  }

  /**
   * Compresses and merges a single row leftward. Each tile merges at most
   * once per move (classic 2048 rule), so "2 2 2 2" -> "4 4 0 0", not
   * "8 0 0 0".
   */
  function slideRowLeft(row) {
    const values = row.filter((v) => v !== 0);
    const merged = [];
    let gained = 0;

    for (let i = 0; i < values.length; i++) {
      if (values[i] === values[i + 1]) {
        const mergedValue = values[i] * 2;
        merged.push(mergedValue);
        gained += mergedValue;
        i++; // skip the tile just consumed by the merge
      } else {
        merged.push(values[i]);
      }
    }

    while (merged.length < SIZE) merged.push(0);
    const moved = row.some((v, i) => v !== merged[i]);
    return { row: merged, gained, moved };
  }

  function transpose(grid) {
    return grid[0].map((_, c) => grid.map((row) => row[c]));
  }

  function reverseRows(grid) {
    return grid.map((row) => row.slice().reverse());
  }

  /**
   * Applies one move in `direction` ("left"|"right"|"up"|"down") to `grid`
   * without mutating it. Reduces right/up/down to the left case via
   * transpose/reverse so there's one slide implementation to trust.
   * @returns {{ grid: number[][], moved: boolean, scoreGained: number }}
   */
  function move(grid, direction) {
    let working = cloneGrid(grid);
    if (direction === "right") working = reverseRows(working);
    if (direction === "up") working = transpose(working);
    if (direction === "down") working = reverseRows(transpose(working));

    let moved = false;
    let scoreGained = 0;
    working = working.map((row) => {
      const result = slideRowLeft(row);
      if (result.moved) moved = true;
      scoreGained += result.gained;
      return result.row;
    });

    if (direction === "right") working = reverseRows(working);
    if (direction === "up") working = transpose(working);
    if (direction === "down") working = transpose(reverseRows(working));

    return { grid: working, moved, scoreGained };
  }

  /** True if any adjacent pair (same row or column) could still merge. */
  function hasAdjacentMerge(grid) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const value = grid[r][c];
        if (c + 1 < SIZE && grid[r][c + 1] === value) return true;
        if (r + 1 < SIZE && grid[r + 1][c] === value) return true;
      }
    }
    return false;
  }

  function canMove(grid) {
    return getEmptyCells(grid).length > 0 || hasAdjacentMerge(grid);
  }

  function isGameOver(grid) {
    return !canMove(grid);
  }

  function hasWon(grid) {
    return grid.some((row) => row.some((v) => v >= WIN_VALUE));
  }

  return {
    SIZE,
    WIN_VALUE,
    createGrid,
    addRandomTile,
    move,
    isGameOver,
    hasWon,
  };
})();
