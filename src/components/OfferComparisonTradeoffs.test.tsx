import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { OfferComparisonInputs } from './OfferComparisonInputs'
import { renderWithUser } from '../test/render'
import { OfferComparisonTradeoffs } from './OfferComparisonTradeoffs'
import { comparisonInputs } from '../test/offer-comparison-inputs'

describe('NP-CMP-013 current trade-off explanations', () => {
  it('appears only after calculation and removes current blocked comparisons without hiding the other offer', async () => {
    const { user } = renderWithUser(<OfferComparisonInputs />)
    expect(
      screen.queryByRole('region', {
        name: 'Entered factors behind the comparison',
      }),
    ).not.toBeInTheDocument()
    for (const side of ['A', 'B'])
      await user.type(
        screen.getByLabelText(`Offer ${side} gross salary (EUR)`),
        '48000',
      )
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
    await user.click(
      screen.getByRole('button', { name: 'Calculate net compensation' }),
    )
    const explanations = within(
      screen.getByRole('region', {
        name: 'Entered factors behind the comparison',
      }),
    )
    const payrollHeading = explanations.getByText(
      'Base pay and payroll deductions',
      { selector: 'summary h5' },
    )
    const payrollSummary = payrollHeading.closest('summary')
    expect(payrollSummary).toBeVisible()
    expect(payrollSummary).toHaveTextContent(/equal on this measure/)
    await user.click(payrollHeading)
    await user.clear(screen.getByLabelText('Offer A gross salary (EUR)'))
    expect(
      explanations.queryByText(/equal on this measure/),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('region', {
        name: 'Entered factors behind the comparison',
      }),
    ).toHaveTextContent('Offer B: €48,000.00')
    expect(
      screen.getByRole('region', {
        name: 'Entered factors behind the comparison',
      }),
    ).toHaveTextContent('Offer A: Unavailable')
    await user.click(
      screen.getByRole('button', { name: 'Reset payroll assumptions' }),
    )
    expect(
      screen.queryByRole('region', {
        name: 'Entered factors behind the comparison',
      }),
    ).not.toBeInTheDocument()
  })
})

it('shows a factual primary comparison for every group before details are opened', async () => {
  const { user } = renderWithUser(
    <OfferComparisonTradeoffs {...comparisonInputs()} />,
  )
  for (const pattern of [
    /^Annual base-pay net: B − A: \+€6,295.08/,
    /^Annual net after entered commute costs: B − A: \+€6,320.08/,
    /^Effective net after commute cost per hour: B − A: \+€3.28 \/ hour/,
    /^Annual contractual work hours: B − A: −40 hours/,
    /^Annual employer occupational pension contribution: B − A: \+€100.00/,
  ])
    expect(screen.getByText(pattern)).toBeVisible()
  const formula = screen.getByText(
    /Offer A: €48,000.00 − €16,734.00 = €31,266.00/,
  )
  expect(formula).not.toBeVisible()
  await user.click(
    screen.getByText('Base pay and payroll deductions', {
      selector: 'summary h5',
    }),
  )
  expect(formula).toBeVisible()
})
