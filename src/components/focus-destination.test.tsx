import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithUser } from '../test/render'
import { focusDestination } from './focus-destination'

describe('focusDestination', () => {
  it('opens closed ancestor disclosures and focuses the first enabled group control', () => {
    renderWithUser(
      <details data-testid="outer">
        <summary>Outer settings</summary>
        <details data-testid="inner">
          <summary>Inner settings</summary>
          <div role="group" aria-label="Invalid settings" aria-invalid="true">
            <input aria-label="Unavailable setting" disabled />
            <input aria-label="Setting to correct" />
          </div>
        </details>
      </details>,
    )
    focusDestination(screen.getByLabelText('Invalid settings'))
    expect(screen.getByTestId('outer')).toHaveAttribute('open')
    expect(screen.getByTestId('inner')).toHaveAttribute('open')
    expect(screen.getByLabelText('Setting to correct')).toHaveFocus()
  })

  it('focuses a programmatic result destination directly', () => {
    renderWithUser(
      <section aria-label="Current result" tabIndex={-1}>
        <button>Result details</button>
      </section>,
    )
    const result = screen.getByRole('region', { name: 'Current result' })
    focusDestination(result)
    expect(result).toHaveFocus()
  })

  it('leaves focus in place when the requested destination cannot be focused', () => {
    renderWithUser(
      <>
        <button>Current control</button>
        <div role="group" aria-label="Empty group" />
      </>,
    )
    const control = screen.getByRole('button', { name: 'Current control' })
    control.focus()
    focusDestination(null)
    focusDestination(screen.getByRole('group'))
    expect(control).toHaveFocus()
  })
})
