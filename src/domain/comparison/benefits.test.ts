import { describe, expect, it } from 'vitest'
import { createEmptyOfferComparison } from './offer-model'
import {
  attachBenefits,
  blankBenefit,
  blankBenefits,
  evaluateBenefits,
} from './benefits'

const entry = () => ({
  ...blankBenefits(),
  employerContributionAnnualEur: '2400.25',
  pensionCertainty: 'conditional' as const,
  eligibilityOrVestingNote: 'After probation',
  benefits: [
    {
      ...blankBenefit('mobility'),
      label: 'Mobility budget',
      certainty: 'guaranteed' as const,
      employerStatedAnnualValueEur: '1200.10',
      userAssignedAnnualValueEur: '600.03',
      description: 'Personal annual usefulness',
    },
  ],
})

describe('NP-CMP-009 pension and benefit inputs', () => {
  it('retains blank pension and benefit values as unknown', () => {
    expect(evaluateBenefits(blankBenefits())).toEqual({
      state: 'valid',
      employerPension: {
        employerContributionAnnual: { state: 'unknown' },
        certainty: 'unknown',
        eligibilityOrVestingNote: { state: 'unknown' },
      },
      benefits: [],
      taxTreatment: 'not_calculated',
      cashIntegration: 'excluded',
    })
    expect(
      evaluateBenefits({
        ...blankBenefits(),
        benefits: [{ ...blankBenefit('gym'), label: 'Gym' }],
      }),
    ).toMatchObject({
      state: 'valid',
      benefits: [
        {
          employerStatedAnnualValue: { state: 'unknown' },
          userAssignedAnnualValue: { state: 'unknown' },
          description: { state: 'unknown' },
        },
      ],
    })
  })

  it('keeps employer and personal valuations separate with cent precision', () => {
    expect(evaluateBenefits(entry())).toMatchObject({
      state: 'valid',
      employerPension: {
        employerContributionAnnual: {
          state: 'provided',
          value: { amount: '2400.25', currency: 'EUR' },
          source: 'user_entry',
        },
        certainty: 'conditional',
        eligibilityOrVestingNote: {
          state: 'provided',
          value: 'After probation',
        },
      },
      benefits: [
        {
          id: 'mobility',
          label: 'Mobility budget',
          certainty: 'guaranteed',
          employerStatedAnnualValue: {
            state: 'provided',
            value: { amount: '1200.10', currency: 'EUR' },
          },
          userAssignedAnnualValue: {
            state: 'provided',
            value: { amount: '600.03', currency: 'EUR' },
          },
        },
      ],
      taxTreatment: 'not_calculated',
      cashIntegration: 'excluded',
    })
  })

  it('distinguishes explicit zero from unknown and never infers a valuation', () => {
    expect(
      evaluateBenefits({
        ...blankBenefits(),
        employerContributionAnnualEur: '0',
        benefits: [
          {
            ...blankBenefit('gym'),
            label: 'Gym',
            employerStatedAnnualValueEur: '0.00',
          },
        ],
      }),
    ).toMatchObject({
      state: 'valid',
      employerPension: {
        employerContributionAnnual: {
          state: 'provided',
          value: { amount: '0.00', currency: 'EUR' },
        },
      },
      benefits: [
        {
          employerStatedAnnualValue: {
            state: 'provided',
            value: { amount: '0.00', currency: 'EUR' },
          },
          userAssignedAnnualValue: { state: 'unknown' },
        },
      ],
    })
  })

  it('rejects negative, sub-cent, malformed and unsafe annual amounts', () => {
    for (const raw of [
      '-1',
      '0.001',
      '1e3',
      'Infinity',
      'NaN',
      '1,00',
      ' 1',
      '01',
      '90071992547409.92',
      '99999999999999999999999999999',
    ]) {
      expect(
        evaluateBenefits({ ...entry(), employerContributionAnnualEur: raw })
          .state,
        `pension ${raw}`,
      ).toBe('invalid')
      for (const field of [
        'employerStatedAnnualValueEur',
        'userAssignedAnnualValueEur',
      ]) {
        expect(
          evaluateBenefits({
            ...entry(),
            benefits: [
              { ...blankBenefit('mobility'), label: 'Mobility', [field]: raw },
            ],
          }).state,
          `${field} ${raw}`,
        ).toBe('invalid')
      }
    }
  })

  it('preserves exact amounts at the safe integer cent boundary', () => {
    expect(
      evaluateBenefits({
        ...blankBenefits(),
        employerContributionAnnualEur: '90071992547409.91',
      }),
    ).toMatchObject({
      state: 'valid',
      employerPension: {
        employerContributionAnnual: {
          value: { amount: '90071992547409.91', currency: 'EUR' },
        },
      },
    })
  })

  it('requires a label and unique stable id for every retained benefit row', () => {
    for (const benefits of [
      [blankBenefit('gym')],
      [{ ...blankBenefit(''), label: 'Gym' }],
      [
        { ...blankBenefit('gym'), label: 'Gym' },
        { ...blankBenefit('gym'), label: 'Another gym' },
      ],
    ]) {
      expect(evaluateBenefits({ ...blankBenefits(), benefits }).state).toBe(
        'invalid',
      )
    }
  })

  it('enforces the product limit of 20 benefit rows', () => {
    const benefits = Array.from({ length: 20 }, (_, index) => ({
      ...blankBenefit(`benefit-${String(index)}`),
      label: `Benefit ${String(index)}`,
    }))
    expect(evaluateBenefits({ ...blankBenefits(), benefits }).state).toBe(
      'valid',
    )
    expect(
      evaluateBenefits({
        ...blankBenefits(),
        benefits: [...benefits, { ...blankBenefit('extra'), label: 'Extra' }],
      }).state,
    ).toBe('invalid')
  })

  it('accepts trimmed labels through 120 characters and rejects longer labels', () => {
    for (const label of ['X', `  ${'X'.repeat(120)}  `]) {
      expect(
        evaluateBenefits({
          ...blankBenefits(),
          benefits: [{ ...blankBenefit('one'), label }],
        }),
      ).toMatchObject({ state: 'valid', benefits: [{ label: label.trim() }] })
    }
    expect(
      evaluateBenefits({
        ...blankBenefits(),
        benefits: [{ ...blankBenefit('one'), label: 'X'.repeat(121) }],
      }).state,
    ).toBe('invalid')
  })

  it('limits each employer and personal benefit valuation to annual EUR 1,000,000', () => {
    for (const field of [
      'employerStatedAnnualValueEur',
      'userAssignedAnnualValueEur',
    ]) {
      for (const raw of ['0', '999999.99', '1000000', '1000000.00']) {
        expect(
          evaluateBenefits({
            ...blankBenefits(),
            benefits: [
              { ...blankBenefit('one'), label: 'Benefit', [field]: raw },
            ],
          }).state,
          `${field} ${raw}`,
        ).toBe('valid')
      }
      for (const raw of ['1000000.01', '90071992547409.91']) {
        expect(
          evaluateBenefits({
            ...blankBenefits(),
            benefits: [
              { ...blankBenefit('one'), label: 'Benefit', [field]: raw },
            ],
          }).state,
          `${field} ${raw}`,
        ).toBe('invalid')
      }
    }
  })

  it('attaches each offer independently without changing compensation or other dimensions', () => {
    const original = createEmptyOfferComparison()
    const result = attachBenefits(original, [entry(), blankBenefits()])
    expect(
      result.offers[0].employerPension.employerContributionAnnual,
    ).toMatchObject({
      state: 'provided',
      value: { amount: '2400.25' },
    })
    expect(result.offers[0].benefits).toHaveLength(1)
    expect(result.offers[1].benefits).toEqual([])
    expect(result.offers[1].employerPension).toEqual(
      original.offers[1].employerPension,
    )
    for (const index of [0, 1] as const) {
      expect(result.offers[index].compensation).toBe(
        original.offers[index].compensation,
      )
      expect(result.offers[index].workingTime).toBe(
        original.offers[index].workingTime,
      )
      expect(result.offers[index].commute).toBe(original.offers[index].commute)
      expect(result.offers[index].remoteWork).toBe(
        original.offers[index].remoteWork,
      )
    }
    expect(original.offers[0].benefits).toEqual([])
  })

  it('preserves prior valid pension and benefit terms for an invalid offer only', () => {
    const initial = attachBenefits(createEmptyOfferComparison(), [
      entry(),
      blankBenefits(),
    ])
    const result = attachBenefits(initial, [
      { ...entry(), employerContributionAnnualEur: '-1' },
      { ...blankBenefits(), employerContributionAnnualEur: '1000' },
    ])
    expect(result.offers[0].employerPension).toBe(
      initial.offers[0].employerPension,
    )
    expect(result.offers[0].benefits).toBe(initial.offers[0].benefits)
    expect(
      result.offers[1].employerPension.employerContributionAnnual,
    ).toMatchObject({
      state: 'provided',
      value: { amount: '1000.00' },
    })
  })
})
