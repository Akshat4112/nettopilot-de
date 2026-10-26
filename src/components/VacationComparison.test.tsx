import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { VacationComparison } from './VacationComparison'
import { blankWorkingTime } from '../domain/comparison/working-time'

describe('NP-CMP-005 vacation display', () => {
  it('keeps missing values explicitly unavailable', () => {
    render(
      <VacationComparison
        offerA={blankWorkingTime()}
        offerB={blankWorkingTime()}
      />,
    )
    expect(screen.getByText(/Vacation comparison unavailable/)).toBeVisible()
    expect(screen.queryByText('0 days')).not.toBeInTheDocument()
  })

  it('explains the time denominator, but not fictitious cash value', () => {
    render(
      <VacationComparison
        offerA={{ weeklyHours: '40', workingDaysPerWeek: '5', paidVacationDaysAnnual: '20' }}
        offerB={{ weeklyHours: '40', workingDaysPerWeek: '5', paidVacationDaysAnnual: '30' }}
      />,
    )
    expect(screen.getByText(/difference \(B − A\): \+10 days/)).toBeVisible()
    expect(screen.getByText(/Net per hour remains unavailable/)).toBeVisible()
    expect(screen.getByText(/No cash value is assigned/)).toBeVisible()
  })
})
