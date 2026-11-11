/**
 * NP-I18N-002: small complete UI-message catalogs, independent of business
 * calculations. NP-I18N-003/004 migrate remaining feature copy in later PRs.
 * Both locales are required for every migrated message key.
 */
export const englishMessages = {
  'navigation.skipToMain': 'Skip to main content',
  'navigation.home': 'NettoPilot DE home',
  'navigation.language': 'Language',
  'navigation.preview': '2026 calculator preview',
  'hero.eyebrow': 'German salary clarity',
  'hero.title': 'Understand the money behind a job offer.',
  'hero.intro':
    'NettoPilot DE is being built to explain estimated net salary, deductions, and offer trade-offs without hiding the assumptions.',
  'hero.principles': 'Product principles',
  'hero.principle.transparent': 'Transparent estimates',
  'hero.principle.private': 'Browser-only by default',
  'hero.principle.languages': 'German and English',
  'hero.status': 'Application status',
  'hero.scopeTitle': 'A limited 2026 gross-to-net estimate is available.',
  'hero.scopeBody':
    'The calculator currently supports confirmed standard employee scenarios with compulsory statutory insurance, no children, no church tax and no special payments. Other cases are explicitly excluded.',
  'footer.disclaimer': 'Educational estimates, not tax or legal advice.',
  'footer.methodology': 'Calculation methodology',
  'footer.repository': 'View the open-source project',
  'language.partialNotice':
    'German translations are being introduced. Calculator and comparison sections are still in English.',
} as const

export type MessageKey = keyof typeof englishMessages

export const germanMessages: Record<MessageKey, string> = {
  'navigation.skipToMain': 'Zum Hauptinhalt springen',
  'navigation.home': 'NettoPilot DE Startseite',
  'navigation.language': 'Sprache',
  'navigation.preview': 'Gehaltsrechner-Vorschau für 2026',
  'hero.eyebrow': 'Klarheit beim Gehalt in Deutschland',
  'hero.title': 'Verstehen Sie, was hinter einem Stellenangebot steckt.',
  'hero.intro':
    'NettoPilot DE hilft dabei, das geschätzte Nettogehalt, Abzüge und Unterschiede zwischen Stellenangeboten nachvollziehbar zu machen – mit transparenten Annahmen.',
  'hero.principles': 'Grundsätze',
  'hero.principle.transparent': 'Transparente Schätzungen',
  'hero.principle.private': 'Standardmäßig nur im Browser',
  'hero.principle.languages': 'Deutsch und Englisch',
  'hero.status': 'Anwendungsstatus',
  'hero.scopeTitle':
    'Eine eingeschränkte Brutto-Netto-Schätzung für 2026 ist verfügbar.',
  'hero.scopeBody':
    'Der Rechner unterstützt derzeit bestätigte Standardfälle mit gesetzlicher Pflichtversicherung, ohne Kinder, Kirchensteuer und Sonderzahlungen. Andere Fälle sind ausdrücklich ausgeschlossen.',
  'footer.disclaimer':
    'Unverbindliche Schätzungen, keine Steuer- oder Rechtsberatung.',
  'footer.methodology': 'Berechnungsmethodik',
  'footer.repository': 'Open-Source-Projekt aufrufen',
  'language.partialNotice':
    'Die deutsche Übersetzung wird schrittweise ergänzt. Die Bereiche für Gehaltsberechnung und Angebotsvergleich sind noch auf Englisch.',
}

export const messages = {
  en: englishMessages,
  de: germanMessages,
} as const
