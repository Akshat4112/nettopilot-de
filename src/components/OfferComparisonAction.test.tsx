import { screen, within } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { OfferComparisonInputs } from './OfferComparisonInputs'
import { renderWithUser } from '../test/render'
import { openOfferCategories } from '../test/offer-categories'

async function enterSupportedPayroll(user: UserEvent): Promise<void> {
  for (const side of ['A', 'B'] as const) {
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
}

function offerResult(side: 'A' | 'B'): HTMLElement {
  return screen.getByRole('region', { name: `Offer ${side} net result` })
}

describe('NP-UX-008 one comparison calculation action', () => {
  it('has one calculation action that also reveals missing salary errors', async () => {
    const { user } = renderWithUser(<OfferComparisonInputs />)
    expect(
      screen.queryByRole('button', { name: 'Check both offers' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getAllByRole('button', { name: 'Calculate net compensation' }),
    ).toHaveLength(1)
    await user.click(
      screen.getByRole('button', { name: 'Calculate net compensation' }),
    )
    for (const side of ['A', 'B'] as const) {
      expect(
        screen.getByLabelText(`Offer ${side} gross salary (EUR)`),
      ).toHaveAttribute('aria-invalid', 'true')
      expect(offerResult(side)).toHaveTextContent(/unavailable/i)
    }
  })

  it('withholds payroll amounts until deliberate calculation', async () => {
    const { user } = renderWithUser(<OfferComparisonInputs />)
    await enterSupportedPayroll(user)
    expect(
      screen.queryByRole('region', { name: 'Offer net compensation results' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('region', { name: 'Offer comparison summary' }),
    ).not.toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Calculate net compensation' }),
    )
    expect(offerResult('A')).toHaveTextContent(
      'Estimated annual recurring net pay',
    )
    expect(offerResult('B')).toHaveTextContent(
      'Estimated annual recurring net pay',
    )
  })

  it('keeps optional errors separate from supported base-pay payroll', async () => {
    const { user } = renderWithUser(<OfferComparisonInputs />)
    await enterSupportedPayroll(user)
    await openOfferCategories(
      user,
      'Working time and vacation',
      'Pension and benefits',
    )
    await user.type(
      screen.getByLabelText('Offer A contractual weekly hours'),
      '40',
    )
    await user.type(
      screen.getByLabelText('Offer A employer pension annual (EUR)'),
      '-1',
    )
    await user.click(
      screen.getByRole('button', { name: 'Calculate net compensation' }),
    )
    expect(
      screen.getByLabelText('Offer A working time and vacation'),
    ).toHaveAttribute('aria-invalid', 'true')
    expect(
      screen.getByLabelText('Offer A pension and benefits inputs'),
    ).toHaveAttribute('aria-invalid', 'true')
    expect(offerResult('A')).toHaveTextContent(
      'Estimated annual recurring net pay',
    )
    expect(offerResult('B')).toHaveTextContent(
      'Estimated annual recurring net pay',
    )
    const summary = within(
      screen.getByRole('region', { name: 'Offer comparison summary' }),
    )
    expect(
      summary.getByRole('row', { name: /^Employer pension contribution/ }),
    ).toHaveTextContent('Unavailable')
    expect(
      summary.getByRole('row', { name: /^Annual contractual work hours/ }),
    ).toHaveTextContent('Unavailable')
  })

  it('identifies variable pay and the selected one-time payment and month separately', async () => {
    const { user } = renderWithUser(<OfferComparisonInputs />)
    await enterSupportedPayroll(user)
    await openOfferCategories(user, 'Cash compensation')
    await user.type(
      screen.getByLabelText('Offer A expected annual variable pay (EUR)'),
      '500',
    )
    await user.type(
      screen.getByLabelText('Offer A one-time payment (EUR)'),
      '1000',
    )
    await user.selectOptions(
      screen.getByLabelText('Offer A one-time payment month'),
      '12',
    )
    await user.selectOptions(
      screen.getByLabelText('Offer A one-time payment type'),
      'christmas_payment',
    )
    await user.click(
      screen.getByRole('button', { name: 'Calculate net compensation' }),
    )
    expect(offerResult('A')).toHaveTextContent(/Expected variable pay/i)
    expect(offerResult('A')).toHaveTextContent(/Christmas payment/i)
    expect(offerResult('A')).toHaveTextContent(/month 12/i)
    expect(offerResult('A')).toHaveTextContent(/unavailable/i)
    expect(offerResult('B')).toHaveTextContent(
      'Estimated annual recurring net pay',
    )
  })

  it('retains a missing raw payment month and recovers after the payment is cleared', async () => {
    const { user } = renderWithUser(<OfferComparisonInputs />)
    await enterSupportedPayroll(user)
    await openOfferCategories(user, 'Cash compensation')
    const payment = screen.getByLabelText('Offer A one-time payment (EUR)')
    await user.type(payment, '500')
    await user.click(
      screen.getByRole('button', { name: 'Calculate net compensation' }),
    )
    expect(offerResult('A')).toHaveTextContent(/One-time payment/i)
    expect(offerResult('A')).toHaveTextContent(
      'Choose the payment month for the one-time payment.',
    )
    expect(offerResult('B')).toHaveTextContent(
      'Estimated annual recurring net pay',
    )
    expect(screen.getByLabelText('Offer A one-time payment month')).toHaveValue(
      '',
    )
    await user.clear(payment)
    expect(payment).toHaveFocus()
    expect(offerResult('A')).toHaveTextContent(
      'Estimated annual recurring net pay',
    )
    expect(offerResult('B')).toHaveTextContent(
      'Estimated annual recurring net pay',
    )
  })

  it('names invalid raw variable pay even when model admission omits the entry', async () => {
    const { user } = renderWithUser(<OfferComparisonInputs />)
    await enterSupportedPayroll(user)
    await openOfferCategories(user, 'Cash compensation')
    await user.type(
      screen.getByLabelText('Offer A expected annual variable pay (EUR)'),
      '-1',
    )
    await user.click(
      screen.getByRole('button', { name: 'Calculate net compensation' }),
    )
    expect(offerResult('A')).toHaveTextContent(/Expected variable pay/i)
    expect(offerResult('A')).toHaveTextContent(
      /Expected variable compensation must be a positive EUR amount/i,
    )
    expect(offerResult('B')).toHaveTextContent(
      'Estimated annual recurring net pay',
    )
  })
})
