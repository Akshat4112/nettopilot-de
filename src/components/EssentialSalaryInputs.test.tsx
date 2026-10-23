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
      'Complete all required',
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
      'Resolve unknown payroll choices',
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
    expect(message).toHaveTextContent('valid number of children')
  })
})
