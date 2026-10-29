import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EffectiveHourlyComparison } from './EffectiveHourlyComparison'
import type { EffectiveHourlyInputs } from '../domain/comparison/effective-hourly'
import { calculateOfferNetCompensation } from './offer-net-calculation'
import { buildOfferPairFromEntries } from './offer-input-validation'

const inputs = (): EffectiveHourlyInputs => {
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
  return {
    working: [working, working],
    commuteCosts: [commuteCosts, commuteCosts],
    commuteTime: [commuteTime, commuteTime],
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

describe('NP-CMP-011 effective hourly display', () => {
  it('shows the annual net, entered costs and time basis without ranking offers', () => {
    render(<EffectiveHourlyComparison {...inputs()} />)
    const a = within(
      screen.getByRole('region', { name: 'Offer A effective hourly result' }),
    )
    expect(a.getByText('Annual base-pay net')).toBeVisible()
    expect(a.getByText('€1,200.00')).toBeVisible()
    expect(a.getByText('1,920 hours')).toBeVisible()
    expect(a.getByText('240 hours')).toBeVisible()
    expect(a.getByText('2,160 hours')).toBeVisible()
    expect(screen.getByText(/Hourly difference \(B − A\): \+/)).toBeVisible()
    expect(
      screen.getByText(/benefits and employer pension are excluded/i),
    ).toBeVisible()
    expect(screen.getByText(/52 weeks/)).toBeVisible()
    expect(
      screen.queryByText(/winner|best offer|score/i),
    ).not.toBeInTheDocument()
  })

  it('withholds a delta for an unknown cost while preserving the other offer', () => {
    const data = inputs()
    render(
      <EffectiveHourlyComparison
        {...data}
        commuteCosts={[
          data.commuteCosts[0],
          { ...data.commuteCosts[1], fuelPerOfficeDayEur: '' },
        ]}
      />,
    )
    const a = within(
      screen.getByRole('region', { name: 'Offer A effective hourly result' }),
    )
    const b = within(
      screen.getByRole('region', { name: 'Offer B effective hourly result' }),
    )
    expect(
      a.getByText('Effective net after commute cost per hour'),
    ).toBeVisible()
    expect(b.getByText(/unavailable.*commute costs/i)).toBeVisible()
    expect(
      screen.queryByText(/Hourly difference \(B − A\):/),
    ).not.toBeInTheDocument()
  })

  it('replaces previous results immediately when current time input becomes invalid', () => {
    const data = inputs()
    const { rerender } = render(<EffectiveHourlyComparison {...data} />)
    const b = within(
      screen.getByRole('region', { name: 'Offer B effective hourly result' }),
    )
    expect(
      b.getByText('Effective net after commute cost per hour'),
    ).toBeVisible()
    rerender(
      <EffectiveHourlyComparison
        {...data}
        commuteTime={[
          data.commuteTime[0],
          { ...data.commuteTime[1], oneWayMinutes: '721' },
        ]}
      />,
    )
    expect(
      b.queryByText('Effective net after commute cost per hour'),
    ).not.toBeInTheDocument()
    expect(b.getByText(/unavailable.*commute time/i)).toBeVisible()
    expect(
      screen.queryByText(/Hourly difference \(B − A\):/),
    ).not.toBeInTheDocument()
  })

  it('names the blocked payroll side without hiding the valid offer', () => {
    const data = inputs()
    render(
      <EffectiveHourlyComparison
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
    expect(
      within(
        screen.getByRole('region', { name: 'Offer A effective hourly result' }),
      ).getByText(/unavailable.*payroll/i),
    ).toBeVisible()
    expect(
      within(
        screen.getByRole('region', { name: 'Offer B effective hourly result' }),
      ).getByText('Effective net after commute cost per hour'),
    ).toBeVisible()
  })
})
