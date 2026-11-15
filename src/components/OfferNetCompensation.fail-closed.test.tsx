import { openOfferCategories } from '../test/offer-categories'
import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithUser } from '../test/render'
import { OfferComparisonInputs } from './OfferComparisonInputs'

describe('NP-QA-022 one-sided payroll admission', () => {
  it.each(['A', 'B'] as const)(
    'does not expose a net delta when Offer %s has invalid gross pay',
    async (blockedSide) => {
      const { user } = renderWithUser(<OfferComparisonInputs />)
      for (const side of ['A', 'B']) {
        await user.type(
          screen.getByRole('textbox', {
            name: `Offer ${side} gross salary (EUR)`,
          }),
          '48000',
        )
      }
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
      expect(results.getByText(/Annual net difference/)).toBeInTheDocument()

      const blockedInput = screen.getByRole('textbox', {
        name: `Offer ${blockedSide} gross salary (EUR)`,
      })
      await user.clear(blockedInput)
      await user.type(blockedInput, 'not-a-number')

      const supportedSide = blockedSide === 'A' ? 'B' : 'A'
      expect(
        results.getByRole('region', {
          name: `Offer ${supportedSide} net result`,
        }),
      ).toHaveTextContent('Estimated annual recurring net pay')
      expect(
        results.getByRole('region', {
          name: `Offer ${blockedSide} net result`,
        }),
      ).toHaveTextContent('unavailable')
      const announcement = results.getByText(/Offer payroll results updated\\./)
      expect(announcement).toHaveTextContent(
        `Offer ${blockedSide} result unavailable.`,
      )
      expect(announcement).toHaveTextContent(
        'Net difference unavailable until both offers are supported.',
      )
      expect(announcement).not.toHaveTextContent('Annual B minus A:')

      const annualDifference = results.queryByText(/Annual net difference/)
      const monthlyDifference = results.queryByText(/Monthly net difference/)
      expect(annualDifference).not.toBeInTheDocument()
      expect(monthlyDifference).not.toBeInTheDocument()
      const unavailableDifference = results.getByText(
        /A net-pay difference is unavailable until both offers/,
      )
      expect(unavailableDifference).toBeInTheDocument()

      await user.clear(blockedInput)
      await user.type(blockedInput, '48000')
      expect(results.getByText(/Annual net difference/)).toBeInTheDocument()
    },
  )

  it.each(['A', 'B'] as const)(
    'keeps the other offer visible when Offer %s has an unsupported one-time payment',
    async (blockedSide) => {
      const { user } = renderWithUser(<OfferComparisonInputs />)
      await openOfferCategories(user, 'Cash compensation')
      for (const side of ['A', 'B']) {
        await user.type(
          screen.getByRole('textbox', {
            name: `Offer ${side} gross salary (EUR)`,
          }),
          '48000',
        )
      }
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
      const payment = screen.getByRole('textbox', {
        name: `Offer ${blockedSide} one-time payment (EUR)`,
      })
      await user.type(payment, '1000')

      const results = within(
        screen.getByRole('region', { name: 'Offer net compensation results' }),
      )
      const supportedSide = blockedSide === 'A' ? 'B' : 'A'
      expect(
        results.getByRole('region', {
          name: `Offer ${supportedSide} net result`,
        }),
      ).toHaveTextContent('Estimated annual recurring net pay')
      expect(
        results.getByRole('region', {
          name: `Offer ${blockedSide} net result`,
        }),
      ).toHaveTextContent('unavailable')
      const annualDifference = results.queryByText(/Annual net difference/)
      const monthlyDifference = results.queryByText(/Monthly net difference/)
      expect(annualDifference).not.toBeInTheDocument()
      expect(monthlyDifference).not.toBeInTheDocument()
      const announcement = results.getByText(/Offer payroll results updated\\./)
      expect(announcement).toHaveTextContent(
        `Offer ${blockedSide} result unavailable.`,
      )
      expect(announcement).toHaveTextContent(
        'Net difference unavailable until both offers are supported.',
      )
      expect(announcement).not.toHaveTextContent('Annual B minus A:')
      await user.clear(payment)
      expect(results.getByText(/Annual net difference/)).toBeInTheDocument()
    },
  )
})
