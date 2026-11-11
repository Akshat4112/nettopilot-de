import {
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getMessage, getTerm, persistLocale, readLocale, type Locale } from './catalog'
import { LanguageContext, type LanguageContextValue } from './context'

export function LanguageProvider({
  children,
}: {
  readonly children: ReactNode
}) {
  const [locale, setLocale] = useState<Locale>(readLocale)

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
