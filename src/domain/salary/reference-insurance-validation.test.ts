import { describe, expect, it } from 'vitest'
import fixtures from '../../../fixtures/reference/2026/nettopilot-reference-scenarios.json'
import { calculatePensionContribution2026 } from './pension'
import { calculateUnemploymentContribution2026 } from './unemployment'
import { calculateStatutoryHealthContribution2026 } from './health'
import { calculateCareContribution2026 } from './care'
import { calculatePrivateInsurance2026 } from './private-insurance'

const social = fixtures.scenarios.filter((item) => item.family === 'social_insurance')
const privateCases = fixtures.scenarios.filter((item) => item.family === 'private_insurance')

describe('NP-CALC-017 independent 2026 contribution fixtures', () => {
  it.each(social)('matches independently sourced employee and employer figures: $id', (fixture) => {
    if (fixture.family !== 'social_insurance') throw new Error('Wrong reference family')
    const inputs = fixture.inputs
    const expected = fixture.expected
    if (!('monthlyLiablePayCents' in inputs) || !('employee' in expected) ||
        !('employer' in expected) || !('state' in inputs) ||
        !('parentStatus' in inputs) || !('qualifyingChildren' in inputs))
      throw new Error('Invalid statutory fixture schema')
    const base = {
      calculationYear: 2026,
      contributionDays: inputs.contributionDays,
      liablePayCents: inputs.monthlyLiablePayCents,
    }
    const pension = calculatePensionContribution2026({
      ...base, coverageStatus: 'general_statutory_mandatory',
    })
    const unemployment = calculateUnemploymentContribution2026({
      ...base, coverageStatus: 'mandatory_standard',
    })
    const health = calculateStatutoryHealthContribution2026({
      ...base, coverageStatus: 'statutory_mandatory_general',
      additionalRate: { mode: 'published_average' },
    })
    const care = calculateCareContribution2026({
      ...base, payrollYear: 2026, payrollMonth: 7,
      insurancePath: 'statutory',
      employmentState: inputs.state === 'SN' ? 'saxony' : 'other',
      parentStatus: inputs.parentStatus === 'parent' ? 'parent' : 'childless',
      qualifyingChildren: inputs.qualifyingChildren,
      birthDate: '1990-01-01',
    })
    expect(pension.state).toBe('calculated')
    expect(unemployment.state).toBe('calculated')
    expect(health.state).toBe('calculated')
    expect(care.state).toBe('calculated')
    if (pension.state !== 'calculated' || unemployment.state !== 'calculated' ||
        health.state !== 'calculated' || care.state !== 'calculated')
      throw new Error('Unexpected reference admission')
    const sources = [pension, unemployment, health, care]
    const categories = ['pensionCents', 'unemploymentCents', 'healthCents', 'careCents'] as const
    for (const [index, component] of sources.entries()) {
      const key = categories[index]
      if (!key) throw new Error('Missing component')
      expect(component.contribution.employeeCents, key).toBe(expected.employee[key])
      expect(component.contribution.employerCents, key).toBe(expected.employer[key])
    }
    expect(sources.reduce((sum, result) => sum + result.contribution.employeeCents, 0))
      .toBe(expected.employee.totalCents)
    expect(sources.reduce((sum, result) => sum + result.contribution.employerCents, 0))
      .toBe(expected.employer.totalCents)
  })

  it.each(privateCases)('matches private employer subsidy fixture: $id', (fixture) => {
    if (fixture.family !== 'private_insurance') throw new Error('Wrong fixture family')
    const inputs = fixture.inputs
    const expected = fixture.expected
    if (!('assessableEmploymentIncomeMonthlyCents' in inputs) ||
        !('subsidyEligibleHealthPremiumMonthlyCents' in inputs) ||
        !('subsidyEligibleCarePremiumMonthlyCents' in inputs) ||
        !('employerHealthSubsidyCents' in expected) ||
        !('employerCareSubsidyCents' in expected))
      throw new Error('Invalid private fixture')
    const result = calculatePrivateInsurance2026({
      calculationYear: 2026,
      coverageConfirmed: true,
      employerSubsidyEligibility: 'eligible',
      employmentState: 'DE-BW',
      valueSource: 'insurer_notice',
      totalHealthPremiumCents: inputs.subsidyEligibleHealthPremiumMonthlyCents,
      totalCarePremiumCents: inputs.subsidyEligibleCarePremiumMonthlyCents,
      subsidyEligibleHealthPremiumCents: inputs.subsidyEligibleHealthPremiumMonthlyCents,
      subsidyEligibleCarePremiumCents: inputs.subsidyEligibleCarePremiumMonthlyCents,
      payrollBasicCoverageCents: inputs.subsidyEligibleHealthPremiumMonthlyCents +
        inputs.subsidyEligibleCarePremiumMonthlyCents,
      assessableEmploymentIncomeCents: inputs.assessableEmploymentIncomeMonthlyCents,
    })
    expect(result.state).toBe('calculated')
    if (result.state !== 'calculated') throw new Error('Unexpected PKV admission')
    expect(result.employerHealthSubsidyCents).toBe(expected.employerHealthSubsidyCents)
    expect(result.employerCareSubsidyCents).toBe(expected.employerCareSubsidyCents)
  })
})
