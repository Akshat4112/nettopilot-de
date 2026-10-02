import { describe, expect, it } from 'vitest'

import type { DecimalString, EuroAmount, PercentageRate } from './types'
import {
  ExactDecimal,
  addDecimals,
  addEuroCents,
  compareDecimals,
  decimal,
  divideDecimals,
  euroAmountToCents,
  euroCentsToAmount,
  formatEuroCents,
  fromEuroCents,
  multiplyByPercentage,
  multiplyCentsByPercentage,
  multiplyDecimals,
  percentToRatio,
  quantizeDecimal,
  subtractDecimals,
  subtractEuroCents,
  sumEuroCents,
  toEuroCents,
  type EuroCents,
  type RoundingMode,
} from './precision'

const rate = (value: string): PercentageRate => ({
  value: value as DecimalString,
  unit: 'percent',
})

const euro = (amount: string): EuroAmount => ({
  amount: amount as DecimalString,
  currency: 'EUR',
})

describe('exact base-10 decimals', () => {
  it.each([
    ['0', '0'],
    ['12', '12'],
    ['12.3400', '12.3400'],
    ['0.005', '0.005'],
    ['-12.30', '-12.30'],
  ])('parses and preserves the declared scale for %s', (input, expected) => {
    expect(decimal(input).toString()).toBe(expected)
  })

  it.each(['', '01', '.5', '1.', '+1', '1e3', 'NaN', 'Infinity'])(
    'rejects non-canonical decimal %s',
    (input) => {
      expect(() => decimal(input)).toThrow(TypeError)
    },
  )

  it('validates scales constructed from parts', () => {
    expect(ExactDecimal.fromParts(123n, 2).toString()).toBe('1.23')
    expect(() => ExactDecimal.fromParts(1n, -1)).toThrow(RangeError)
    expect(() => ExactDecimal.fromParts(1n, 1.5)).toThrow(RangeError)
  })

  it('adds, subtracts and compares values with different scales', () => {
    expect(addDecimals(decimal('1.2'), decimal('0.03')).toString()).toBe('1.23')
    expect(subtractDecimals(decimal('1.2'), decimal('0.03')).toString()).toBe(
      '1.17',
    )
    expect(compareDecimals(decimal('1.20'), decimal('1.2'))).toBe(0)
    expect(compareDecimals(decimal('-1.2'), decimal('0'))).toBe(-1)
    expect(compareDecimals(decimal('2'), decimal('1.999'))).toBe(1)
  })

  it('multiplies without losing decimal precision', () => {
    expect(
      multiplyDecimals(decimal('5812.50'), decimal('0.018')).toString(),
    ).toBe('104.62500')
    expect(
      multiplyDecimals(
        decimal('999999999999999999.99'),
        decimal('999999999999999999.99'),
      ).toString(),
    ).toBe('999999999999999999980000000000000000.0001')
  })

  it('divides to an explicit result scale and rounding mode', () => {
    expect(
      divideDecimals(decimal('1'), decimal('3'), 4, 'truncate').toString(),
    ).toBe('0.3333')
    expect(
      divideDecimals(decimal('2'), decimal('3'), 2, 'half_up').toString(),
    ).toBe('0.67')
    expect(
      divideDecimals(decimal('-2'), decimal('3'), 2, 'floor').toString(),
    ).toBe('-0.67')
    expect(
      divideDecimals(decimal('-2'), decimal('3'), 2, 'ceiling').toString(),
    ).toBe('-0.66')
    expect(
      divideDecimals(decimal('2'), decimal('-3'), 2, 'truncate').toString(),
    ).toBe('-0.66')
    expect(() =>
      divideDecimals(decimal('1'), decimal('0'), 2, 'half_up'),
    ).toThrow('Division by zero')
  })
})

describe('explicit rounding checkpoints', () => {
  const cases: readonly [string, RoundingMode, string][] = [
    ['1.234', 'truncate', '1.23'],
    ['1.239', 'truncate', '1.23'],
    ['-1.239', 'truncate', '-1.23'],
    ['1.231', 'floor', '1.23'],
    ['-1.231', 'floor', '-1.24'],
    ['1.231', 'ceiling', '1.24'],
    ['-1.231', 'ceiling', '-1.23'],
    ['1.234', 'half_up', '1.23'],
    ['1.235', 'half_up', '1.24'],
    ['1.236', 'half_up', '1.24'],
    ['-1.234', 'half_up', '-1.23'],
    ['-1.235', 'half_up', '-1.24'],
  ]

  it.each(cases)('%s with %s becomes %s', (input, mode, expected) => {
    expect(quantizeDecimal(decimal(input), 2, mode).toString()).toBe(expected)
  })

  it('preserves values already at the target scale and can increase scale', () => {
    const current = decimal('1.20')
    expect(quantizeDecimal(current, 2, 'half_up')).toBe(current)
    expect(quantizeDecimal(current, 4, 'half_up').toString()).toBe('1.2000')
  })

  it('supports BMF-style assignment truncation independently of cent rounding', () => {
    const intermediate = decimal('123.456789')
    expect(quantizeDecimal(intermediate, 3, 'truncate').toString()).toBe(
      '123.456',
    )
    expect(quantizeDecimal(intermediate, 2, 'floor').toString()).toBe('123.45')
    expect(quantizeDecimal(intermediate, 2, 'ceiling').toString()).toBe(
      '123.46',
    )
  })
})

describe('integer-cent boundaries', () => {
  it('converts exact euro values to cents without binary floating point', () => {
    expect(toEuroCents(decimal('12'))).toBe(1200n)
    expect(toEuroCents(decimal('12.3'))).toBe(1230n)
    expect(toEuroCents(decimal('12.3400'))).toBe(1234n)
    expect(toEuroCents(decimal('-0.01'))).toBe(-1n)
    expect(euroAmountToCents(euro('85000.00'))).toBe(8_500_000n)
  })

  it('fails closed when exact cent conversion would lose precision', () => {
    expect(() => toEuroCents(decimal('1.001'))).toThrow(
      'Value cannot be represented as exact euro cents',
    )
  })

  it.each([
    ['1.004', 'half_up', 100n],
    ['1.005', 'half_up', 101n],
    ['1.009', 'truncate', 100n],
    ['1.001', 'floor', 100n],
    ['1.001', 'ceiling', 101n],
  ] as const)('converts %s with %s', (input, mode, expected) => {
    expect(toEuroCents(decimal(input), mode)).toBe(expected)
  })

  it('formats and combines branded integer cents', () => {
    const first = toEuroCents(decimal('10.20'))
    const second = toEuroCents(decimal('1.05'))
    expect(addEuroCents(first, second)).toBe(1125n)
    expect(subtractEuroCents(first, second)).toBe(915n)
    expect(sumEuroCents([first, second, -25n as EuroCents])).toBe(1100n)
    expect(fromEuroCents(-5n as EuroCents).toString()).toBe('-0.05')
    expect(formatEuroCents(123456n as EuroCents)).toBe('1234.56')
    expect(euroCentsToAmount(123456n as EuroCents)).toEqual({
      amount: '1234.56',
      currency: 'EUR',
    })
  })
})

describe('source-defined payroll rounding examples', () => {
  it('converts percentage points to an exact ratio', () => {
    expect(percentToRatio(rate('1.8')).toString()).toBe('0.018')
    expect(percentToRatio(rate('2.50')).toString()).toBe('0.0250')
  })

  it('rounds a social-insurance share half up only at the contribution stage', () => {
    const contributionBase = decimal('5812.50')
    const unrounded = multiplyByPercentage(contributionBase, rate('1.8'))
    expect(unrounded.toString()).toBe('104.62500')
    expect(toEuroCents(unrounded, 'half_up')).toBe(10463n)

    const baseCents = toEuroCents(contributionBase)
    expect(multiplyCentsByPercentage(baseCents, rate('1.8'), 'half_up')).toBe(
      10463n,
    )
  })

  it('keeps equal-share rounding before doubling', () => {
    const employee = multiplyCentsByPercentage(
      toEuroCents(decimal('8450.00')),
      rate('1.3'),
      'half_up',
    )
    expect(employee).toBe(10985n)
    expect(addEuroCents(employee, employee)).toBe(21970n)
  })

  it('supports explicit downward cent treatment for an approved church-tax rule', () => {
    const assessmentBase = 12_345n as EuroCents
    expect(multiplyCentsByPercentage(assessmentBase, rate('9'), 'floor')).toBe(
      1111n,
    )
  })
})
