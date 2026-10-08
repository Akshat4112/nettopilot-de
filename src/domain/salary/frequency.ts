import type {
  CompensationGuarantee,
  CompensationInput,
  Currency,
  EuroAmount,
  OneOffPayment,
  PayPeriod,
} from './types'
import {
  type EuroCents,
  type ExactDecimal,
  type RoundingMode,
  addDecimals,
  decimal,
  divideDecimals,
  multiplyDecimals,
  sumEuroCents,
  toEuroCents,
} from './precision'

export type PayrollMonth = OneOffPayment['paymentMonth']

/**
 * An exact euro value expressed as dividend / divisor.
 *
 * Annual values that do not divide into whole cents stay exact here. Consumers
 * must choose a scale and rounding mode at the legal calculation boundary.
 */
export interface ExactEuroQuotient {
  readonly dividend: ExactDecimal
  readonly divisor: number
  readonly currency: Currency
}

export interface NormalizedRecurringComponent {
  readonly monthly: ExactEuroQuotient
  readonly annual: ExactEuroQuotient
}

export interface NormalizedOneOffPayment extends OneOffPayment {
  readonly normalizedAmount: ExactEuroQuotient
}

export interface NormalizedMonthlyCompensation {
  readonly month: PayrollMonth
  readonly baseSalary: ExactEuroQuotient
  readonly guaranteedRecurringAdditionalCash: ExactEuroQuotient
  readonly variableRecurringAdditionalCash: ExactEuroQuotient
  readonly guaranteedRecurringGross: ExactEuroQuotient
  readonly totalRecurringGross: ExactEuroQuotient
  readonly guaranteedOneOffPayments: readonly NormalizedOneOffPayment[]
  readonly variableOneOffPayments: readonly NormalizedOneOffPayment[]
  readonly guaranteedOneOffGross: ExactEuroQuotient
  readonly variableOneOffGross: ExactEuroQuotient
  readonly totalGross: ExactEuroQuotient
}

export interface NormalizedAnnualCompensation {
  readonly baseSalary: ExactEuroQuotient
  readonly guaranteedRecurringAdditionalCash: ExactEuroQuotient
  readonly variableRecurringAdditionalCash: ExactEuroQuotient
  readonly guaranteedRecurringGross: ExactEuroQuotient
  readonly totalRecurringGross: ExactEuroQuotient
  readonly guaranteedOneOffPayments: readonly NormalizedOneOffPayment[]
  readonly variableOneOffPayments: readonly NormalizedOneOffPayment[]
  readonly guaranteedOneOffGross: ExactEuroQuotient
  readonly variableOneOffGross: ExactEuroQuotient
  readonly guaranteedGross: ExactEuroQuotient
  readonly totalGross: ExactEuroQuotient
}

export interface NormalizedCompensation {
  readonly recurring: {
    readonly baseSalary: NormalizedRecurringComponent
    readonly guaranteedAdditionalCash: NormalizedRecurringComponent
    readonly variableAdditionalCash: NormalizedRecurringComponent
  }
  readonly months: readonly NormalizedMonthlyCompensation[]
  readonly annual: NormalizedAnnualCompensation
}

const months: readonly PayrollMonth[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

const greatestCommonDivisor = (left: number, right: number): number => {
  let a = left
  let b = right
  while (b !== 0) [a, b] = [b, a % b]
  return a
}

const leastCommonMultiple = (left: number, right: number): number =>
  (left / greatestCommonDivisor(left, right)) * right

const quotient = (dividend: ExactDecimal, divisor = 1): ExactEuroQuotient => {
  if (!Number.isSafeInteger(divisor) || divisor <= 0)
    throw new RangeError(
      'Euro quotient divisor must be a positive safe integer',
    )
  return { dividend, divisor, currency: 'EUR' }
}

const zero = (): ExactEuroQuotient => quotient(decimal('0'))

export const addExactEuroQuotients = (
  left: ExactEuroQuotient,
  right: ExactEuroQuotient,
): ExactEuroQuotient => {
  const divisor = leastCommonMultiple(left.divisor, right.divisor)
  const leftFactor = decimal((divisor / left.divisor).toString())
  const rightFactor = decimal((divisor / right.divisor).toString())
  return quotient(
    addDecimals(
      multiplyDecimals(left.dividend, leftFactor),
      multiplyDecimals(right.dividend, rightFactor),
    ),
    divisor,
  )
}

export const sumExactEuroQuotients = (
  values: readonly ExactEuroQuotient[],
): ExactEuroQuotient => values.reduce(addExactEuroQuotients, zero())

export const exactEuroQuotientToDecimal = (
  value: ExactEuroQuotient,
  resultScale: number,
  mode: RoundingMode,
): ExactDecimal =>
  divideDecimals(
    value.dividend,
    decimal(value.divisor.toString()),
    resultScale,
    mode,
  )

export const exactEuroQuotientToCents = (
  value: ExactEuroQuotient,
  mode: RoundingMode,
): EuroCents => toEuroCents(exactEuroQuotientToDecimal(value, 2, mode), 'exact')

export const sumExactEuroQuotientsToCents = (
  values: readonly ExactEuroQuotient[],
  mode: RoundingMode,
): EuroCents =>
  sumEuroCents(values.map((value) => exactEuroQuotientToCents(value, mode)))

const normalizeRecurringAmount = (
  amount: EuroAmount,
  period: PayPeriod,
): NormalizedRecurringComponent => {
  const exactAmount = decimal(amount.amount)
  if (period === 'monthly') {
    return {
      monthly: quotient(exactAmount),
      annual: quotient(multiplyDecimals(exactAmount, decimal('12'))),
    }
  }

  return {
    monthly: quotient(exactAmount, 12),
    annual: quotient(exactAmount),
  }
}

const normalizeOneOff = (payment: OneOffPayment): NormalizedOneOffPayment => ({
  ...payment,
  normalizedAmount: quotient(decimal(payment.amount.amount)),
})

const byGuarantee = (
  payments: readonly NormalizedOneOffPayment[],
  guarantee: CompensationGuarantee,
): readonly NormalizedOneOffPayment[] =>
  payments.filter((payment) => payment.guarantee === guarantee)

const oneOffAmounts = (
  payments: readonly NormalizedOneOffPayment[],
): readonly ExactEuroQuotient[] =>
  payments.map((payment) => payment.normalizedAmount)

export const normalizeCompensation = (
  input: CompensationInput,
): NormalizedCompensation => {
  const baseSalary = normalizeRecurringAmount(
    input.baseSalary.grossAmount,
    input.baseSalary.period,
  )
  const additional =
    input.regularAdditionalCash.kind === 'included'
      ? normalizeRecurringAmount(
          input.regularAdditionalCash.amount,
          input.regularAdditionalCash.period,
        )
      : { monthly: zero(), annual: zero() }
  const guaranteedAdditionalCash =
    input.regularAdditionalCash.kind === 'included' &&
    input.regularAdditionalCash.guarantee === 'guaranteed'
      ? additional
      : { monthly: zero(), annual: zero() }
  const variableAdditionalCash =
    input.regularAdditionalCash.kind === 'included' &&
    input.regularAdditionalCash.guarantee === 'variable'
      ? additional
      : { monthly: zero(), annual: zero() }

  const normalizedOneOffs = input.oneOffPayments.map(normalizeOneOff)
  const guaranteedOneOffPayments = byGuarantee(normalizedOneOffs, 'guaranteed')
  const variableOneOffPayments = byGuarantee(normalizedOneOffs, 'variable')

  const annualGuaranteedRecurring = addExactEuroQuotients(
    baseSalary.annual,
    guaranteedAdditionalCash.annual,
  )
  const annualTotalRecurring = addExactEuroQuotients(
    annualGuaranteedRecurring,
    variableAdditionalCash.annual,
  )
  const annualGuaranteedOneOff = sumExactEuroQuotients(
    oneOffAmounts(guaranteedOneOffPayments),
  )
  const annualVariableOneOff = sumExactEuroQuotients(
    oneOffAmounts(variableOneOffPayments),
  )

  const normalizedMonths = months.map((month) => {
    const monthOneOffs = normalizedOneOffs.filter(
      (payment) => payment.paymentMonth === month,
    )
    const monthGuaranteedOneOffs = byGuarantee(monthOneOffs, 'guaranteed')
    const monthVariableOneOffs = byGuarantee(monthOneOffs, 'variable')
    const guaranteedRecurringGross = addExactEuroQuotients(
      baseSalary.monthly,
      guaranteedAdditionalCash.monthly,
    )
    const totalRecurringGross = addExactEuroQuotients(
      guaranteedRecurringGross,
      variableAdditionalCash.monthly,
    )
    const guaranteedOneOffGross = sumExactEuroQuotients(
      oneOffAmounts(monthGuaranteedOneOffs),
    )
    const variableOneOffGross = sumExactEuroQuotients(
      oneOffAmounts(monthVariableOneOffs),
    )

    return {
      month,
      baseSalary: baseSalary.monthly,
      guaranteedRecurringAdditionalCash: guaranteedAdditionalCash.monthly,
      variableRecurringAdditionalCash: variableAdditionalCash.monthly,
      guaranteedRecurringGross,
      totalRecurringGross,
      guaranteedOneOffPayments: monthGuaranteedOneOffs,
      variableOneOffPayments: monthVariableOneOffs,
      guaranteedOneOffGross,
      variableOneOffGross,
      totalGross: sumExactEuroQuotients([
        totalRecurringGross,
        guaranteedOneOffGross,
        variableOneOffGross,
      ]),
    }
  })

  return {
    recurring: {
      baseSalary,
      guaranteedAdditionalCash,
      variableAdditionalCash,
    },
    months: normalizedMonths,
    annual: {
      baseSalary: baseSalary.annual,
      guaranteedRecurringAdditionalCash: guaranteedAdditionalCash.annual,
      variableRecurringAdditionalCash: variableAdditionalCash.annual,
      guaranteedRecurringGross: annualGuaranteedRecurring,
      totalRecurringGross: annualTotalRecurring,
      guaranteedOneOffPayments,
      variableOneOffPayments,
      guaranteedOneOffGross: annualGuaranteedOneOff,
      variableOneOffGross: annualVariableOneOff,
      guaranteedGross: addExactEuroQuotients(
        annualGuaranteedRecurring,
        annualGuaranteedOneOff,
      ),
      totalGross: sumExactEuroQuotients([
        annualTotalRecurring,
        annualGuaranteedOneOff,
        annualVariableOneOff,
      ]),
    },
  }
}
