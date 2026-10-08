import type { DecimalString, EuroAmount, PercentageRate } from './types'

declare const euroCentsBrand: unique symbol

export type EuroCents = bigint & { readonly [euroCentsBrand]: 'EuroCents' }
export type RoundingMode = 'truncate' | 'floor' | 'ceiling' | 'half_up'
export type CentConversionMode = RoundingMode | 'exact'

const decimalPattern = /^-?(0|[1-9]\d*)(?:\.(\d+))?$/

const powerOfTen = (exponent: number): bigint => {
  if (!Number.isSafeInteger(exponent) || exponent < 0)
    throw new RangeError('Decimal scale must be a non-negative safe integer')
  return 10n ** BigInt(exponent)
}

const roundFraction = (
  numerator: bigint,
  denominator: bigint,
  mode: RoundingMode,
): bigint => {
  if (denominator === 0n) throw new RangeError('Division by zero')

  const normalizedNumerator = denominator < 0n ? -numerator : numerator
  const normalizedDenominator = denominator < 0n ? -denominator : denominator
  const quotient = normalizedNumerator / normalizedDenominator
  const remainder = normalizedNumerator % normalizedDenominator
  if (remainder === 0n) return quotient

  const direction = normalizedNumerator < 0n ? -1n : 1n
  const magnitude = remainder < 0n ? -remainder : remainder

  switch (mode) {
    case 'truncate':
      return quotient
    case 'floor':
      return normalizedNumerator < 0n ? quotient - 1n : quotient
    case 'ceiling':
      return normalizedNumerator > 0n ? quotient + 1n : quotient
    case 'half_up':
      return magnitude * 2n >= normalizedDenominator
        ? quotient + direction
        : quotient
  }
}

/** Exact signed base-10 value. No operation converts through Number. */
export class ExactDecimal {
  readonly coefficient: bigint
  readonly scale: number

  private constructor(coefficient: bigint, scale: number) {
    this.coefficient = coefficient
    this.scale = scale
  }

  static parse(value: string): ExactDecimal {
    const match = decimalPattern.exec(value)
    if (match === null)
      throw new TypeError(`Invalid canonical decimal: ${value}`)

    const whole = match[1] ?? '0'
    const fraction = match[2] ?? ''
    const sign = value.startsWith('-') ? -1n : 1n
    return new ExactDecimal(sign * BigInt(whole + fraction), fraction.length)
  }

  static fromParts(coefficient: bigint, scale: number): ExactDecimal {
    powerOfTen(scale)
    return new ExactDecimal(coefficient, scale)
  }

  toString(): string {
    const negative = this.coefficient < 0n
    const magnitude = negative ? -this.coefficient : this.coefficient
    if (this.scale === 0) return `${negative ? '-' : ''}${magnitude.toString()}`

    const digits = magnitude.toString().padStart(this.scale + 1, '0')
    return `${negative ? '-' : ''}${digits.slice(0, -this.scale)}.${digits.slice(-this.scale)}`
  }
}

export const decimal = (value: string | DecimalString): ExactDecimal =>
  ExactDecimal.parse(value)

export const quantizeDecimal = (
  value: ExactDecimal,
  targetScale: number,
  mode: RoundingMode,
): ExactDecimal => {
  powerOfTen(targetScale)
  if (targetScale === value.scale) return value
  if (targetScale > value.scale) {
    return ExactDecimal.fromParts(
      value.coefficient * powerOfTen(targetScale - value.scale),
      targetScale,
    )
  }

  return ExactDecimal.fromParts(
    roundFraction(
      value.coefficient,
      powerOfTen(value.scale - targetScale),
      mode,
    ),
    targetScale,
  )
}

const align = (
  left: ExactDecimal,
  right: ExactDecimal,
): readonly [bigint, bigint, number] => {
  const scale = Math.max(left.scale, right.scale)
  return [
    left.coefficient * powerOfTen(scale - left.scale),
    right.coefficient * powerOfTen(scale - right.scale),
    scale,
  ]
}

export const addDecimals = (
  left: ExactDecimal,
  right: ExactDecimal,
): ExactDecimal => {
  const [leftCoefficient, rightCoefficient, scale] = align(left, right)
  return ExactDecimal.fromParts(leftCoefficient + rightCoefficient, scale)
}

export const subtractDecimals = (
  left: ExactDecimal,
  right: ExactDecimal,
): ExactDecimal => {
  const [leftCoefficient, rightCoefficient, scale] = align(left, right)
  return ExactDecimal.fromParts(leftCoefficient - rightCoefficient, scale)
}

export const multiplyDecimals = (
  left: ExactDecimal,
  right: ExactDecimal,
): ExactDecimal =>
  ExactDecimal.fromParts(
    left.coefficient * right.coefficient,
    left.scale + right.scale,
  )

export const divideDecimals = (
  numerator: ExactDecimal,
  denominator: ExactDecimal,
  resultScale: number,
  mode: RoundingMode,
): ExactDecimal => {
  powerOfTen(resultScale)
  return ExactDecimal.fromParts(
    roundFraction(
      numerator.coefficient * powerOfTen(denominator.scale + resultScale),
      denominator.coefficient * powerOfTen(numerator.scale),
      mode,
    ),
    resultScale,
  )
}

export const compareDecimals = (
  left: ExactDecimal,
  right: ExactDecimal,
): -1 | 0 | 1 => {
  const [leftCoefficient, rightCoefficient] = align(left, right)
  return leftCoefficient < rightCoefficient
    ? -1
    : leftCoefficient > rightCoefficient
      ? 1
      : 0
}

export const percentToRatio = (rate: PercentageRate): ExactDecimal => {
  const percentage = decimal(rate.value)
  return divideDecimals(
    percentage,
    decimal('100'),
    percentage.scale + 2,
    'truncate',
  )
}

export const multiplyByPercentage = (
  value: ExactDecimal,
  rate: PercentageRate,
): ExactDecimal => multiplyDecimals(value, percentToRatio(rate))

export const toEuroCents = (
  value: ExactDecimal,
  mode: CentConversionMode = 'exact',
): EuroCents => {
  if (mode === 'exact') {
    if (value.scale <= 2)
      return (value.coefficient * powerOfTen(2 - value.scale)) as EuroCents

    const divisor = powerOfTen(value.scale - 2)
    if (value.coefficient % divisor !== 0n)
      throw new RangeError('Value cannot be represented as exact euro cents')
    return (value.coefficient / divisor) as EuroCents
  }

  return quantizeDecimal(value, 2, mode).coefficient as EuroCents
}

export const euroAmountToCents = (
  value: EuroAmount,
  mode: CentConversionMode = 'exact',
): EuroCents => toEuroCents(decimal(value.amount), mode)

export const fromEuroCents = (value: EuroCents): ExactDecimal =>
  ExactDecimal.fromParts(value, 2)

export const euroCentsToAmount = (value: EuroCents): EuroAmount => ({
  amount: formatEuroCents(value) as DecimalString,
  currency: 'EUR',
})

export const addEuroCents = (left: EuroCents, right: EuroCents): EuroCents =>
  (left + right) as EuroCents

export const subtractEuroCents = (
  left: EuroCents,
  right: EuroCents,
): EuroCents => (left - right) as EuroCents

export const sumEuroCents = (values: readonly EuroCents[]): EuroCents =>
  values.reduce<EuroCents>(
    (sum, value) => addEuroCents(sum, value),
    0n as EuroCents,
  )

export const multiplyCentsByPercentage = (
  value: EuroCents,
  rate: PercentageRate,
  mode: RoundingMode,
): EuroCents =>
  toEuroCents(multiplyByPercentage(fromEuroCents(value), rate), mode)

export const formatEuroCents = (value: EuroCents): string =>
  fromEuroCents(value).toString()
