import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithUser } from '../test/render'
import { OfferComparisonInputs } from './OfferComparisonInputs'

// Query labeled fields directly: repeated role scans of the full comparison form
// spend time recalculating visibility instead of exercising the benefits flow.
describe('NP-CMP-009 pension and benefits', () => {
  it('preserves independent valuations, certainty and unknown values through copy and clear', async () => {
    const { user } = renderWithUser(<OfferComparisonInputs />)
    await user.type(
      screen.getByLabelText('Offer A employer pension annual (EUR)'),
      '1200.05',
    )
    await user.selectOptions(
      screen.getByLabelText('Offer A pension certainty'),
      'conditional',
    )
    await user.type(
      screen.getByLabelText('Offer A pension eligibility or vesting note'),
      'After probation',
    )
    await user.click(
      screen.getByRole('button', { name: 'Add benefit to Offer A' }),
    )
    await user.type(
      screen.getByLabelText('Offer A benefit 1 label'),
      'Training',
    )
    await user.type(
      screen.getByLabelText(
        'Offer A benefit 1 employer-stated annual value (EUR)',
      ),
      '500',
    )
    await user.type(
      screen.getByLabelText(
        'Offer A benefit 1 user-assigned annual value (EUR)',
      ),
      '0',
    )
    const summary = within(
      screen.getByRole('region', {
        name: 'Offer A pension and benefits summary',
      }),
    )
    expect(summary.getByText(/1,200.05/)).toBeInTheDocument()
    expect(summary.getByText(/Employer-stated:.*500.00/)).toBeInTheDocument()
    expect(summary.getByText(/User-assigned:.*0.00/)).toBeInTheDocument()
    expect(
      summary.getByText(/Tax treatment is not calculated/),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Copy Offer A to Offer B' }),
    )
    expect(screen.getByLabelText('Offer B benefit 1 label')).toHaveValue(
      'Training',
    )
    expect(
      screen.getByLabelText('Offer B pension eligibility or vesting note'),
    ).toHaveValue('After probation')
    expect(screen.getByLabelText('Offer B pension certainty')).toHaveValue(
      'conditional',
    )
    await user.clear(screen.getByLabelText('Offer B benefit 1 label'))
    await user.type(
      screen.getByLabelText('Offer B benefit 1 label'),
      'Mobility',
    )
    expect(screen.getByLabelText('Offer A benefit 1 label')).toHaveValue(
      'Training',
    )
    await user.click(screen.getByRole('button', { name: 'Clear Offer B' }))
    expect(
      screen.queryByLabelText('Offer B benefit 1 label'),
    ).not.toBeInTheDocument()
    expect(
      screen.getByLabelText('Offer B employer pension annual (EUR)'),
    ).toHaveValue('')
    expect(
      within(
        screen.getByRole('region', {
          name: 'Offer B pension and benefits summary',
        }),
      ).getByText(/Employer pension: Not specified/),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Remove Offer A benefit 1' }),
    )
    expect(
      screen.queryByLabelText('Offer A benefit 1 label'),
    ).not.toBeInTheDocument()
  })

  it('blocks invalid amounts and unlabeled benefits without inventing net values', async () => {
    const { user } = renderWithUser(<OfferComparisonInputs />)
    for (const side of ['A', 'B'])
      await user.type(
        screen.getByLabelText(`Offer ${side} gross salary (EUR)`),
        '60000',
      )
    await user.click(
      screen.getByRole('button', { name: 'Add benefit to Offer A' }),
    )
    await user.type(
      screen.getByLabelText(
        'Offer A benefit 1 user-assigned annual value (EUR)',
      ),
      '-5',
    )
    await user.click(screen.getByRole('button', { name: 'Check both offers' }))
    expect(screen.getByRole('status')).toHaveTextContent('Complete or correct')
    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    await user.type(
      screen.getByLabelText('Offer A benefit 1 label'),
      'Learning',
    )
    await user.clear(
      screen.getByLabelText(
        'Offer A benefit 1 user-assigned annual value (EUR)',
      ),
    )
    await user.click(screen.getByRole('button', { name: 'Check both offers' }))
    expect(screen.getByRole('status')).toHaveTextContent(
      'No net-pay difference',
    )
    const summary = within(
      screen.getByRole('region', {
        name: 'Offer A pension and benefits summary',
      }),
    )
    expect(
      summary.getByText(/Employer-stated: Not specified/),
    ).toBeInTheDocument()
    expect(
      summary.getByText(/User-assigned: Not specified/),
    ).toBeInTheDocument()
  })
})
