import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  OfferComparisonSummary,
  type OfferComparisonSummaryInputs,
} from './OfferComparisonSummary'
import {
  blankBenefits,
  type BenefitsEntry,
  type BenefitEntry,
} from '../domain/comparison/benefits'
import { blankRemoteWork } from '../domain/comparison/remote-work'
import { calculateOfferNetCompensation } from './offer-net-calculation'
import { buildOfferPairFromEntries } from './offer-input-validation'
import { OfferComparisonInputs } from './OfferComparisonInputs'
import { renderWithUser } from '../test/render'

const inputs = (): OfferComparisonSummaryInputs => {
  const working = {
    weeklyHours: '40',
    workingDaysPerWeek: '5',
    paidVacationDaysAnnual: '20',
  }
  const commuteCosts = {
    workingDaysPerWeek: '5',
    officeDaysPerWeek: '5',
    paidVacationDaysAnnual: '20',
    publicTransportPerOfficeDayEur: '0',
    fuelPerOfficeDayEur: '5',
    parkingPerOfficeDayEur: '0',
    otherPerOfficeDayEur: '0',
  }
  const commuteTime = {
    workingDaysPerWeek: '5',
    officeDaysPerWeek: '5',
    paidVacationDaysAnnual: '20',
    oneWayMinutes: '30',
  }
  const benefit = {
    id: 'learning',
    label: 'Learning budget',
    certainty: 'guaranteed' as const,
    employerStatedAnnualValueEur: '100.01',
    userAssignedAnnualValueEur: '50.02',
    description: '',
  }
  return {
    working: [working, { ...working, paidVacationDaysAnnual: '25' }],
    commuteCosts: [
      commuteCosts,
      { ...commuteCosts, paidVacationDaysAnnual: '25' },
    ],
    commuteTime: [
      commuteTime,
      { ...commuteTime, paidVacationDaysAnnual: '25' },
    ],
    benefits: [
      {
        ...blankBenefits(),
        employerContributionAnnualEur: '1000',
        benefits: [benefit],
      },
      {
        ...blankBenefits(),
        employerContributionAnnualEur: '1100',
        benefits: [
          {
            ...benefit,
            employerStatedAnnualValueEur: '120.02',
            userAssignedAnnualValueEur: '40.01',
          },
        ],
      },
    ],
    remote: [
      {
        ...blankRemoteWork(),
        arrangement: 'onsite',
        workingDaysPerWeek: '5',
        officeDaysPerWeek: '5',
      },
      {
        ...blankRemoteWork(),
        arrangement: 'hybrid',
        workingDaysPerWeek: '5',
        officeDaysPerWeek: '3',
      },
    ],
    netResult: calculateOfferNetCompensation(
      buildOfferPairFromEntries(
        { grossEur: '4000', period: 'monthly' },
        { grossEur: '5000', period: 'monthly' },
      ),
      {
        essential: {
          year: '2026',
          taxClass: '4',
          federalState: 'DE-BW',
          churchTax: 'not_liable',
          dateOfBirth: '1990-01-01',
          children: '0',
          insurance: 'statutory',
        },
        additionalHealthRatePercent: '',
        standardEmploymentConfirmed: true,
      },
    ),
  }
}

const row = (name: string) =>
  within(screen.getByRole('row', { name: new RegExp('^' + name) }))

const firstBenefit = (entry: BenefitsEntry): BenefitEntry => {
  const benefit = entry.benefits[0]
  if (benefit === undefined)
    throw new Error('Expected a populated test fixture')
  return benefit
}

describe('NP-CMP-012 comparison summary', () => {
  it('compares monetary, time, leave, remote and benefit inputs without ranking', () => {
    render(<OfferComparisonSummary {...inputs()} />)
    expect(
      screen.getByRole('table', {
        name: 'Current offer comparison — EUR, 2026',
      }),
    ).toBeVisible()
    expect(screen.getByRole('columnheader', { name: 'B − A' })).toBeVisible()
    expect(row('Annual base gross').getByText('€48,000.00')).toBeVisible()
    expect(row('Annual base gross').getByText('+€12,000.00')).toBeVisible()
    expect(row('Annual base-pay net').getAllByRole('cell')).toHaveLength(3)
    expect(
      row('Annual contractual work hours').getByText('1,920 hours'),
    ).toBeVisible()
    expect(
      row('Annual contractual work hours').getByText('−40 hours'),
    ).toBeVisible()
    expect(row('Paid vacation days').getByText('+5 days')).toBeVisible()
    expect(
      row('Annual entered commute costs').getByText('−€25.00'),
    ).toBeVisible()
    expect(row('Annual commute time').getByText('−5 hours')).toBeVisible()
    expect(
      row('Remote days per week').getByText('+2 days / week'),
    ).toBeVisible()
    expect(
      row('Employer occupational pension contribution').getByText('+€100.00'),
    ).toBeVisible()
    expect(
      row('Employer-stated benefit values').getByText('+€20.01'),
    ).toBeVisible()
    expect(
      row('User-assigned benefit values').getByText('−€10.01'),
    ).toBeVisible()
    expect(screen.getByText(/52 weeks/)).toHaveTextContent(/two commute trips/)
    expect(screen.getByText(/2026 base pay only/)).toBeVisible()
    expect(screen.getByText(/not added to net pay/)).toBeVisible()
    expect(
      screen.queryByText(/winner|best offer|total score/i),
    ).not.toBeInTheDocument()
  })

  it('preserves known independent rows and the other offer when payroll is unsupported', () => {
    const data = inputs()
    render(
      <OfferComparisonSummary
        {...data}
        netResult={{
          ...data.netResult,
          offers: [
            {
              state: 'unsupported',
              month: 0,
              reason: 'offer_additional_compensation_not_supported',
            },
            data.netResult.offers[1],
          ],
        }}
      />,
    )
    expect(row('Annual base gross').getAllByText(/Unavailable/)).toHaveLength(2)
    expect(row('Annual base gross').getByText('€60,000.00')).toBeVisible()
    expect(
      row('Annual contractual work hours').getByText('1,920 hours'),
    ).toBeVisible()
    expect(
      row('Employer occupational pension contribution').getByText('€1,000.00'),
    ).toBeVisible()
    expect(
      row('Effective net after commute cost per hour').getAllByText(
        /Unavailable/,
      ),
    ).toHaveLength(2)
  })

  it('distinguishes blank benefits and unknown valuations from confirmed zero', () => {
    const data = inputs()
    render(
      <OfferComparisonSummary
        {...data}
        benefits={[
          blankBenefits(),
          {
            ...data.benefits[1],
            benefits: [
              {
                ...firstBenefit(data.benefits[1]),
                userAssignedAnnualValueEur: '',
              },
            ],
          },
        ]}
        remote={[blankRemoteWork(), data.remote[1]]}
      />,
    )
    expect(
      row('Employer-stated benefit values').getByText('Not supplied'),
    ).toBeVisible()
    expect(
      row('User-assigned benefit values').getByText('Unknown — values missing'),
    ).toBeVisible()
    expect(
      row('User-assigned benefit values').queryByText('€0.00'),
    ).not.toBeInTheDocument()
    expect(row('Remote days per week').getByText('Not supplied')).toBeVisible()
    expect(
      row('Employer occupational pension contribution').getByText(
        'Not supplied',
      ),
    ).toBeVisible()
  })

  it('removes stale affected values and deltas on invalid edits', () => {
    const data = inputs()
    const { rerender } = render(<OfferComparisonSummary {...data} />)
    expect(row('Annual commute time').getByText('235 hours')).toBeVisible()
    rerender(
      <OfferComparisonSummary
        {...data}
        commuteTime={[
          data.commuteTime[0],
          { ...data.commuteTime[1], oneWayMinutes: '721' },
        ]}
        benefits={[
          data.benefits[0],
          {
            ...data.benefits[1],
            benefits: [
              {
                ...firstBenefit(data.benefits[1]),
                employerStatedAnnualValueEur: 'invalid',
              },
            ],
          },
        ]}
      />,
    )
    expect(
      row('Annual commute time').queryByText('235 hours'),
    ).not.toBeInTheDocument()
    expect(row('Annual commute time').getAllByText(/Unavailable/)).toHaveLength(
      2,
    )
    expect(
      row('Employer-stated benefit values').queryByText('€120.02'),
    ).not.toBeInTheDocument()
    expect(
      row('Employer-stated benefit values').getAllByText(/Unavailable/),
    ).toHaveLength(2)
    expect(
      row('Annual entered commute costs').getByText('€1,175.00'),
    ).toBeVisible()
    expect(row('Annual base gross').getByText('+€12,000.00')).toBeVisible()
    expect(
      row('User-assigned benefit values').getByText('€40.01'),
    ).toBeVisible()
  })

  it('sums supplied benefit cents exactly and does not mix pension or valuation into net', () => {
    const data = inputs()
    const { rerender } = render(<OfferComparisonSummary {...data} />)
    const net = row('Annual base-pay net')
      .getAllByRole('cell')
      .map((cell) => cell.textContent)
    const hourly = row('Effective net after commute cost per hour')
      .getAllByRole('cell')
      .map((cell) => cell.textContent)
    rerender(
      <OfferComparisonSummary
        {...data}
        benefits={[
          {
            ...data.benefits[0],
            employerContributionAnnualEur: '9000',
            benefits: [
              ...data.benefits[0].benefits,
              {
                ...firstBenefit(data.benefits[0]),
                id: 'second',
                employerStatedAnnualValueEur: '0.02',
                userAssignedAnnualValueEur: '0',
              },
            ],
          },
          data.benefits[1],
        ]}
      />,
    )
    expect(
      row('Employer-stated benefit values').getByText('€100.03'),
    ).toBeVisible()
    expect(
      row('Annual base-pay net')
        .getAllByRole('cell')
        .map((cell) => cell.textContent),
    ).toEqual(net)
    expect(
      row('Effective net after commute cost per hour')
        .getAllByRole('cell')
        .map((cell) => cell.textContent),
    ).toEqual(hourly)
  })

  it('keeps pension and benefit valuations independent and shows confirmed zero', () => {
    const data = inputs()
    render(
      <OfferComparisonSummary
        {...data}
        benefits={[
          { ...data.benefits[0], employerContributionAnnualEur: 'invalid' },
          {
            ...data.benefits[1],
            employerContributionAnnualEur: '0',
            benefits: [
              {
                ...firstBenefit(data.benefits[1]),
                employerStatedAnnualValueEur: '0',
                userAssignedAnnualValueEur: '0',
              },
            ],
          },
        ]}
      />,
    )
    expect(
      row('Employer occupational pension contribution').getAllByText(
        'Unavailable',
      ),
    ).toHaveLength(2)
    expect(
      row('Employer occupational pension contribution').getByText('€0.00'),
    ).toBeVisible()
    expect(
      row('Employer-stated benefit values').getByText('€100.01'),
    ).toBeVisible()
    expect(
      row('Employer-stated benefit values').getByText('−€100.01'),
    ).toBeVisible()
    expect(row('User-assigned benefit values').getByText('€0.00')).toBeVisible()
  })

  it('withholds unknown commute costs while preserving net, leave and commute time', () => {
    const data = inputs()
    render(
      <OfferComparisonSummary
        {...data}
        commuteCosts={[
          data.commuteCosts[0],
          { ...data.commuteCosts[1], fuelPerOfficeDayEur: '' },
        ]}
      />,
    )
    expect(
      row('Annual entered commute costs').getAllByText('Unavailable'),
    ).toHaveLength(2)
    expect(
      row('Annual net after entered commute costs').getAllByText('Unavailable'),
    ).toHaveLength(2)
    expect(
      row('Effective net after commute cost per hour').getAllByText(
        'Unavailable',
      ),
    ).toHaveLength(2)
    expect(
      row('Annual base-pay net').queryByText('Unavailable'),
    ).not.toBeInTheDocument()
    expect(row('Paid vacation days').getByText('+5 days')).toBeVisible()
    expect(row('Annual commute time').getByText('235 hours')).toBeVisible()
  })

  it('preserves exact pension cents at the admitted safe-integer limit and signed deltas', () => {
    const data = inputs()
    const pensionEntries = [
      {
        ...data.benefits[0],
        employerContributionAnnualEur: '90071992547409.90',
      },
      {
        ...data.benefits[1],
        employerContributionAnnualEur: '90071992547409.91',
      },
    ] as const
    const { rerender } = render(
      <OfferComparisonSummary {...data} benefits={pensionEntries} />,
    )
    const pension = row('Employer occupational pension contribution')
    expect(pension.getByText('€90,071,992,547,409.90')).toBeVisible()
    expect(pension.getByText('€90,071,992,547,409.91')).toBeVisible()
    expect(pension.getByText('+€0.01')).toBeVisible()
    rerender(
      <OfferComparisonSummary
        {...data}
        benefits={[pensionEntries[1], pensionEntries[0]]}
      />,
    )
    expect(pension.getByText('−€0.01')).toBeVisible()
    expect(pension.getByText('€90,071,992,547,409.91')).toBeVisible()
  })

  it('keeps remote days independent from excluded allowance and home-office costs', () => {
    const data = inputs()
    render(
      <OfferComparisonSummary
        {...data}
        remote={[
          data.remote[0],
          {
            ...data.remote[1],
            employerAllowanceMonthlyEur: 'invalid',
            homeOfficeCostMonthlyEur: '-1',
          },
        ]}
      />,
    )
    expect(row('Remote days per week').getByText('2 days / week')).toBeVisible()
    expect(
      row('Remote days per week').getByText('+2 days / week'),
    ).toBeVisible()
  })

  it('uses the engine hourly difference before display rounding', () => {
    const data = inputs()
    const [a, b] = data.netResult.offers
    if (a.state !== 'calculated' || b.state !== 'calculated')
      throw new Error('Expected admitted test payroll')
    render(
      <OfferComparisonSummary
        {...data}
        working={[data.working[0], data.working[0]]}
        commuteCosts={[data.commuteCosts[0], data.commuteCosts[0]]}
        commuteTime={[data.commuteTime[0], data.commuteTime[0]]}
        netResult={{
          ...data.netResult,
          offers: [
            { ...a, annual: { ...a.annual, netPayrollCents: 2_400_000 } },
            { ...b, annual: { ...b.annual, netPayrollCents: 3_000_000 } },
          ],
        }}
      />,
    )
    // Both use 2160 work-plus-commute hours and EUR1200 entered travel cost:
    // 22800/2160 = 10.555..., 28800/2160 = 13.333..., delta = 2.777...
    const hourly = row('Effective net after commute cost per hour')
    expect(hourly.getByText('€10.56 / hour')).toBeVisible()
    expect(hourly.getByText('€13.33 / hour')).toBeVisible()
    expect(hourly.getByText('+€2.78 / hour')).toBeVisible()
  })

  it('formats negative adjusted net and effective hourly values with their signs', () => {
    const data = inputs()
    const payroll = data.netResult.offers[0]
    if (payroll.state !== 'calculated')
      throw new Error('Expected admitted test payroll')
    const adjustedCents = payroll.annual.netPayrollCents - 240_000_000
    const expected =
      '-€' +
      Math.floor(-adjustedCents / 100).toLocaleString('en-GB') +
      '.' +
      String(-adjustedCents % 100).padStart(2, '0')
    render(
      <OfferComparisonSummary
        {...data}
        commuteCosts={[
          { ...data.commuteCosts[0], fuelPerOfficeDayEur: '10000' },
          data.commuteCosts[1],
        ]}
      />,
    )
    expect(
      row('Annual net after entered commute costs').getByText(expected),
    ).toBeVisible()
    expect(
      row('Effective net after commute cost per hour').getByRole('cell', {
        name: /^-€[\d,]+\.\d{2} \/ hour$/,
      }),
    ).toHaveAccessibleName(/^-€[\d,]+\.\d{2} \/ hour$/)
  })
})

describe('comparison summary integration', () => {
  it('uses current parent form inputs and keeps the other offer when salary is cleared', async () => {
    const { user } = renderWithUser(<OfferComparisonInputs />)
    expect(
      screen.queryByRole('region', { name: 'Offer comparison summary' }),
    ).not.toBeInTheDocument()
    for (const side of ['A', 'B']) {
      await user.type(
        screen.getByLabelText(`Offer ${side} gross salary (EUR)`),
        '48000',
      )
    }
    await user.selectOptions(screen.getByLabelText('Comparison tax class'), '1')
    await user.selectOptions(
      screen.getByLabelText('Comparison federal state'),
      'DE-BW',
    )
    await user.type(
      screen.getByLabelText('Comparison date of birth'),
      '1990-01-01',
    )
    await user.click(
      screen.getByLabelText(/Confirm shared standard payroll assumptions/),
    )
    await user.click(
      screen.getByRole('button', { name: 'Calculate net compensation' }),
    )
    const summary = within(
      screen.getByRole('region', { name: 'Offer comparison summary' }),
    )
    const gross = within(
      summary.getByRole('row', { name: /^Annual base gross/ }),
    )
    expect(gross.getAllByText('€48,000.00')).toHaveLength(2)
    await user.clear(screen.getByLabelText('Offer A gross salary (EUR)'))
    expect(gross.getAllByText('Unavailable')).toHaveLength(2)
    expect(gross.getByText('€48,000.00')).toBeVisible()
    const net = within(
      summary.getByRole('row', { name: /^Annual base-pay net/ }),
    )
    expect(net.getAllByText('Unavailable')).toHaveLength(2)
    expect(net.getByRole('cell', { name: /^€[\d,]+\.\d{2}$/ })).toBeVisible()
    await user.click(
      screen.getByRole('button', { name: 'Reset payroll assumptions' }),
    )
    expect(
      screen.queryByRole('region', { name: 'Offer comparison summary' }),
    ).not.toBeInTheDocument()
  })

  it('exposes unavailable reasons in an expandable disclosure', async () => {
    const data = inputs()
    const { user } = renderWithUser(
      <OfferComparisonSummary
        {...data}
        commuteTime={[
          data.commuteTime[0],
          { ...data.commuteTime[1], oneWayMinutes: '721' },
        ]}
      />,
    )
    const travel = row('Annual commute time')
    expect(travel.getAllByText('Unavailable')).toHaveLength(2)
    const explanation = travel.getByText('Unavailable', { selector: 'summary' })
    await user.click(explanation)
    expect(
      travel.getByText(/one-way travel must be 0–720 minutes/),
    ).toBeVisible()
    expect(
      row('Annual net after entered commute costs').queryByText('Unavailable'),
    ).not.toBeInTheDocument()
  })
})
