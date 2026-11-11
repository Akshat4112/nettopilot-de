import { beforeEach, describe, expect, it } from 'vitest'
import terminology from '../../docs/i18n/terminology.json'
import {
  DEFAULT_LOCALE,
  getMessage,
  getTerm,
  isLocale,
  LOCALE_STORAGE_KEY,
  persistLocale,
  readLocale,
} from './catalog'
import { englishMessages, germanMessages } from './messages'

beforeEach(() => {
  window.localStorage.removeItem(LOCALE_STORAGE_KEY)
})

describe('NP-I18N-002 localization catalog contract', () => {
  it('defaults to English and accepts only the two supported language IDs', () => {
    expect(DEFAULT_LOCALE).toBe('en')
    expect(isLocale('en')).toBe(true)
    expect(isLocale('de')).toBe(true)
    for (const unsupported of ['DE', 'de-DE', '', null, 0, {}, 'fr']) {
      expect(isLocale(unsupported)).toBe(false)
    }
    expect(readLocale()).toBe('en')
  })

  it('keeps migrated English and German interface catalogs complete', () => {
    expect(Object.keys(englishMessages).sort()).toEqual(
      Object.keys(germanMessages).sort(),
    )
    for (const key of Object.keys(englishMessages)) {
      const actualKey = key as keyof typeof englishMessages
      expect(getMessage('en', actualKey).trim()).not.toBe('')
      expect(getMessage('de', actualKey).trim()).not.toBe('')
    }
    expect(getMessage('en', 'hero.title')).toBe(
      'Understand the money behind a job offer.',
    )
    expect(getMessage('de', 'hero.title')).toContain('Stellenangebot')
  })

  it('uses the single versioned terminology source for both languages', () => {
    expect(terminology.schemaVersion).toBe('1.0.0')
    for (const entry of terminology.terms) {
      expect(getTerm('en', entry.id)).toBe(entry.en)
      expect(getTerm('de', entry.id)).toBe(entry.de)
    }
    expect(getTerm('de', 'tax.wage_tax')).toBe('Lohnsteuer')
    expect(getTerm('de', 'tax.income_tax')).toBe('Einkommensteuer')
    expect(() => getTerm('en', 'unregistered.translation')).toThrow(
      'Missing glossary term',
    )
  })

  it('persists only a supported language preference and rejects invalid values', () => {
    persistLocale('de')
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('de')
    expect(readLocale()).toBe('de')
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'unsupported')
    expect(readLocale()).toBe('en')
    persistLocale('en')
    expect(readLocale()).toBe('en')
  })
})
