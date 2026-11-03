import {
  calculateOfferComparisonMetrics,
  type OfferComparisonMetricsInputs,
} from './offer-comparison-metrics'
import { explainOfferComparison } from './offer-comparison-tradeoffs'

/** Deterministic current-input explanations, with no result or disclosure state. */
export function OfferComparisonTradeoffs(props: OfferComparisonMetricsInputs) {
  const sections = explainOfferComparison(
    calculateOfferComparisonMetrics(props),
  )
  return (
    <section
      className="offer-tradeoffs"
      aria-label="Entered factors behind the comparison"
    >
      <h4>Entered factors behind the comparison</h4>
      <p>
        These facts describe current 2026 estimates and entered terms, using the
        supported results above. Open a section for its Offer A / Offer B
        figures and calculation basis.
      </p>
      {sections.map((section) => (
        <details key={section.id}>
          <summary>
            <h5>{section.heading}</h5>
            <span className="offer-tradeoff-headline">{section.headline}</span>
          </summary>
          <ul>
            {section.facts.map((fact) => (
              <li key={fact.label}>{fact.description}</li>
            ))}
          </ul>
          {section.basis.map((basis) => (
            <p key={basis}>{basis}</p>
          ))}
        </details>
      ))}
    </section>
  )
}
