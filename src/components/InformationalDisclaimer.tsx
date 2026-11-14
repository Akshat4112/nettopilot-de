import { useLanguage } from '../i18n/context'

const copy = {
  en: {
    heading: 'About these estimates',
    body: 'Estimates for information only — not an official payslip or personal tax, legal or financial advice. Results depend on your inputs, calculation year and supported German payroll rules. Verify important decisions with official sources or a qualified professional.',
    link: 'Read calculation methodology and limitations',
  },
  de: {
    heading: 'Hinweis zu diesen Schätzwerten',
    body: 'Unverbindliche Schätzwerte zur Information – keine offizielle Gehaltsabrechnung und keine individuelle Steuer-, Rechts- oder Finanzberatung. Ergebnisse hängen von Ihren Angaben, dem Berechnungsjahr und den unterstützten deutschen Lohnabrechnungsregeln ab. Prüfen Sie wichtige Entscheidungen anhand amtlicher Quellen oder mit qualifizierter Beratung.',
    link: 'Berechnungsmethode und Einschränkungen lesen',
  },
} as const

export function InformationalDisclaimer() {
  const { locale } = useLanguage()
  const message = copy[locale]
  return (
    <aside className="notice" aria-label={message.heading}>
      <strong>{message.heading}</strong>
      <p>{message.body}</p>
      <a href="#methodology">{message.link}</a>
    </aside>
  )
}
