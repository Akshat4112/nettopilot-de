import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CommuteTimeComparison } from './CommuteTimeComparison'
import {
  blankCommuteTime,
  type CommuteTimeEntry,
} from '../domain/comparison/commute-time'

const entry = (): CommuteTimeEntry => ({
  workingDaysPerWeek: '5',
  officeDaysPerWeek: '3',
  paidVacationDaysAnnual: '30',
  oneWayMinutes: '35',
})

describe('NP-CMP-007 annual commute time display', () => {
  it('keeps unknown commute time unavailable', () => {
    render(
      <CommuteTimeComparison offerA={entry()} offerB={blankCommuteTime()} />,
    )
    expect(screen.getByText(/Annual commute time unavailable/)).toBeVisible()
    expect(
      screen.queryByText(/Annual commute time difference/),
    ).not.toBeInTheDocument()
  })

  it('explains the round-trip time basis without converting hours to salary', () => {
    render(
      <CommuteTimeComparison
        offerA={entry()}
        offerB={{ ...entry(), oneWayMinutes: '20' }}
      />,
    )
    expect(
      screen.getByText(/Annual commute time difference \(B − A\)/),
    ).toBeVisible()
    expect(screen.getByText(/no invented euro value/)).toBeVisible()
    expect(screen.getByText(/two trips per office day/)).toBeVisible()
  })

  it('identifies invalid schedules on either offer', () => {
    render(
      <CommuteTimeComparison
        offerA={{ ...entry(), oneWayMinutes: '721' }}
        offerB={{ ...entry(), officeDaysPerWeek: '7' }}
      />,
    )
    expect(screen.getByText(/Review Offer A\. Review Offer B\./)).toBeVisible()
  })
})
