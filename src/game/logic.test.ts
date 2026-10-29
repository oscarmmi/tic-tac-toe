import { describe, expect, it } from 'vitest'
import { chooseCpuMove, createBoard, getGameOutcome, placeMark, type Board } from './logic'

describe('TriMark game logic', () => {
  it('recognizes three marks in a row as a win', () => {
    const board: Board = ['X', 'X', 'X', 'O', null, 'O', null, null, null]
    expect(getGameOutcome(board)).toBe('X')
  })

  it('recognizes a full board with no three in a row as a draw', () => {
    const board: Board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X']
    expect(getGameOutcome(board)).toBe('draw')
  })

  it('rejects a move that tries to occupy a filled cell', () => {
    const board: Board = ['X', null, null, null, null, null, null, null, null]
    expect(placeMark(board, 0, 'O')).toBeNull()
    expect(board[0]).toBe('X')
  })

  it('takes a winning move before considering a block', () => {
    const board: Board = ['O', 'O', null, 'X', 'X', null, null, null, null]
    expect(chooseCpuMove(board)).toBe(2)
  })

  it('blocks an immediate player win', () => {
    const board: Board = ['X', 'X', null, 'O', null, null, null, null, null]
    expect(chooseCpuMove(board)).toBe(2)
  })

  it('starts with a fresh nine-cell board', () => {
    expect(createBoard()).toEqual(Array(9).fill(null))
  })
})
