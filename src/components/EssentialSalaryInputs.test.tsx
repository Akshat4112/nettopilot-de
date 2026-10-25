import { fireEvent, screen } from '@testing-library/react'
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
    expect(screen.getByRole('status')).toHaveTextContent(
      'Choose a valid tax class.',
    )
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
  it('validates a complete supported essential-input draft', async () => {
    const { user } = renderWithUser(<EssentialSalaryInputs />)
    fireEvent.change(screen.getByLabelText('Gross salary (EUR)'), {
      target: { value: '5000' },
    })
    fireEvent.change(screen.getByLabelText('Tax class'), {
      target: { value: '1' },
    })
    fireEvent.change(screen.getByLabelText('Federal state'), {
      target: { value: 'DE-BW' },
    })
    fireEvent.change(screen.getByLabelText('Church-tax liability'), {
      target: { value: 'not_liable' },
    })
    fireEvent.change(screen.getByLabelText('Date of birth'), {
      target: { value: '1990-05-01' },
    })
    fireEvent.change(screen.getByLabelText('Number of children'), {
      target: { value: '0' },
    })
    fireEvent.change(screen.getByLabelText('Health insurance'), {
      target: { value: 'statutory' },
    })
    await user.click(screen.getByRole('button', { name: 'Check inputs' }))
    expect(screen.getByRole('status')).toHaveTextContent(
      'Essential inputs complete',
    )
    fireEvent.change(screen.getByLabelText('Health insurance'), {
      target: { value: 'unknown' },
    })
    await user.click(screen.getByRole('button', { name: 'Check inputs' }))
    expect(screen.getByRole('status')).toHaveTextContent(
      'Confirm your health-insurance type',
    )
  })

  it('rejects invalid gross, impossible children and future birthdates', async () => {
    const { user } = renderWithUser(<EssentialSalaryInputs />)
    fireEvent.change(screen.getByLabelText('Gross salary (EUR)'), {
      target: { value: '10000000' },
    })
    fireEvent.change(screen.getByLabelText('Date of birth'), {
      target: { value: '2099-01-01' },
    })
    fireEvent.change(screen.getByLabelText('Number of children'), {
      target: { value: '21' },
    })
    await user.click(screen.getByRole('button', { name: 'Check inputs' }))
    const message = screen.getByRole('status')
    expect(message).toHaveTextContent('supported range')
    expect(message).toHaveTextContent('valid date of birth')
    expect(message).toHaveTextContent('number of children from 0 to 20')
  })
  it('loads fictional example values without submitting or confirming payroll', async () => {
    const { user } = renderWithUser(<EssentialSalaryInputs />)
    await user.click(
      screen.getByRole('button', {
        name: /Load example: €3,500 monthly/,
      }),
    )
    expect(screen.getByLabelText('Gross salary (EUR)')).toHaveValue('3500')
    expect(screen.getByLabelText('Tax class')).toHaveValue('1')
    expect(screen.getByLabelText('Federal state')).toHaveValue('DE-BW')
    expect(screen.getByLabelText('Health insurance')).toHaveValue('statutory')
    expect(screen.getByRole('checkbox')).not.toBeChecked()
    expect(
      screen.queryByRole('heading', { name: 'Salary summary' }),
    ).not.toBeInTheDocument()
  })

  it('switches between examples and resets previously entered advanced values', async () => {
    const { user } = renderWithUser(<EssentialSalaryInputs />)
    fireEvent.change(screen.getByLabelText('One-off bonus (EUR)'), {
      target: { value: '500' },
    })
    fireEvent.change(screen.getByLabelText('Bonus payment month'), {
      target: { value: '10' },
    })
    await user.click(
      screen.getByRole('button', {
        name: /Load example: €48,000 annually/,
      }),
    )
    expect(screen.getByLabelText('Gross salary (EUR)')).toHaveValue('48000')
    expect(screen.getByLabelText('Salary frequency')).toHaveValue('annual')
    expect(screen.getByLabelText('Tax class')).toHaveValue('4')
    expect(screen.getByLabelText('Federal state')).toHaveValue('DE-BE')
    expect(screen.getByLabelText('One-off bonus (EUR)')).toHaveValue('')
    expect(screen.getByRole('checkbox')).not.toBeChecked()
    expect(screen.getByText(/not personalized advice/i)).toBeInTheDocument()
  })
})
