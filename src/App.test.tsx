import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { App } from './App'
import { APP_BASE_PATH } from './config/app'
import { renderWithUser } from './test/render'

describe('App', () => {
  it('renders the application foundation and its public links', () => {
    renderWithUser(<App />)

    expect(
      screen.getByRole('heading', {
        name: 'Understand the money behind a job offer.',
      }),
    ).toBeInTheDocument()

    const principles = screen.getByRole('list', {
      name: 'Product principles',
    })
    expect(within(principles).getAllByRole('listitem')).toHaveLength(3)

    expect(
      screen.getByRole('link', { name: 'NettoPilot DE home' }),
    ).toHaveAttribute('href', APP_BASE_PATH)
    expect(
      screen.getByRole('link', { name: 'View the open-source project' }),
    ).toHaveAttribute('href', 'https://github.com/Akshat4112/nettopilot-de')
  })

  it('labels the unavailable calculation state clearly', () => {
    renderWithUser(<App />)

    expect(
      screen.getByRole('complementary', { name: 'Application status' }),
    ).toHaveTextContent('The calculation engine is not available yet.')
  })
})
