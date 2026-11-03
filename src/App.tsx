import { EssentialSalaryInputs } from './components/EssentialSalaryInputs'
import { OfferComparisonInputs } from './components/OfferComparisonInputs'
import { CalculationMethodology } from './components/CalculationMethodology'
import { APP_BASE_PATH } from './config/app'

const principles = [
  'Transparent estimates',
  'Browser-only by default',
  'German and English',
] as const

export function App() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="site-header">
        <a
          className="brand"
          href={APP_BASE_PATH}
          aria-label="NettoPilot DE home"
        >
          NettoPilot <span>DE</span>
        </a>
        <span className="status">2026 calculator preview</span>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section className="hero" aria-labelledby="hero-title">
          <p className="eyebrow">German salary clarity</p>
          <h1 id="hero-title">Understand the money behind a job offer.</h1>
          <p className="intro">
            NettoPilot DE is being built to explain estimated net salary,
            deductions, and offer trade-offs without hiding the assumptions.
          </p>

          <ul className="principles" aria-label="Product principles">
            {principles.map((principle) => (
              <li key={principle}>{principle}</li>
            ))}
          </ul>

          <aside className="notice" aria-label="Application status">
            <strong>A limited 2026 gross-to-net estimate is available.</strong>
            <span>
              The calculator currently supports confirmed standard employee
              scenarios with compulsory statutory insurance, no children, no
              church tax and no special payments. Other cases are explicitly
              excluded.
            </span>
          </aside>
        </section>
        <EssentialSalaryInputs />
        <OfferComparisonInputs />
        <CalculationMethodology />
      </main>

      <footer>
        <span>Educational estimates, not tax or legal advice.</span>
        <a href="#methodology">Calculation methodology</a>
        <a href="https://github.com/Akshat4112/nettopilot-de">
          View the open-source project
        </a>
      </footer>
    </div>
  )
}
