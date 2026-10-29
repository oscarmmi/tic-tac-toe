Build tic-tac-toe in THIS folder: C:\xampp\htdocs\tic-tac-toe

A recruiter-ready browser tic-tac-toe. Playable, polished, no backend.

## Game
- Call it "TriMark". Original marks, no licensed logos.
- 3×3 grid. Player (amber X) vs CPU (cyan O). Player goes first.
- Click/tap a cell. Keyboard: keys 1–9 like a numpad (7 8 9 / 4 5 6 / 1 2 3). R restarts.
- First to three in a row (row, column, diagonal) wins. Full board with no three is a draw.
- CPU uses a small lookahead: take a winning move, block the player, else pick a remaining cell. A human can still win.
- Highlight the winning line. Local wins/draws/losses in localStorage.

## UI
- Deep charcoal board, glowing marks, hover/focus ring. Not a default Vite page. No Vue logo.
- 390px phone and 1280px desktop.

## Tests
- Vitest (pure logic): three in a row is a win; a full board with no three is a draw; occupying a filled cell is rejected.
- `npm test` and `npm run build` must pass.

## GitHub
- Repo: https://github.com/oscarmmi/tic-tac-toe
- Pages: https://oscarmmi.github.io/tic-tac-toe/
- vite base `/tic-tac-toe/`
- Commit: feat: add tic-tac-toe
- First commit must `git add -A` so package.json, vite.config.ts, tsconfigs, src/main.ts, index.html, .gitignore, and .github/workflows/pages.yml ship with the game.
- gh repo edit --description "TriMark tic-tac-toe vs CPU in Vue 3 + TypeScript, playable on GitHub Pages." --add-topic vue --add-topic typescript --add-topic game --add-topic tic-tac-toe --add-topic puzzle
- Stop. Print the repo URL and Pages URL.
