import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CalculationMethodology } from './CalculationMethodology'

describe('public calculation methodology', () => {
  it('provides the methodology anchor as a named, readable region', () => {
    render(<CalculationMethodology />)
    const region = screen.getByRole('region', {
      name: 'Calculation methodology',
    })
    expect(region).toHaveAttribute('id', 'methodology')
    expect(
      within(region).getByRole('heading', { name: 'Calculation methodology' }),
    ).toBeVisible()
  })

  it('discloses the current calculator admission and annual basis', () => {
    render(<CalculationMethodology />)
    expect(
      screen.getByText(/above EUR 2,000 and below EUR 5,800/),
    ).toBeVisible()
    expect(screen.getByText(/1963-01-01 through 2002-12-31/)).toBeVisible()
    expect(
      screen.getByText(/12 equal monthly amounts in EUR cents/),
    ).toBeVisible()
    expect(screen.getByText(/Bonuses and additional cash/)).toBeVisible()
    expect(screen.getByText(/2.9% published average/)).toBeVisible()
  })

  it('links readers to governing official tax and insurance sources', () => {
    render(<CalculationMethodology />)
    expect(
      screen.getByRole('link', { name: /BMF 2026 machine calculation plan/ }),
    ).toHaveAttribute(
      'href',
      'https://www.bundesfinanzministerium.de/Content/DE/Downloads/Steuern/Steuerarten/Lohnsteuer/Programmablaufplan/2025-11-12-PAP-2026-anlage-1.pdf?__blob=publicationFile&v=2',
    )
    expect(
      screen.getByRole('link', { name: /BVV contribution rounding/ }),
    ).toHaveAttribute(
      'href',
      'https://www.gesetze-im-internet.de/beitrvv/BJNR113800006.html',
    )
    expect(
      screen.getByRole('link', { name: /BMG health-insurance contributions/ }),
    ).toHaveAttribute(
      'href',
      'https://www.bundesgesundheitsministerium.de/beitraege',
    )
    expect(
      screen.getByRole('link', { name: /SGB XI section 58/ }),
    ).toHaveAttribute(
      'href',
      'https://www.gesetze-im-internet.de/sgb_11/__58.html',
    )
  })

  it('bounds verification and separates payroll from comparison estimates', () => {
    render(<CalculationMethodology />)
    expect(
      screen.getByText(/516 official BMF annual wage-tax table values/),
    ).toBeVisible()
    expect(
      screen.getByText(/does not certify the complete net-salary calculation/),
    ).toBeVisible()
    expect(screen.getByText(/partial draft.*production approval/)).toBeVisible()
    expect(
      screen.getByText(/Commuting costs, remote work, benefits/),
    ).toBeVisible()
    expect(screen.getByText(/integer EUR cents/)).toBeVisible()
    expect(screen.getByText(/not a new source audit/)).toBeVisible()
  })
})
