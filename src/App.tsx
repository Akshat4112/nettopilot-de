const principles = [
  'Transparent estimates',
  'Browser-only by default',
  'German and English',
] as const

export function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="NettoPilot DE home">
          NettoPilot <span>DE</span>
        </a>
        <span className="status">Foundation preview</span>
      </header>

      <main>
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
            <strong>The calculation engine is not available yet.</strong>
            <span>
              This verified shell establishes the application foundation for
              the next implementation tasks.
            </span>
          </aside>
        </section>
      </main>

      <footer>
        <span>Educational estimates, not tax or legal advice.</span>
        <a href="https://github.com/Akshat4112/nettopilot-de">
          View the open-source project
        </a>
      </footer>
    </div>
  )
}
