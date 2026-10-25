import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithUser } from '../test/render'
import { OfferComparisonInputs } from './OfferComparisonInputs'

describe('NP-CMP-002 offer salary inputs', () => {
  it('keeps offer A and B independent and can copy one into the other', async () => {
    const { user } = renderWithUser(<OfferComparisonInputs />)
    const offerA = screen.getByRole('textbox', {
      name: 'Offer A gross salary (EUR)',
    })
    const offerB = screen.getByRole('textbox', {
      name: 'Offer B gross salary (EUR)',
    })
    await user.type(offerA, '85000')
    await user.type(offerB, '92000')
    expect(offerA).toHaveValue('85000')
    expect(offerB).toHaveValue('92000')
    await user.click(
      screen.getByRole('button', { name: 'Copy Offer A to Offer B' }),
    )
    expect(offerB).toHaveValue('85000')
    await user.click(screen.getByRole('button', { name: 'Clear Offer B' }))
    expect(offerB).toHaveValue('')
    expect(offerA).toHaveValue('85000')
  })

  it('shows two field-specific missing-input messages', async () => {
    const { user } = renderWithUser(<OfferComparisonInputs />)
    await user.click(screen.getByRole('button', { name: 'Check both offers' }))
    expect(screen.getAllByRole('alert')).toHaveLength(2)
    expect(
      screen.getByRole('textbox', {
        name: 'Offer A gross salary (EUR)',
      }),
    ).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('Unknown inputs')
  })

  it('validates exact entered base gross without inventing net differences', async () => {
    const { user } = renderWithUser(<OfferComparisonInputs />)
    await user.type(
      screen.getByRole('textbox', {
        name: 'Offer A gross salary (EUR)',
      }),
      '50000.00',
    )
    await user.type(
      screen.getByRole('textbox', {
        name: 'Offer B gross salary (EUR)',
      }),
      '60000.25',
    )
    await user.click(screen.getByRole('button', { name: 'Check both offers' }))
    expect(screen.getByRole('status')).toHaveTextContent(
      'No net-pay difference',
    )
    expect(screen.queryAllByRole('alert')).toHaveLength(0)
  })
})
