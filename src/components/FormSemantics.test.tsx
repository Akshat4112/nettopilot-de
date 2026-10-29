import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from '../App'
import { renderWithUser } from '../test/render'
import { EssentialSalaryInputs } from './EssentialSalaryInputs'
import { OfferComparisonInputs } from './OfferComparisonInputs'

function expectResolvedFormReferences(container: HTMLElement): void {
  const ids = Array.from(container.querySelectorAll('[id]'), (node) => node.id)
  expect(new Set(ids).size).toBe(ids.length)
  for (const control of container.querySelectorAll(
    'input, select, textarea, [role="group"]',
  )) {
    expect(control).toHaveAccessibleName()
    for (const attribute of ['aria-describedby', 'aria-labelledby']) {
      for (const id of (control.getAttribute(attribute) ?? '')
        .split(/\s+/)
        .filter(Boolean)) {
        expect(container.querySelectorAll(`[id="${id}"]`)).toHaveLength(1)
      }
    }
    if (control.getAttribute('aria-invalid') === 'true') {
      const descriptions = (control.getAttribute('aria-describedby') ?? '')
        .split(/\s+/)
        .filter(Boolean)
      expect(
        descriptions.some(
          (id) =>
            container.querySelector(`[id="${id}"]`)?.getAttribute('role') ===
            'alert',
        ),
      ).toBe(true)
    }
  }
}

describe('NP-A11Y-001 form semantics', () => {
  it('connects existing salary help and the date-of-birth purpose', async () => {
    const { user, container } = renderWithUser(<EssentialSalaryInputs />)
    expect(screen.getByLabelText('Date of birth')).toHaveAttribute(
      'autocomplete',
      'bday',
    )
    expect(
      screen.getByLabelText(/I confirm full-year ordinary employment/),
    ).toHaveAccessibleDescription(/does not cover bonuses/)
    await user.click(screen.getByText('Advanced settings (optional)'))
    expect(
      screen.getByLabelText('Annual tax allowance (EUR)'),
    ).toHaveAccessibleDescription(/officially confirmed annual allowance/)
    await user.selectOptions(
      screen.getByLabelText('Health insurance'),
      'statutory',
    )
    expect(
      screen.getByLabelText('Insurer-specific additional rate (%)'),
    ).toHaveAccessibleDescription(/published average rate/)
    expect(
      screen.getByLabelText('One-off bonus (EUR)'),
    ).toHaveAccessibleDescription(/not treated as recurring monthly salary/)
    expectResolvedFormReferences(container)
  })

  it('associates advanced errors with the affected fields and clears them on correction', async () => {
    const { user, container } = renderWithUser(<EssentialSalaryInputs />)
    await user.click(screen.getByText('Advanced settings (optional)'))
    const allowance = screen.getByLabelText('Annual tax allowance (EUR)')
    await user.type(allowance, '-1')
    expect(allowance).toHaveAttribute('aria-invalid', 'true')
    expect(allowance).toHaveAccessibleDescription(
      /Annual allowance must be a non-negative EUR amount/,
    )
    expect(
      screen.getByLabelText('Annual taxable addition (EUR)'),
    ).not.toHaveAttribute('aria-invalid', 'true')
    expectResolvedFormReferences(container)
    await user.clear(allowance)
    expect(allowance).not.toHaveAttribute('aria-invalid', 'true')
    expect(allowance).toHaveAccessibleDescription(
      /officially confirmed annual allowance/,
    )
    const bonus = screen.getByLabelText('One-off bonus (EUR)')
    await user.type(bonus, '500')
    expect(
      screen.getByLabelText('Bonus payment month'),
    ).toHaveAccessibleDescription(/Choose a payment month/)
    await user.selectOptions(screen.getByLabelText('Bonus payment month'), '12')
    expect(bonus).not.toHaveAttribute('aria-invalid', 'true')
    expectResolvedFormReferences(container)
  })

  it('connects optional offer guidance and existing validation reasons', async () => {
    const { user, container } = renderWithUser(<OfferComparisonInputs />)
    expect(
      screen.getByLabelText('Offer A expected annual variable pay (EUR)'),
    ).toHaveAccessibleDescription(/Expected variable compensation is annual/)
    expect(
      screen.getByLabelText('Offer A contractual weekly hours'),
    ).toHaveAccessibleDescription(/standardized 52-week estimate/)
    expect(
      screen.getByLabelText('Offer A fuel per office day (EUR)'),
    ).toHaveAccessibleDescription(/leave unknown amounts blank/)
    expect(
      screen.getByLabelText('Offer A employer pension annual (EUR)'),
    ).toHaveAccessibleDescription(
      /Pension and benefits remain separate from salary/,
    )
    await user.type(
      screen.getByLabelText('Offer A expected annual variable pay (EUR)'),
      '-1',
    )
    await user.type(
      screen.getByLabelText('Offer A contractual weekly hours'),
      '40',
    )
    await user.type(
      screen.getByLabelText('Offer A fuel per office day (EUR)'),
      '-1',
    )
    await user.click(screen.getByRole('button', { name: 'Check both offers' }))
    for (const name of [
      'Offer A additional compensation',
      'Offer A working time and vacation',
      'Offer A commute costs',
    ]) {
      expect(screen.getByRole('group', { name })).toHaveAttribute(
        'aria-invalid',
        'true',
      )
    }
    expect(
      screen.getByLabelText('Offer A one-time payment certainty'),
    ).not.toHaveAttribute('aria-invalid', 'true')
    expect(
      screen.getByLabelText('Offer A working days per week'),
    ).not.toHaveAttribute('aria-invalid', 'true')
    expect(
      screen.getByLabelText('Offer A office days per week'),
    ).not.toHaveAttribute('aria-invalid', 'true')
    expectResolvedFormReferences(container)
  })

  it('connects remote and payroll assumptions without inferring payroll field errors', async () => {
    const { user, container } = renderWithUser(<OfferComparisonInputs />)
    expect(screen.getByLabelText('Comparison date of birth')).toHaveAttribute(
      'autocomplete',
      'bday',
    )
    expect(
      screen.getByLabelText('Comparison tax class'),
    ).toHaveAccessibleDescription(/Supported scope: 2026/)
    expect(
      screen.getByLabelText('Comparison additional health rate (%)'),
    ).toHaveAccessibleDescription(
      /Leave blank to use the published 2026 average/,
    )
    expect(
      screen.getByLabelText(/Confirm shared standard payroll assumptions/),
    ).toHaveAccessibleDescription(/Supported scope: 2026/)
    const allowance = screen.getByLabelText(
      'Offer A employer home-office allowance monthly (EUR)',
    )
    expect(allowance).toHaveAccessibleDescription(
      /no tax or net-pay adjustment/,
    )
    await user.type(allowance, '-1')
    await user.type(
      screen.getByLabelText('Offer A one-way commute (minutes)'),
      '-1',
    )
    await user.click(
      screen.getByRole('button', { name: 'Add benefit to Offer A' }),
    )
    await user.click(screen.getByRole('button', { name: 'Check both offers' }))
    expect(
      screen.getByRole('group', {
        name: 'Offer A remote and home-office terms',
      }),
    ).toHaveAttribute('aria-invalid', 'true')
    expect(
      screen.getByLabelText('Offer A work arrangement'),
    ).not.toHaveAttribute('aria-invalid', 'true')
    expect(
      screen.getByLabelText('Offer A one-way commute (minutes)'),
    ).toHaveAttribute('aria-invalid', 'true')
    expect(
      screen.getByRole('group', {
        name: 'Offer A pension and benefits inputs',
      }),
    ).toHaveAttribute('aria-invalid', 'true')
    expectResolvedFormReferences(container)
    await user.clear(allowance)
    expect(allowance).not.toHaveAttribute('aria-invalid', 'true')
    expectResolvedFormReferences(container)
    await user.click(
      screen.getByRole('button', { name: 'Calculate net compensation' }),
    )
    expect(screen.getByLabelText('Comparison tax class')).not.toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expectResolvedFormReferences(container)
  })

  it('describes benefit amount errors without declaring valid notes and certainty invalid', async () => {
    const { user, container } = renderWithUser(<OfferComparisonInputs />)
    await user.type(
      screen.getByLabelText('Offer A employer pension annual (EUR)'),
      '-1',
    )
    await user.selectOptions(
      screen.getByLabelText('Offer A pension certainty'),
      'guaranteed',
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
        'Offer A benefit 1 description or eligibility note',
      ),
      'Annual budget',
    )
    await user.click(screen.getByRole('button', { name: 'Check both offers' }))
    const group = screen.getByRole('group', {
      name: 'Offer A pension and benefits inputs',
    })
    expect(group).toHaveAttribute('aria-invalid', 'true')
    expect(group).toHaveAccessibleDescription(
      /Employer pension contribution must be non-negative/,
    )
    for (const name of [
      'Offer A pension certainty',
      'Offer A pension eligibility or vesting note',
      'Offer A benefit 1 certainty',
      'Offer A benefit 1 description or eligibility note',
      'Offer A benefit 1 label',
    ]) {
      expect(screen.getByLabelText(name)).not.toHaveAttribute(
        'aria-invalid',
        'true',
      )
      expect(screen.getByLabelText(name)).toHaveAccessibleDescription(
        /Employer pension contribution must be non-negative/,
      )
    }
    expectResolvedFormReferences(container)
  })

  it('keeps labels and ID references unique across the whole app and copied benefits', async () => {
    const { user, container } = renderWithUser(<App />)
    await user.click(
      screen.getByRole('button', { name: 'Add benefit to Offer A' }),
    )
    await user.type(
      screen.getByLabelText('Offer A benefit 1 label'),
      'Training',
    )
    await user.click(
      screen.getByRole('button', { name: 'Copy Offer A to Offer B' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Add benefit to Offer B' }),
    )
    await user.click(screen.getByRole('button', { name: 'Check inputs' }))
    await user.click(screen.getByRole('button', { name: 'Check both offers' }))
    expectResolvedFormReferences(container)
  })
})
