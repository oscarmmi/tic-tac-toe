export type Mark = 'X' | 'O'
export type Board = Array<Mark | null>
export type GameOutcome = Mark | 'draw' | null

export const WINNING_LINES: ReadonlyArray<readonly [number, number, number]> = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

const CPU_PREFERENCE = [4, 0, 2, 6, 8, 1, 3, 5, 7]

export function createBoard(): Board {
  return Array.from({ length: 9 }, () => null)
}

export function getWinningLine(board: Board): readonly [number, number, number] | null {
  return WINNING_LINES.find(([a, b, c]) => board[a] !== null && board[a] === board[b] && board[b] === board[c]) ?? null
}

export function getGameOutcome(board: Board): GameOutcome {
  const winningLine = getWinningLine(board)
  if (winningLine) return board[winningLine[0]] as Mark
  return board.every((cell) => cell !== null) ? 'draw' : null
}

export function placeMark(board: Board, index: number, mark: Mark): Board | null {
  if (!Number.isInteger(index) || index < 0 || index >= board.length || board[index] !== null) return null
  if (getGameOutcome(board) !== null) return null
  const nextBoard = [...board]
  nextBoard[index] = mark
  return nextBoard
}

export function chooseCpuMove(board: Board): number | null {
  if (getGameOutcome(board) !== null) return null
  const openCells = CPU_PREFERENCE.filter((index) => board[index] === null)

  for (const [mark, indexList] of [['O', openCells], ['X', openCells]] as const) {
    for (const index of indexList) {
      const candidate = [...board]
      candidate[index] = mark
      if (getGameOutcome(candidate) === mark) return index
    }
  }

  return openCells[0] ?? null
}
