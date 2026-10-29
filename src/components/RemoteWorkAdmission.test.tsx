import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithUser } from '../test/render'
import { OfferComparisonInputs } from './OfferComparisonInputs'

describe('independent remote-work admission', () => {
  it.each([
    ['allowance', '0'],
    ['allowance', '50'],
    ['expenses', '15.25'],
    ['arrangement', 'onsite'],
    ['arrangement', 'hybrid'],
    ['arrangement', 'remote'],
  ])(
    'accepts a complete schedule with %s %s and no commute inputs',
    async (kind, value) => {
      const { user } = renderWithUser(<OfferComparisonInputs />)
      await user.type(
        screen.getByRole('textbox', { name: 'Offer A gross salary (EUR)' }),
        '50000',
      )
      await user.type(
        screen.getByRole('textbox', { name: 'Offer B gross salary (EUR)' }),
        '60000',
      )
      await user.type(
        screen.getByRole('textbox', {
          name: 'Offer A contractual weekly hours',
        }),
        '40',
      )
      await user.selectOptions(
        screen.getByRole('combobox', { name: 'Offer A working days per week' }),
        '5',
      )
      await user.type(
        screen.getByRole('textbox', {
          name: 'Offer A paid vacation days per year',
        }),
        '30',
      )
      if (kind === 'arrangement') {
        await user.selectOptions(
          screen.getByRole('combobox', { name: 'Offer A work arrangement' }),
          value,
        )
      } else {
        await user.type(
          screen.getByRole('textbox', {
            name:
              kind === 'allowance'
                ? 'Offer A employer home-office allowance monthly (EUR)'
                : 'Offer A home-office expenses monthly (EUR)',
          }),
          value,
        )
      }
      await user.click(
        screen.getByRole('button', { name: 'Check both offers' }),
      )
      expect(screen.getByRole('status')).toHaveTextContent(
        'Both base salaries are valid',
      )
      expect(screen.queryAllByRole('alert')).toHaveLength(0)
      expect(
        screen.queryByText(/Expected remote work: \d/),
      ).not.toBeInTheDocument()
    },
  )

  it('accepts office frequency and travel time without requiring daily costs', async () => {
    const { user } = renderWithUser(<OfferComparisonInputs />)
    await user.type(
      screen.getByRole('textbox', { name: 'Offer A gross salary (EUR)' }),
      '50000',
    )
    await user.type(
      screen.getByRole('textbox', { name: 'Offer B gross salary (EUR)' }),
      '60000',
    )
    await user.type(
      screen.getByRole('textbox', { name: 'Offer A contractual weekly hours' }),
      '40',
    )
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Offer A working days per week' }),
      '5',
    )
    await user.type(
      screen.getByRole('textbox', {
        name: 'Offer A paid vacation days per year',
      }),
      '30',
    )
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Offer A office days per week' }),
      '3',
    )
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Offer A work arrangement' }),
      'hybrid',
    )
    await user.click(screen.getByRole('button', { name: 'Check both offers' }))
    expect(screen.getByRole('status')).toHaveTextContent(
      'Both base salaries are valid',
    )
    expect(screen.queryAllByRole('alert')).toHaveLength(0)
    expect(
      screen.getByText(/Expected remote work: 2 days per week/),
    ).toBeInTheDocument()
    await user.type(
      screen.getByRole('textbox', {
        name: 'Offer A one-way commute (minutes)',
      }),
      '30',
    )
    await user.click(screen.getByRole('button', { name: 'Check both offers' }))
    expect(screen.getByRole('status')).toHaveTextContent(
      'Both base salaries are valid',
    )
    expect(screen.queryAllByRole('alert')).toHaveLength(0)
    await user.type(
      screen.getByRole('textbox', {
        name: 'Offer A fuel per office day (EUR)',
      }),
      '1',
    )
    await user.click(screen.getByRole('button', { name: 'Check both offers' }))
    expect(screen.getByRole('status')).toHaveTextContent('Complete or correct')
    expect(
      screen
        .getAllByRole('alert')
        .some((alert) => alert.textContent.includes('every daily cost')),
    ).toBe(true)
  })
})
