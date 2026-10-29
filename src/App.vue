<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  chooseCpuMove,
  createBoard,
  getGameOutcome,
  getWinningLine,
  placeMark,
  type Board,
  type GameOutcome,
} from './game/logic'

type Stats = { wins: number; draws: number; losses: number }
const STATS_KEY = 'trimark-stats-v1'
const emptyStats = (): Stats => ({ wins: 0, draws: 0, losses: 0 })
const readStats = (): Stats => {
  try {
    const saved = localStorage.getItem(STATS_KEY)
    if (!saved) return emptyStats()
    const parsed = JSON.parse(saved) as Partial<Stats>
    return {
      wins: Number.isFinite(parsed.wins) ? Math.max(0, parsed.wins!) : 0,
      draws: Number.isFinite(parsed.draws) ? Math.max(0, parsed.draws!) : 0,
      losses: Number.isFinite(parsed.losses) ? Math.max(0, parsed.losses!) : 0,
    }
  } catch {
    return emptyStats()
  }
}

const board = ref<Board>(createBoard())
const stats = ref<Stats>(readStats())
const outcome = ref<GameOutcome>(null)
const isCpuThinking = ref(false)
let cpuTimer: ReturnType<typeof setTimeout> | undefined

const winningLine = computed(() => getWinningLine(board.value))
const gamesPlayed = computed(() => stats.value.wins + stats.value.draws + stats.value.losses)
const statusTitle = computed(() => {
  if (outcome.value === 'X') return 'That’s three. You win!'
  if (outcome.value === 'O') return 'CPU takes this one.'
  if (outcome.value === 'draw') return 'A perfectly even match.'
  if (isCpuThinking.value) return 'CPU is thinking…'
  return 'Your move, player one.'
})
const statusDetail = computed(() => {
  if (outcome.value) return 'Ready for a rematch? The board is yours.'
  if (isCpuThinking.value) return 'Looking for the next best move.'
  return 'Three in a row wins. Make it count.'
})

function finishGame(result: Exclude<GameOutcome, null>) {
  outcome.value = result
  if (result === 'X') stats.value.wins += 1
  else if (result === 'O') stats.value.losses += 1
  else stats.value.draws += 1
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats.value))
  } catch {
    // The game remains playable when browser storage is unavailable.
  }
}

function playCell(index: number) {
  if (outcome.value || isCpuThinking.value) return
  const nextBoard = placeMark(board.value, index, 'X')
  if (!nextBoard) return
  board.value = nextBoard
  const playerResult = getGameOutcome(nextBoard)
  if (playerResult) {
    finishGame(playerResult)
    return
  }

  isCpuThinking.value = true
  cpuTimer = setTimeout(() => {
    const cpuMove = chooseCpuMove(board.value)
    if (cpuMove !== null) {
      const cpuBoard = placeMark(board.value, cpuMove, 'O')
      if (cpuBoard) {
        board.value = cpuBoard
        const cpuResult = getGameOutcome(cpuBoard)
        if (cpuResult) finishGame(cpuResult)
      }
    }
    isCpuThinking.value = false
  }, 420)
}

function restartGame() {
  if (cpuTimer) clearTimeout(cpuTimer)
  cpuTimer = undefined
  board.value = createBoard()
  outcome.value = null
  isCpuThinking.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (event.altKey || event.ctrlKey || event.metaKey) return
  if (event.key.toLowerCase() === 'r') {
    restartGame()
    return
  }
  const positions: Record<string, number> = {
    '7': 0, '8': 1, '9': 2,
    '4': 3, '5': 4, '6': 5,
    '1': 6, '2': 7, '3': 8,
  }
  const index = positions[event.key]
  if (index !== undefined && !event.repeat) {
    event.preventDefault()
    playCell(index)
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  if (cpuTimer) clearTimeout(cpuTimer)
})
</script>

<template>
  <main class="page-shell">
    <header class="topbar">
      <a class="brand" href="#top" aria-label="TriMark home">
        <span class="brand-mark" aria-hidden="true"><i></i><b></b></span>
        <span>tri<span class="brand-accent">mark</span></span>
      </a>
      <span class="topbar-note"><span class="live-dot"></span> A small game of big decisions</span>
      <a class="about-link" href="#how-to-play">How to play <span aria-hidden="true">↗</span></a>
    </header>

    <section id="top" class="game-layout" aria-label="TriMark tic-tac-toe game">
      <div class="intro-column">
        <p class="eyebrow"><span>01</span> &nbsp; THE CLASSIC, RECONSIDERED</p>
        <h1>Three in a row.<br /><em>One good move.</em></h1>
        <p class="intro-copy">A quick duel of pattern and instinct.<br class="desktop-break" /> Can you outthink the machine?</p>

        <div class="matchup" aria-label="Matchup: you versus the CPU">
          <div class="player-chip active-player">
            <span class="mini-x" aria-hidden="true">×</span>
            <span><strong>You</strong><small>PLAYER 01</small></span>
            <span class="player-dot" aria-label="Your turn"></span>
          </div>
          <span class="versus">VS</span>
          <div class="player-chip">
            <span class="mini-o" aria-hidden="true"></span>
            <span><strong>CPU</strong><small>THE OTHER SIDE</small></span>
            <span class="cpu-badge" aria-hidden="true">AI</span>
          </div>
        </div>
      </div>

      <section class="game-card" aria-label="Game board">
        <div class="game-card-top">
          <div class="status-copy" aria-live="polite" aria-atomic="true">
            <span class="status-kicker">{{ outcome ? 'ROUND COMPLETE' : isCpuThinking ? 'CPU TURN' : 'YOUR TURN' }}</span>
            <h2>{{ statusTitle }}</h2>
            <p>{{ statusDetail }}</p>
          </div>
          <button class="restart-button" type="button" @click="restartGame" aria-label="Start a new round (R)">
            <span aria-hidden="true">↻</span><span class="restart-label">Restart</span>
          </button>
        </div>

        <div class="board-frame">
          <div class="board" role="grid" aria-label="Tic-tac-toe board">
            <button
              v-for="(cell, index) in board"
              :key="index"
              class="cell"
              :class="[
                cell === 'X' ? 'cell-x' : '',
                cell === 'O' ? 'cell-o' : '',
                winningLine?.includes(index) ? 'cell-winner' : '',
              ]"
              type="button"
              role="gridcell"
              :aria-label="`Row ${Math.floor(index / 3) + 1}, column ${index % 3 + 1}: ${cell ? (cell === 'X' ? 'your X' : 'CPU O') : 'empty'}`"
              :aria-pressed="Boolean(cell)"
              :disabled="Boolean(cell) || Boolean(outcome) || isCpuThinking"
              @click="playCell(index)"
            >
              <span v-if="cell === 'X'" class="mark mark-x" aria-hidden="true"></span>
              <span v-else-if="cell === 'O'" class="mark mark-o" aria-hidden="true"></span>
              <span v-else class="cell-hint" aria-hidden="true">{{ 9 - index }}</span>
            </button>
          </div>
        </div>

        <div class="game-card-bottom">
          <div class="legend"><span class="legend-mark legend-x">×</span><span>Your mark</span><span class="legend-divider"></span><span class="legend-mark legend-o"></span><span>CPU mark</span></div>
          <span class="round-number">ROUND <b>{{ gamesPlayed + (outcome ? 0 : 1) }}</b></span>
        </div>
      </section>

      <aside class="side-column">
        <section class="record-card" aria-labelledby="record-title">
          <div class="section-heading"><span class="heading-icon" aria-hidden="true">↗</span><h2 id="record-title">Your record</h2></div>
          <div class="record-stats">
            <div class="record-stat record-win"><strong>{{ stats.wins }}</strong><span>WINS</span></div>
            <div class="record-stat record-draw"><strong>{{ stats.draws }}</strong><span>DRAWS</span></div>
            <div class="record-stat record-loss"><strong>{{ stats.losses }}</strong><span>LOSSES</span></div>
          </div>
          <p v-if="gamesPlayed" class="record-footnote">{{ gamesPlayed }} {{ gamesPlayed === 1 ? 'round' : 'rounds' }} played on this device</p>
          <p v-else class="record-footnote">Your story starts with the next move.</p>
        </section>

        <section id="how-to-play" class="howto-card" aria-labelledby="howto-title">
          <div class="section-heading"><span class="heading-icon keyboard-icon" aria-hidden="true">⌘</span><h2 id="howto-title">Make your move</h2></div>
          <p>Claim three squares in a line before the CPU does.</p>
          <div class="key-instructions">
            <div class="key-visual" aria-hidden="true"><span>7</span><span>8</span><span>9</span><span>4</span><span>5</span><span>6</span><span>1</span><span>2</span><span>3</span></div>
            <div><strong>Pick a square</strong><small>Tap, click, or use your numpad</small></div>
          </div>
          <div class="restart-instruction"><kbd>R</kbd><span>Restart any time</span></div>
        </section>
      </aside>
    </section>

    <footer class="footer">
      <span>BUILT FOR THE JOY OF A GOOD MOVE</span>
      <span class="footer-center"><span class="footer-mark">×</span> <span class="footer-mark-o"></span> &nbsp; THINK AHEAD. PLAY AGAIN.</span>
      <span>TRIMARK <span class="footer-year">© 2026</span></span>
    </footer>
  </main>
</template>
