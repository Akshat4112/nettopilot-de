import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('README project-status accuracy', () => {
  const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8')
  const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8')

  it('describes the implemented preview without claiming foundation-only status', () => {
    expect(readme).toContain('Public preview, not a completed v1 release')
    expect(readme).not.toContain('calculator flows will be added')
    expect(app).toContain('<EssentialSalaryInputs />')
    expect(app).toContain('<OfferComparisonInputs />')
    expect(app).toContain('<CalculationMethodology />')
  })

  it('discloses language incompleteness and links to scope and privacy', () => {
    expect(readme).toContain('some German content is')
    expect(readme).toContain('docs/product/NP-PD-003-v1-employment-scope.md')
    expect(readme).toContain('docs/product/NP-PD-007-privacy-model.md')
    expect(app).toContain("t('language.partialNotice')")
  })
})
