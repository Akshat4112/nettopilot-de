import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CommuteCostComparison } from './CommuteCostComparison'
import type { CommuteCostEntry } from '../domain/comparison/commute-costs'
import { blankCommuteCostEntry } from '../domain/comparison/commute-costs'

const entry = (): CommuteCostEntry => ({
  workingDaysPerWeek: '5',
  officeDaysPerWeek: '3',
  paidVacationDaysAnnual: '30',
  publicTransportPerOfficeDayEur: '4',
  fuelPerOfficeDayEur: '0',
  parkingPerOfficeDayEur: '0',
  otherPerOfficeDayEur: '0',
})

describe('NP-CMP-006 commute-cost display', () => {
  it('does not invent costs while both offers are unanswered', () => {
    render(
      <CommuteCostComparison
        offerA={blankCommuteCostEntry()}
        offerB={blankCommuteCostEntry()}
      />,
    )
    expect(
      screen.getByText(/Annual commute cost comparison unavailable/),
    ).toBeVisible()
    expect(
      screen.queryByText(/Annual commute difference/),
    ).not.toBeInTheDocument()
  })

  it('shows both entered annual costs and a neutral signed difference', () => {
    render(<CommuteCostComparison offerA={entry()} offerB={entry()} />)
    expect(
      screen.getByText(/Annual commute difference \(B − A\)/),
    ).toBeVisible()
    expect(screen.getAllByText(/expected office days/)).toHaveLength(2)
    expect(screen.getByText(/not payroll deductions/)).toBeVisible()
  })

  it('keeps incomplete Offer B unavailable even if Offer A is known', () => {
    render(
      <CommuteCostComparison
        offerA={entry()}
        offerB={blankCommuteCostEntry()}
      />,
    )
    expect(screen.getByText(/Complete Offer B costs/)).toBeVisible()
    expect(
      screen.queryByText(/Annual commute difference/),
    ).not.toBeInTheDocument()
  })
})
