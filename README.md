# PuzzleHub

A tiny arcade of daily brain teasers — three self-contained puzzle games sharing one design system and one local scoreboard, deployed as a static site.

**Live deployment:** https://is-project-2026.github.io/puzzlehub-166889/

## Games

- **Wordle** — guess a hidden 5-letter word in six tries, with full color feedback and a ~14.8k-word guess dictionary.
- **2048** — slide and merge tiles (keyboard or touch swipe) to reach 2048.
- **Memory Match** — flip cards and clear the board in as few moves as possible, against the clock.

Every round's result is saved to the browser via `localStorage`, no backend involved.

## Technologies used

- **HTML5** — one page per game, all static, no templating
- **CSS3** — custom properties as a shared design system (color/type/spacing tokens), CSS Grid/Flexbox layouts, keyframe animations
- **Vanilla JavaScript (ES6+)** — no framework or build step; each game is a small, self-contained module
- **Lucide icons** — vendored inline as SVG (no CDN dependency)
- **GitHub Pages** — static hosting, deployed straight from `main`

## Project structure

```
index.html            landing page — links to all three games
css/style.css          shared design system (tokens, layout, animations)
js/
  scoreboard.js         localStorage read/write helper, shared by all games
  icons.js              vendored inline-SVG icon set
games/
  wordle/                word list, guess logic, grid/keyboard UI
  2048/                  grid logic, board/controls UI
  memory/                deck/match logic, card-flip UI
evidence/               merge-conflict screenshots (see submission.md)
```

## Running locally

No build step — just serve the folder statically, e.g.:

```
npx serve .
```

then open `http://localhost:3000`.

## About this project

Built for the IS Project 2026 Git & GitHub workflow assignment (Team GROUP 4E) — the point of the exercise is the Git history as much as the app: milestones, issues, feature branches, pull requests, and three deliberately engineered merge conflicts. See [submission.md](submission.md) for the write-up.
