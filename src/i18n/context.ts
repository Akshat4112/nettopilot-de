import { createContext, useContext } from 'react'
import type { Locale } from './catalog'
import type { MessageKey } from './messages'

export interface LanguageContextValue {
  readonly locale: Locale
  readonly setLocale: (locale: Locale) => void
  readonly t: (key: MessageKey) => string
  readonly term: (id: string) => string
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext)
  if (context === null) {
    throw new Error('useLanguage must be inside LanguageProvider')
  }
  return context
}
