import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithUser } from '../test/render'
import { OfferComparisonInputs } from './OfferComparisonInputs'

describe('NP-CMP-010 comparison payroll', () => {
  it('calculates equivalent monthly and annual offers and updates current inputs without stale differences', async () => {
    const { user } = renderWithUser(<OfferComparisonInputs />)
    await user.type(
      screen.getByRole('textbox', { name: 'Offer A gross salary (EUR)' }),
      '48000',
    )
    await user.type(
      screen.getByRole('textbox', { name: 'Offer B gross salary (EUR)' }),
      '4000',
    )
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Offer B pay frequency' }),
      'monthly',
    )
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Comparison tax class' }),
      '1',
    )
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Comparison federal state' }),
      'DE-BW',
    )
    await user.type(
      screen.getByLabelText('Comparison date of birth'),
      '1990-01-01',
    )
    await user.click(
      screen.getByRole('checkbox', {
        name: /Confirm shared standard payroll assumptions/,
      }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Calculate net compensation' }),
    )
    const results = within(
      screen.getByRole('region', { name: 'Offer net compensation results' }),
    )
    expect(
      results.getByText('Estimated recurring net pay is equal.'),
    ).toBeInTheDocument()
    expect(results.getByText(/Annual net difference/)).toHaveTextContent(/0.00/)
    await user.type(
      screen.getByRole('textbox', {
        name: 'Offer A expected annual variable pay (EUR)',
      }),
      '500',
    )
    expect(results.queryByText(/Annual net difference/)).not.toBeInTheDocument()
    expect(
      within(
        results.getByRole('region', { name: 'Offer A net result' }),
      ).getByText(/Offer A:.*Additional.*not supported/),
    ).toBeInTheDocument()
    expect(
      results.getByRole('region', { name: 'Offer B net result' }),
    ).toBeInTheDocument()
    await user.clear(
      screen.getByRole('textbox', {
        name: 'Offer A expected annual variable pay (EUR)',
      }),
    )
    expect(
      results.getByText('Estimated recurring net pay is equal.'),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole('checkbox', {
        name: /Confirm shared standard payroll assumptions/,
      }),
    )
    expect(results.queryByText(/Annual net difference/)).not.toBeInTheDocument()
    for (const label of ['Offer A', 'Offer B']) {
      expect(
        within(
          results.getByRole('region', { name: label + ' net result' }),
        ).getByText(/Confirm the shared.*assumptions/),
      ).toBeInTheDocument()
    }
  })

  it('explains missing inputs and clears sensitive shared context on reset', async () => {
    const { user } = renderWithUser(<OfferComparisonInputs />)
    await user.click(
      screen.getByRole('button', { name: 'Calculate net compensation' }),
    )
    expect(
      screen.getByRole('region', { name: 'Offer net compensation results' }),
    ).toHaveTextContent(/unavailable/)
    await user.type(
      screen.getByLabelText('Comparison date of birth'),
      '1990-01-01',
    )
    await user.type(
      screen.getByRole('textbox', {
        name: 'Comparison additional health rate (%)',
      }),
      '3.5',
    )
    await user.click(
      screen.getByRole('button', { name: 'Reset payroll assumptions' }),
    )
    expect(screen.getByLabelText('Comparison date of birth')).toHaveValue('')
    expect(
      screen.getByRole('textbox', {
        name: 'Comparison additional health rate (%)',
      }),
    ).toHaveValue('')
    expect(
      screen.queryByRole('region', { name: 'Offer net compensation results' }),
    ).not.toBeInTheDocument()
  })
})

describe('per-offer raw validation', () => {
  it('keeps the other supported result when a one-time payment is missing its month', async () => {
    const { user } = renderWithUser(<OfferComparisonInputs />)
    for (const side of ['A', 'B'])
      await user.type(
        screen.getByRole('textbox', {
          name: `Offer ${side} gross salary (EUR)`,
        }),
        '48000',
      )
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Comparison tax class' }),
      '1',
    )
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Comparison federal state' }),
      'DE-BW',
    )
    await user.type(
      screen.getByLabelText('Comparison date of birth'),
      '1990-01-01',
    )
    await user.click(
      screen.getByRole('checkbox', {
        name: /Confirm shared standard payroll assumptions/,
      }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Calculate net compensation' }),
    )
    await user.type(
      screen.getByRole('textbox', { name: 'Offer B one-time payment (EUR)' }),
      '1000',
    )
    const results = within(
      screen.getByRole('region', { name: 'Offer net compensation results' }),
    )
    expect(
      results.getByRole('region', { name: 'Offer A net result' }),
    ).toHaveTextContent('Estimated annual recurring net pay')
    expect(
      results.getByRole('region', { name: 'Offer B net result' }),
    ).toHaveTextContent('unavailable')
    expect(results.queryByText(/Annual net difference/)).not.toBeInTheDocument()
  })
})
