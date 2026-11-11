import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  getMessage,
  getTerm,
  persistLocale,
  readLocale,
  type Locale,
} from './catalog'
import type { MessageKey } from './messages'

interface LanguageContextValue {
  readonly locale: Locale
  readonly setLocale: (locale: Locale) => void
  readonly t: (key: MessageKey) => string
  readonly term: (id: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({
  children,
}: {
  readonly children: ReactNode
}) {
  const [locale, setLocale] = useState<Locale>(readLocale)

  // The document language is accessibility metadata, not financial state.
  useLayoutEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
    }
    persistLocale(locale)
  }, [locale])

  const language = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key) => getMessage(locale, key),
      term: (id) => getTerm(locale, id),
    }),
    [locale],
  )

  return (
    <LanguageContext.Provider value={language}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext)
  if (context === null) {
    throw new Error('useLanguage must be inside LanguageProvider')
  }
  return context
}
