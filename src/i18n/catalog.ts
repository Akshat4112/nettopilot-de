import terminology from '../../docs/i18n/terminology.json'
import { messages, type MessageKey } from './messages'

export type Locale = 'en' | 'de'
export const DEFAULT_LOCALE: Locale = 'en'
export const LOCALE_STORAGE_KEY = 'nettopilot:locale'

/** Reject unsupported values rather than deriving settings from salary URL data. */
export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'de'
}

export function getMessage(locale: Locale, key: MessageKey): string {
  return messages[locale][key]
}

const glossary = new Map(terminology.terms.map((term) => [term.id, term]))

/** NP-I18N-001 canonical glossary is a separate, versioned source. */
export function getTerm(locale: Locale, id: string): string {
  const term = glossary.get(id)
  if (term === undefined) {
    throw new RangeError('Missing glossary term: ' + id)
  }
  return term[locale]
}

/** Only language choice is persisted. No salary, offer, or payroll data. */
export function readLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  try {
    const stored: unknown = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    return isLocale(stored) ? stored : DEFAULT_LOCALE
  } catch {
    return DEFAULT_LOCALE
  }
}

export function persistLocale(locale: Locale): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    // Storage may be disabled; session switching still works.
  }
}
