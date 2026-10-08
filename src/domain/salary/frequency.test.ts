import { describe, expect, it } from 'vitest'

import type {
  CompensationInput,
  DecimalString,
  EuroAmount,
  RegistryOptionId,
  ScenarioLabel,
} from './types'
import {
  exactEuroQuotientToCents,
  exactEuroQuotientToDecimal,
  normalizeCompensation,
} from './frequency'

const euro = (amount: string): EuroAmount => ({
  amount: amount as DecimalString,
  currency: 'EUR',
})

const baseInput = (amount: string, period: 'monthly' | 'annual') =>
  ({
    baseSalary: {
      period,
      grossAmount: euro(amount),
      paymentsPerYear: 12,
    },
    regularAdditionalCash: { kind: 'none', amount: euro('0') },
    oneOffPayments: [],
  }) satisfies CompensationInput

const exactText = (
  value: ReturnType<typeof normalizeCompensation>['annual']['totalGross'],
  scale = 2,
) => exactEuroQuotientToDecimal(value, scale, 'half_up').toString()

const payrollMonth = (
  normalized: ReturnType<typeof normalizeCompensation>,
  month: number,
) => {
  const result = normalized.months[month - 1]
  if (result === undefined)
    throw new Error(`Missing payroll month ${month.toString()}`)
  return result
}

describe('pay-frequency normalization', () => {
  it('annualizes a monthly base salary into twelve recurring payroll periods', () => {
    const normalized = normalizeCompensation(baseInput('7000.00', 'monthly'))

    expect(normalized.months).toHaveLength(12)
    expect(normalized.months.map(({ month }) => month)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ])
    expect(exactText(normalized.recurring.baseSalary.monthly)).toBe('7000.00')
    expect(exactText(normalized.recurring.baseSalary.annual)).toBe('84000.00')
    expect(exactText(normalized.annual.totalGross)).toBe('84000.00')
  })

  it('keeps annual-to-monthly conversion exact until an explicit rounding boundary', () => {
    const normalized = normalizeCompensation(baseInput('100000.00', 'annual'))
    const monthly = normalized.recurring.baseSalary.monthly

    expect(monthly.dividend.toString()).toBe('100000.00')
    expect(monthly.divisor).toBe(12)
    expect(exactText(monthly, 8)).toBe('8333.33333333')
    expect(exactEuroQuotientToCents(monthly, 'half_up')).toBe(833333n)
    expect(exactText(normalized.recurring.baseSalary.annual)).toBe('100000.00')
    expect(exactText(normalized.annual.totalGross)).toBe('100000.00')
  })

  it('normalizes guaranteed recurring cash into the conservative totals', () => {
    const input: CompensationInput = {
      ...baseInput('6000.00', 'monthly'),
      regularAdditionalCash: {
        kind: 'included',
        amount: euro('1200.00'),
        period: 'annual',
        guarantee: 'guaranteed',
      },
    }
    const normalized = normalizeCompensation(input)
    const january = payrollMonth(normalized, 1)

    expect(
      exactText(normalized.recurring.guaranteedAdditionalCash.monthly),
    ).toBe('100.00')
    expect(exactText(january.guaranteedRecurringGross)).toBe('6100.00')
    expect(exactText(normalized.annual.guaranteedRecurringGross)).toBe(
      '73200.00',
    )
    expect(exactText(normalized.annual.totalRecurringGross)).toBe('73200.00')
  })

  it('preserves variable recurring cash outside guaranteed totals', () => {
    const input: CompensationInput = {
      ...baseInput('6000.00', 'monthly'),
      regularAdditionalCash: {
        kind: 'included',
        amount: euro('500.00'),
        period: 'monthly',
        guarantee: 'variable',
      },
    }
    const normalized = normalizeCompensation(input)
    const january = payrollMonth(normalized, 1)

    expect(exactText(january.variableRecurringAdditionalCash)).toBe('500.00')
    expect(exactText(january.guaranteedRecurringGross)).toBe('6000.00')
    expect(exactText(january.totalRecurringGross)).toBe('6500.00')
    expect(exactText(normalized.annual.guaranteedRecurringGross)).toBe(
      '72000.00',
    )
    expect(exactText(normalized.annual.totalRecurringGross)).toBe('78000.00')
  })

  it('keeps guaranteed and variable one-offs separate in their payment months', () => {
    const input: CompensationInput = {
      ...baseInput('72000.00', 'annual'),
      oneOffPayments: [
        {
          amount: euro('3000.00'),
          paymentMonth: 3,
          classification: 'annual_bonus' as RegistryOptionId,
          guarantee: 'variable',
          label: 'Performance bonus' as ScenarioLabel,
        },
        {
          amount: euro('1500.00'),
          paymentMonth: 11,
          classification: 'holiday_pay' as RegistryOptionId,
          guarantee: 'guaranteed',
          label: 'Holiday pay' as ScenarioLabel,
        },
      ],
    }
    const normalized = normalizeCompensation(input)
    const january = payrollMonth(normalized, 1)
    const march = payrollMonth(normalized, 3)
    const november = payrollMonth(normalized, 11)

    expect(january.guaranteedOneOffPayments).toHaveLength(0)
    expect(march.variableOneOffPayments[0]?.label).toBe('Performance bonus')
    expect(exactText(march.totalRecurringGross)).toBe('6000.00')
    expect(exactText(march.totalGross)).toBe('9000.00')
    expect(november.guaranteedOneOffPayments[0]?.label).toBe('Holiday pay')
    expect(exactText(normalized.annual.guaranteedOneOffGross)).toBe('1500.00')
    expect(exactText(normalized.annual.variableOneOffGross)).toBe('3000.00')
    expect(exactText(normalized.annual.guaranteedGross)).toBe('73500.00')
    expect(exactText(normalized.annual.totalGross)).toBe('76500.00')
  })

  it('retains multiple one-off rows in the same month without blending them', () => {
    const input: CompensationInput = {
      ...baseInput('5000.00', 'monthly'),
      oneOffPayments: [
        {
          amount: euro('1000.00'),
          paymentMonth: 6,
          classification: 'bonus' as RegistryOptionId,
          guarantee: 'guaranteed',
        },
        {
          amount: euro('250.00'),
          paymentMonth: 6,
          classification: 'award' as RegistryOptionId,
          guarantee: 'variable',
        },
      ],
    }
    const june = payrollMonth(normalizeCompensation(input), 6)

    expect(june.guaranteedOneOffPayments).toHaveLength(1)
    expect(june.variableOneOffPayments).toHaveLength(1)
    expect(exactText(june.guaranteedOneOffGross)).toBe('1000.00')
    expect(exactText(june.variableOneOffGross)).toBe('250.00')
    expect(exactText(june.totalGross)).toBe('6250.00')
  })
})
