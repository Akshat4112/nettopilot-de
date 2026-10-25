import { describe, expect, it } from 'vitest'
import fixtures from '../../../fixtures/reference/2026/nettopilot-reference-scenarios.json'
import { calculateSolidaritySurcharge2026 } from './solidarity-surcharge'
import { calculateChurchTax2026 } from './church-tax'

const soli = fixtures.scenarios.filter((item) => item.family === 'solidarity_surcharge')
const admission = fixtures.scenarios.filter((item) => item.family === 'admission')

describe('NP-CALC-017 verified withholding and admission fixtures', () => {
  it.each(soli)('matches independently derived solidarity surcharge: $id', (fixture) => {
    if (!('annualAssessmentBaseCents' in fixture.inputs) ||
        !('annualSolidaritySurchargeCents' in fixture.expected))
      throw new Error('Invalid solidarity fixture')
    const result = calculateSolidaritySurcharge2026({
      calculationYear: 2026,
      annualAssessmentBaseCents: fixture.inputs.annualAssessmentBaseCents,
      tariffMultiplier: 1,
      paymentPeriod: 'annual',
    })
    expect(result.annualSurchargeCents).toBe(fixture.expected.annualSolidaritySurchargeCents)
  })

  it('gates church liability without approved state evidence', () => {
    const fixture = admission.find((item) => item.id === 'CHURCH-STATE-SOURCE-GATE')
    if (!fixture || !('churchTaxStatus' in fixture.inputs))
      throw new Error('Missing church gate fixture')
    const result = calculateChurchTax2026({
      calculationYear: 2026,
      status: 'liable',
      payrollEstablishmentState: 'DE-BE',
      recurringAssessmentBaseCents: 12345,
      otherRemunerationAssessmentBaseCents: 0,
      payrollMarkerEvidence: 'confirmed',
      childAllowanceFactorKnown: true,
    })
    expect(result.state).toBe(fixture.expected.churchTaxResultState)
    expect(fixture.expected).toHaveProperty('normalChurchTaxAmount', false)
  })
})
