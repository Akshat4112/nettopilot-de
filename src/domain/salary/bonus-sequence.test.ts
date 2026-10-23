import { describe, expect, it } from 'vitest'
import { prepareBonusSequence2026 } from './bonus-sequence'

describe('bonus sequence', () => {
  it('accepts an empty batch without inventing payments', () => {
    expect(prepareBonusSequence2026([])).toEqual({
      state: 'prepared',
      payments: [],
      totalGrossCents: 0,
    })
  })
})
