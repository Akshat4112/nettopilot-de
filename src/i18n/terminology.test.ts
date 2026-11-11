import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import glossary from '../../docs/i18n/terminology.json'

const entries = glossary.terms
const byId = new Map(entries.map((entry) => [entry.id, entry]))
const domains = new Set([
  'interface',
  'payroll',
  'tax',
  'insurance',
  'comparison',
  'states',
  'privacy',
])

const localized = (id: string, language: 'en' | 'de'): string => {
  const entry = byId.get(id)
  if (!entry) throw new Error('Missing terminology key: ' + id)
  return entry[language]
}

describe('NP-I18N-001 bilingual terminology contract', () => {
  it('defines a stable version, both locales, and unique complete semantic keys', () => {
    expect(glossary.schemaVersion).toBe('1.0.0')
    expect(glossary.defaultLocale).toBe('en')
    expect(glossary.supportedLocales).toEqual(['en', 'de'])
    expect(entries.length).toBeGreaterThanOrEqual(100)
    expect(byId.size).toBe(entries.length)
    for (const entry of entries) {
      expect(entry.id).toMatch(/^[a-z]+\.[a-z_]+$/)
      expect(domains.has(entry.category)).toBe(true)
      for (const value of [entry.en, entry.de, entry.meaning]) {
        expect(value.length).toBeGreaterThan(0)
        expect(value.trim()).toBe(value)
      }
    }
  })

  it('distinguishes wage tax from annual income tax and different pension types', () => {
    expect(localized('tax.wage_tax', 'de')).toBe('Lohnsteuer')
    expect(localized('tax.income_tax', 'de')).toBe('Einkommensteuer')
    expect(localized('insurance.pension', 'de')).toContain(
      'Gesetzliche Rentenversicherung',
    )
    expect(localized('insurance.employer_occupational_pension', 'de')).toContain(
      'betrieblichen Altersversorgung',
    )
    expect(localized('insurance.pension_employer', 'de')).not.toBe(
      localized('insurance.employer_occupational_pension', 'de'),
    )
    expect(localized('insurance.statutory_health', 'de')).toContain('GKV')
    expect(localized('insurance.private_health', 'de')).toContain('PKV')
  })

  it('keeps unknown, invalid, unsupported, unavailable and zero distinct', () => {
    const states = [
      'states.not_supplied',
      'states.unknown',
      'states.invalid',
      'states.incomplete',
      'states.unavailable',
      'states.unsupported',
      'states.explicit_zero',
    ]
    expect(new Set(states.map((id) => localized(id, 'de'))).size).toBe(
      states.length,
    )
    expect(localized('states.not_supplied', 'de')).toBe('Nicht angegeben')
    expect(localized('states.explicit_zero', 'de')).not.toBe(
      localized('states.not_supplied', 'de'),
    )
  })

  it('makes comparison direction and privacy boundaries explicit', () => {
    expect(localized('comparison.b_minus_a', 'en')).toContain('B − A')
    expect(localized('comparison.b_minus_a', 'de')).toContain('B − A')
    expect(localized('privacy.sensitive_export', 'de')).toContain(
      'vertrauliche Vergütungsbeträge',
    )
    expect(localized('comparison.effective_hourly', 'de')).toContain(
      'nach Pendelkosten',
    )
  })

  it('keeps the published Markdown glossary in sync with every machine term', () => {
    const documentation = readFileSync(
      new URL('../../docs/i18n/NP-I18N-001-terminology.md', import.meta.url),
      'utf8',
    )
    expect(documentation).toContain('**Version:** ' + glossary.schemaVersion)
    expect(documentation).toContain(
      'maps **' + String(entries.length) + ' semantic IDs**',
    )
    for (const entry of entries) {
      expect(documentation).toContain(
        '| `' +
          entry.id +
          '` | ' +
          entry.en.replaceAll('|', '\\|') +
          ' | ' +
          entry.de.replaceAll('|', '\\|') +
          ' | ' +
          entry.meaning.replaceAll('|', '\\|') +
          ' |',
      )
    }
  })
})
