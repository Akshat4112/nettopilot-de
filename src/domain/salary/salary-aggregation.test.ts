import { describe, expect, it } from 'vitest'
import {
  aggregateSalaryResults2026,
  type SalaryMonthAdmission2026,
  type SalaryMonthComponents2026,
} from './salary-aggregation'

const baseline = (month: number): SalaryMonthComponents2026 => ({
  month,
  recurringGrossCents: 500000,
  guaranteedRecurringGrossCents: 500000,
  recurringWageTaxCents: 75000,
  recurringSolidarityCents: 0,
  recurringChurchTaxCents: 0,
  employeePensionCents: 46500,
  employeeUnemploymentCents: 6500,
  employeeHealthCents: 40000,
  employeeCareCents: 10000,
  employerPensionCents: 46500,
  employerUnemploymentCents: 6500,
  employerHealthCents: 40000,
  employerCareCents: 9000,
  privateInsuranceOutflowCents: 0,
  oneOffPayments: [],
})

const year = (): SalaryMonthAdmission2026[] =>
  Array.from({ length: 12 }, (_, index) => ({
    state: 'calculated' as const,
    value: baseline(index + 1),
  }))

describe('2026 salary result aggregation', () => {
  it('reconciles monthly recurring net, employer cost and annual totals', () => {
    const result = aggregateSalaryResults2026(year())
    expect(result).toMatchObject({
      state: 'calculated',
      recurringMonthlyNetCents: 322000,
      recurringMonthlyNetIsStable: true,
      annual: {
        grossCents: 6000000,
        recurringGrossCents: 6000000,
        guaranteedGrossCents: 6000000,
        oneOffGrossCents: 0,
        netPayrollCents: 3864000,
        employerCostCents: 7224000,
      },
    })
    if (result.state === 'calculated')
      expect(result.annual.grossCents - result.annual.allDeductionsCents).toBe(
        result.annual.disposableAfterPrivateInsuranceCents,
      )
  })

  it('treats one-off bonuses separately and does not average them into recurring net', () => {
    const months = year()
    months[11] = {
      state: 'calculated',
      value: {
        ...baseline(12),
        oneOffPayments: [
          {
            guarantee: 'variable',
            settlement: {
              state: 'calculated',
              grossCents: 100000,
              wageTaxCents: 30000,
              solidarityCents: 0,
              churchTaxCents: 0,
              employeeInsuranceCents: 10000,
              employerInsuranceCents: 10000,
              netBonusCents: 60000,
              incrementalEmployerCostCents: 110000,
            },
          },
        ],
      },
    }
    const result = aggregateSalaryResults2026(months)
    expect(result).toMatchObject({
      state: 'calculated',
      recurringMonthlyNetCents: 322000,
      annual: {
        grossCents: 6100000,
        variableGrossCents: 100000,
        oneOffGrossCents: 100000,
        oneOffEmployeeSocialInsuranceCents: 10000,
        oneOffEmployerSocialInsuranceCents: 10000,
        netPayrollCents: 3924000,
        employerCostCents: 7334000,
      },
    })
  })

  it('keeps private premiums outside payroll net, with cash-disposable reconciliation', () => {
    const months = year()
    months[0] = {
      state: 'calculated',
      value: {
        ...baseline(1),
        employeeHealthCents: 0,
        employeeCareCents: 0,
        privateInsuranceOutflowCents: 25000,
      },
    }
    const result = aggregateSalaryResults2026(months)
    expect(result.state).toBe('calculated')
    if (result.state === 'calculated') {
      expect(result.months[0]?.netPayrollCents).toBe(372000)
      expect(result.months[0]?.disposableAfterPrivateInsuranceCents).toBe(
        347000,
      )
      expect(result.recurringMonthlyNetIsStable).toBe(false)
      expect(result.recurringMonthlyNetCents).toBeNull()
    }
  })

  it('fails closed for missing months, reversed months and uncalculated components', () => {
    expect(aggregateSalaryResults2026(year().slice(0, 11))).toMatchObject({
      state: 'incomplete',
      reason: 'twelve_payroll_months_required',
    })
    const missing = year()
    missing[4] = { state: 'incomplete', reason: 'unverified_payroll_evidence' }
    expect(aggregateSalaryResults2026(missing)).toMatchObject({
      state: 'incomplete',
      month: 5,
      reason: 'unverified_payroll_evidence',
    })
    const reversed = year()
    reversed[1] = { state: 'calculated', value: baseline(3) }
    expect(aggregateSalaryResults2026(reversed)).toMatchObject({
      state: 'unsupported',
      month: 2,
      reason: 'payroll_month_order_mismatch',
    })
  })

  it('rejects impossible guarantees, fabricated bonus balances and invalid cents', () => {
    const guaranteed = year()
    guaranteed[0] = {
      state: 'calculated',
      value: { ...baseline(1), guaranteedRecurringGrossCents: 600000 },
    }
    expect(aggregateSalaryResults2026(guaranteed)).toMatchObject({
      state: 'unsupported',
      month: 1,
      reason: 'guaranteed_recurring_exceeds_total',
    })
    const invalid = year()
    invalid[0] = {
      state: 'calculated',
      value: { ...baseline(1), employeePensionCents: -1 },
    }
    expect(() => aggregateSalaryResults2026(invalid)).toThrow(RangeError)
    const bonus = year()
    bonus[0] = {
      state: 'calculated',
      value: {
        ...baseline(1),
        oneOffPayments: [
          {
            guarantee: 'guaranteed',
            settlement: {
              state: 'calculated',
              grossCents: 10000,
              wageTaxCents: 2000,
              solidarityCents: 0,
              churchTaxCents: 0,
              employeeInsuranceCents: 1000,
              employerInsuranceCents: 1000,
              netBonusCents: 9999,
              incrementalEmployerCostCents: 11000,
            },
          },
        ],
      },
    }
    expect(aggregateSalaryResults2026(bonus)).toMatchObject({
      state: 'unsupported',
      month: 1,
      reason: 'bonus_cash_reconciliation_failed',
    })
  })
})
