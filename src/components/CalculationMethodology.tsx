/** Public explanation of the admitted calculator, based on checked-in evidence. */
export function CalculationMethodology() {
  return (
    <section
      id="methodology"
      className="np-panel"
      aria-labelledby="methodology-heading"
    >
      <p className="np-eyebrow">Calculation year 2026 · Germany · EUR</p>
      <h2 id="methodology-heading">Calculation methodology</h2>
      <p>
        NettoPilot estimates payroll withholding and employee contributions for
        the supported inputs below. Payroll net is gross pay minus wage tax,
        solidarity surcharge and employee social insurance. It is an estimate,
        not a payslip or a final income-tax assessment.
      </p>

      <h3>What the calculator currently supports</h3>
      <ul>
        <li>
          Ordinary employment for the full 2026 year with 12 equal payroll
          months and compulsory statutory health, pension and unemployment
          insurance. Monthly gross must be above EUR 2,000 and below EUR 5,800.
          These are this calculator’s limits, not statutory insurance
          thresholds.
        </li>
        <li>
          Tax classes I, III, IV without factor, V and VI; no children, no
          church tax, and dates of birth from 1963-01-01 through 2002-12-31. The
          federal state affects the employee care-insurance share in Saxony.
        </li>
        <li>
          An entered insurer-specific additional health rate, or the 2.9%
          published average if left blank. The 2.9% published average is an
          estimate and may differ from your insurer’s rate.
        </li>
      </ul>
      <p>
        Bonuses and additional cash, private insurance, tax allowance or
        addition adjustments, and other special payroll cases are outside the
        connected calculation. Missing inputs or unsupported cases produce an
        unavailable result. Separate engine modules cover broader cases; their
        existence does not mean the current calculator supports those cases.
      </p>

      <h3>Monthly and annual results</h3>
      <p>
        Monthly pay is calculated for all 12 payroll months. Annual pay must
        divide into 12 equal monthly amounts in EUR cents; unresolved cent
        allocations are unavailable. Annual net is the sum of those monthly
        payroll results, using the same salary and assumptions. It is not the
        result of treating a whole year’s salary as one annual payment. A
        monthly result is shown only when the recurring monthly net is stable.
      </p>

      <h3>Tax, contributions and rounding</h3>
      <p>
        Wage tax and solidarity surcharge follow the final BMF 2026 machine
        calculation plan dated 12 November 2025. Pension, unemployment,
        statutory health and care contributions are calculated separately with
        their applicable rates, ceilings and employee shares. The BMF plan alone
        does not calculate net salary or actual social-insurance deductions.
      </p>
      <p>
        Money enters and leaves calculations as integer EUR cents. Exact
        intermediates are retained until a specified rounding step: tax follows
        the BMF plan’s truncation and rounding instructions; social-insurance
        shares use the applicable BVV contribution rounding and sharing order.
        Display formatting does not decide whether amounts are equal. Hourly
        ratios are separate estimates, not payroll amounts rounded at each step.
      </p>

      <h3>How offer comparisons differ</h3>
      <p>
        Both offers use the same entered payroll assumptions and the same
        supported base-salary calculation. Differences are Offer B minus Offer
        A. Bonuses and other additional compensation are not included in an
        offer’s payroll net; entering them makes that payroll estimate
        unavailable.
      </p>
      <p>
        Commuting costs, remote work, benefits, employer pension entries and
        working time remain separate comparison context. They do not change
        payroll net. Annual contractual hours use weekly hours × (52 − paid
        vacation days ÷ working days per week), excluding public holidays,
        sickness, overtime and unpaid leave. A net-per-hour comparison requires
        validated annual net and a valid annual-hours basis; any separately
        adjusted measure must identify its costs and time basis. No overall
        recommendation follows from a higher figure.
      </p>

      <h3>Evidence and limits</h3>
      <p>
        The test suite checks 516 official BMF annual wage-tax table values
        (general and special tables) with exact cent comparisons. This verifies
        that reference matrix; it does not certify the complete net-salary
        calculation, every scenario or the current interface. The special table
        is not ordinary private-insurance payroll. Other component tests do not
        establish complete independent coverage of 12-month salary aggregation.
      </p>
      <p>
        The repository’s annual assumptions example is a partial draft without
        production approval. The calculator uses its bundled module assumptions;
        there is no claim of a complete approved annual manifest. Source
        research records verification on 24 September 2026; the draft example
        records 26 September 2026. These are recorded dates, not a new source
        audit or a certification of current law.
      </p>

      <h3>Official sources behind the bundled rules</h3>
      <ul>
        <li>
          <a href="https://www.bundesfinanzministerium.de/Content/DE/Downloads/Steuern/Steuerarten/Lohnsteuer/Programmablaufplan/2025-11-12-PAP-2026-anlage-1.pdf?__blob=publicationFile&v=2">
            BMF 2026 machine calculation plan (Anlage 1)
          </a>{' '}
          — wage tax, solidarity surcharge and tax rounding.
        </li>
        <li>
          <a href="https://www.deutsche-rentenversicherung.de/KnappschaftBahnSee/DE/Aktuelles/Meldungen/2026/2026_01_02_Sozialversicherungsrechengroessen2026.html">
            Deutsche Rentenversicherung 2026 insurance values
          </a>{' '}
          and{' '}
          <a href="https://www.gesetze-im-internet.de/sgb_3/__341.html">
            SGB III section 341
          </a>{' '}
          — pension and unemployment contributions.
        </li>
        <li>
          <a href="https://www.gesetze-im-internet.de/sgb_5/__241.html">
            SGB V section 241
          </a>{' '}
          and{' '}
          <a href="https://www.bundesgesundheitsministerium.de/beitraege">
            BMG health-insurance contributions
          </a>{' '}
          — statutory health rate and published additional-rate estimate.
        </li>
        <li>
          <a href="https://www.gesetze-im-internet.de/sgb_11/__55.html">
            SGB XI section 55
          </a>{' '}
          and{' '}
          <a href="https://www.gesetze-im-internet.de/sgb_11/__58.html">
            SGB XI section 58
          </a>{' '}
          — care contributions, childless status and employee shares.
        </li>
        <li>
          <a href="https://www.gesetze-im-internet.de/beitrvv/BJNR113800006.html">
            BVV contribution rounding (sections 1–2)
          </a>{' '}
          — contribution periods, rounding and share calculation.
        </li>
      </ul>
    </section>
  )
}
