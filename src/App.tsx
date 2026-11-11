import { EssentialSalaryInputs } from './components/EssentialSalaryInputs'
import { OfferComparisonInputs } from './components/OfferComparisonInputs'
import { CalculationMethodology } from './components/CalculationMethodology'
import { APP_BASE_PATH } from './config/app'
import { LanguageProvider } from './i18n/LanguageProvider'
import { useLanguage } from './i18n/context'
import type { MessageKey } from './i18n/messages'

const principles: readonly MessageKey[] = [
  'hero.principle.transparent',
  'hero.principle.private',
  'hero.principle.languages',
]

function LocalizedApp() {
  const { locale, setLocale, t } = useLanguage()

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        {t('navigation.skipToMain')}
      </a>
      <header className="site-header">
        <a
          className="brand"
          href={APP_BASE_PATH}
          aria-label={t('navigation.home')}
        >
          NettoPilot <span>DE</span>
        </a>
        <div className="site-header-controls">
          <span className="status">{t('navigation.preview')}</span>
          <div className="language-picker">
            <label htmlFor="np-language">{t('navigation.language')}</label>
            <select
              id="np-language"
              value={locale}
              onChange={(event) => {
                setLocale(event.target.value === 'de' ? 'de' : 'en')
              }}
            >
              <option value="en">English</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section className="hero" aria-labelledby="hero-title">
          <p className="eyebrow">{t('hero.eyebrow')}</p>
          <h1 id="hero-title">{t('hero.title')}</h1>
          <p className="intro">{t('hero.intro')}</p>

          <ul className="principles" aria-label={t('hero.principles')}>
            {principles.map((principle) => (
              <li key={principle}>{t(principle)}</li>
            ))}
          </ul>

          <aside className="notice" aria-label={t('hero.status')}>
            <strong>{t('hero.scopeTitle')}</strong>
            <span>{t('hero.scopeBody')}</span>
          </aside>
          {locale === 'de' && (
            <p className="locale-progress-note" role="note">
              {t('language.partialNotice')}
            </p>
          )}
        </section>

        <EssentialSalaryInputs />
        <OfferComparisonInputs />
        <CalculationMethodology />
      </main>

      <footer>
        <span>{t('footer.disclaimer')}</span>
        <a href="#methodology">{t('footer.methodology')}</a>
        <a href="https://github.com/Akshat4112/nettopilot-de">
          {t('footer.repository')}
        </a>
      </footer>
    </div>
  )
}

export function App() {
  return (
    <LanguageProvider>
      <LocalizedApp />
    </LanguageProvider>
  )
}
