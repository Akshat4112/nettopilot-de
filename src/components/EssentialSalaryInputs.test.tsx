import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EssentialSalaryInputs } from './EssentialSalaryInputs'
import { renderWithUser } from '../test/render'

describe('EssentialSalaryInputs', () => {
  it('renders material payroll fields without a hidden tax-class default', () => {
    renderWithUser(<EssentialSalaryInputs />)
    expect(screen.getByLabelText('Gross salary (EUR)')).toHaveValue('')
    expect(screen.getByLabelText('Tax class')).toHaveValue('')
    expect(screen.getByLabelText('Federal state')).toHaveValue('')
    expect(screen.getByLabelText('Health insurance')).toHaveValue('')
  })

  it('shows missing-input guidance instead of fabricated net pay', async () => {
    const { user } = renderWithUser(<EssentialSalaryInputs />)
    await user.click(screen.getByRole('button', { name: 'Check inputs' }))
    expect(screen.getByRole('status')).toHaveTextContent('Complete all required')
    expect(screen.queryByText(/estimated net/i)).not.toBeInTheDocument()
  })

  it('clears the browser-only salary draft', async () => {
    const { user } = renderWithUser(<EssentialSalaryInputs />)
    await user.type(screen.getByLabelText('Gross salary (EUR)'), '5000')
    await user.selectOptions(screen.getByLabelText('Tax class'), '1')
    await user.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getByLabelText('Gross salary (EUR)')).toHaveValue('')
    expect(screen.getByLabelText('Tax class')).toHaveValue('')
  })
})
