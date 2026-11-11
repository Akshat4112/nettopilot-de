import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type {
  OfferComparisonMetrics,
  OfferMetrics,
} from './offer-comparison-metrics'
import { OfferComparisonShare } from './OfferComparisonShare'
import { renderWithUser } from '../test/render'

const blank: OfferMetrics = {
  gross: { amount: null, missing: 'Not supplied' },
  deductions: { amount: null, missing: 'Not supplied' },
  net: { amount: null, missing: 'Not supplied' },
  afterCommute: { amount: null, missing: 'Not supplied' },
  hourly: { amount: null, missing: 'Not supplied' },
  work: { amount: null, missing: 'Not supplied' },
  workingDays: { amount: null, missing: 'Not supplied' },
  totalHours: { amount: null, missing: 'Not supplied' },
  vacation: { amount: null, missing: 'Not supplied' },
  commuteCost: { amount: null, missing: 'Not supplied' },
  commuteTime: { amount: null, missing: 'Not supplied' },
  remote: { amount: null, missing: 'Not supplied' },
  pension: { amount: null, missing: 'Not supplied' },
  employerBenefits: { amount: null, missing: 'Not supplied' },
  personalBenefits: { amount: null, missing: 'Not supplied' },
}

const metrics = (amount: number): OfferComparisonMetrics => ({
  offers: [
    { ...blank, gross: { amount, missing: '' } },
    { ...blank, gross: { amount: amount + 100, missing: '' } },
  ],
  hourlyDifference: null,
})

describe('NP-CMP-014 user consent for comparison sharing', () => {
  it('keeps both export actions disabled until an explicit acknowledgement', async () => {
    const { user } = renderWithUser(
      <OfferComparisonShare metrics={metrics(4800000)} />,
    )
    const checkbox = screen.getByRole('checkbox', {
      name: /I understand this export contains private compensation figures/,
    })
    const copy = screen.getByRole('button', { name: 'Copy comparison as text' })
    const download = screen.getByRole('button', {
      name: 'Download comparison (.txt)',
    })
    expect(checkbox).not.toBeChecked()
    expect(copy).toBeDisabled()
    expect(download).toBeDisabled()
    expect(screen.getByText(/Nothing is uploaded/)).toBeInTheDocument()
    await user.click(checkbox)
    expect(copy).toBeEnabled()
    expect(download).toBeEnabled()
    await user.click(checkbox)
    expect(copy).toBeDisabled()
  })

  it('revokes consent immediately when a current comparison figure changes', async () => {
    const { user, rerender } = renderWithUser(
      <OfferComparisonShare metrics={metrics(4800000)} />,
    )
    const checkbox = screen.getByRole('checkbox', {
      name: /I understand this export contains private compensation figures/,
    })
    await user.click(checkbox)
    expect(checkbox).toBeChecked()
    rerender(<OfferComparisonShare metrics={metrics(6000000)} />)
    expect(checkbox).not.toBeChecked()
    expect(
      screen.getByRole('button', { name: 'Copy comparison as text' }),
    ).toBeDisabled()
  })
})
