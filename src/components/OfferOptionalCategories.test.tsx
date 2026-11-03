import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithUser } from '../test/render'
import { OfferComparisonInputs } from './OfferComparisonInputs'

const categories = [
  'Cash compensation',
  'Working time and vacation',
  'Commute costs and time',
  'Remote and home-office terms',
  'Pension and benefits',
]

describe('NP-UX-007 matched optional categories', () => {
  it('shows both base salaries before five collapsed paired categories', () => {
    const { container } = renderWithUser(<OfferComparisonInputs />)
    const disclosures = Array.from(
      container.querySelectorAll('details.offer-category'),
    )
    expect(disclosures).toHaveLength(5)
    expect(
      disclosures.map(
        (detail) => detail.querySelector('summary h3')?.textContent,
      ),
    ).toEqual(categories)
    for (const detail of disclosures) {
      expect(detail).not.toHaveAttribute('open')
      expect(detail.querySelector('summary')).toHaveTextContent(
        'Offer A: Not supplied',
      )
      expect(detail.querySelector('summary')).toHaveTextContent(
        'Offer B: Not supplied',
      )
    }
    const firstCategory = disclosures[0]
    if (!firstCategory) throw new Error('Optional category missing')
    const salaryB = screen.getByRole('textbox', {
      name: 'Offer B gross salary (EUR)',
    })
    expect(salaryB.compareDocumentPosition(firstCategory)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(
      screen.queryByRole('textbox', {
        name: 'Offer A expected annual variable pay (EUR)',
      }),
    ).not.toBeVisible()
  })

  it('preserves closed values and per-side status through copy and clear', async () => {
    const { user, container } = renderWithUser(<OfferComparisonInputs />)
    const cash = container.querySelector('details.offer-category')
    if (!cash) throw new Error('Cash category missing')
    await user.click(within(cash as HTMLElement).getByText('Cash compensation'))
    await user.type(
      screen.getByRole('textbox', { name: 'Offer A one-time payment (EUR)' }),
      '500',
    )
    expect(cash.querySelector('summary')).toHaveTextContent(
      'Offer A: Incomplete',
    )
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Offer A one-time payment month' }),
      '12',
    )
    expect(cash.querySelector('summary')).toHaveTextContent('Offer A: Supplied')
    await user.click(within(cash as HTMLElement).getByText('Cash compensation'))
    await user.click(
      screen.getByRole('button', { name: 'Copy Offer A to Offer B' }),
    )
    expect(cash.querySelector('summary')).toHaveTextContent('Offer B: Supplied')
    await user.click(within(cash as HTMLElement).getByText('Cash compensation'))
    expect(
      screen.getByRole('textbox', { name: 'Offer A one-time payment (EUR)' }),
    ).toHaveValue('500')
    expect(
      screen.getByRole('textbox', { name: 'Offer B one-time payment (EUR)' }),
    ).toHaveValue('500')
    await user.click(screen.getByRole('button', { name: 'Clear Offer B' }))
    expect(cash.querySelector('summary')).toHaveTextContent(
      'Offer B: Not supplied',
    )
    expect(
      screen.getByRole('textbox', { name: 'Offer A one-time payment (EUR)' }),
    ).toHaveValue('500')
  })

  it('does not label remote or commute supplied from shared schedule values', async () => {
    const { user, container } = renderWithUser(<OfferComparisonInputs />)
    const details = container.querySelectorAll('details.offer-category')
    await user.click(
      within(details[1] as HTMLElement).getByText('Working time and vacation', {
        selector: 'summary h3',
      }),
    )
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Offer A working days per week' }),
      '5',
    )
    expect(details[1]?.querySelector('summary')).toHaveTextContent(
      'Offer A: Incomplete',
    )
    expect(details[2]?.querySelector('summary')).toHaveTextContent(
      'Offer A: Not supplied',
    )
    expect(details[3]?.querySelector('summary')).toHaveTextContent(
      'Offer A: Not supplied',
    )
    await user.click(
      within(details[2] as HTMLElement).getByText('Commute costs and time'),
    )
    expect(
      within(details[2] as HTMLElement).getByText(
        /working days and paid vacation.*Working time and vacation/,
      ),
    ).toBeVisible()
    await user.type(
      screen.getByRole('textbox', {
        name: 'Offer A one-way commute (minutes)',
      }),
      '0',
    )
    expect(details[2]?.querySelector('summary')).toHaveTextContent(
      'Offer A: Incomplete',
    )
    expect(details[3]?.querySelector('summary')).toHaveTextContent(
      'Offer A: Not supplied',
    )
  })
})
