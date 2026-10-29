import { useLayoutEffect, useRef, useState } from 'react'
import { focusDestination } from './focus-destination'
import { EffectiveHourlyComparison } from './EffectiveHourlyComparison'
import type { EffectiveHourlyInputs } from '../domain/comparison/effective-hourly'
import type { OfferComparisonDraft } from '../domain/comparison/offer-model'
import type { SalaryAggregationResult2026 } from '../domain/salary/salary-aggregation'
import {
  calculateOfferNetCompensation,
  emptyComparisonPayrollContext,
  offerNetReasonText,
  type ComparisonPayrollContext,
} from './offer-net-calculation'

const states = [
  ['DE-BB', 'Brandenburg'],
  ['DE-BE', 'Berlin'],
  ['DE-BW', 'Baden-Württemberg'],
  ['DE-BY', 'Bavaria'],
  ['DE-HB', 'Bremen'],
  ['DE-HE', 'Hesse'],
  ['DE-HH', 'Hamburg'],
  ['DE-MV', 'Mecklenburg-Vorpommern'],
  ['DE-NI', 'Lower Saxony'],
  ['DE-NW', 'North Rhine-Westphalia'],
  ['DE-RP', 'Rhineland-Palatinate'],
  ['DE-SH', 'Schleswig-Holstein'],
  ['DE-SL', 'Saarland'],
  ['DE-SN', 'Saxony'],
  ['DE-ST', 'Saxony-Anhalt'],
  ['DE-TH', 'Thuringia'],
] as const

const euro = (cents: number): string =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)

function NetResult({
  label,
  result,
}: {
  readonly label: string
  readonly result: SalaryAggregationResult2026
}) {
  return (
    <section aria-label={label + ' net result'}>
      <h4>{label}</h4>
      {result.state === 'calculated' ? (
        <>
          <dl>
            <div>
              <dt>Estimated annual recurring net pay</dt>
              <dd>{euro(result.annual.netPayrollCents)}</dd>
            </div>
            <div>
              <dt>Estimated monthly recurring net pay</dt>
              <dd>
                {result.recurringMonthlyNetCents === null
                  ? 'Varies by month; no average inferred.'
                  : euro(result.recurringMonthlyNetCents)}
              </dd>
            </div>
          </dl>
          <details>
            <summary>{label} annual payroll breakdown</summary>
            <table>
              <caption>{label} annual amounts in EUR</caption>
              <tbody>
                {(
                  [
                    ['Gross base salary', result.annual.grossCents],
                    ['Wage tax', result.annual.wageTaxCents],
                    ['Solidarity surcharge', result.annual.solidarityCents],
                    ['Church tax', result.annual.churchTaxCents],
                    [
                      'Employee statutory pension insurance',
                      result.annual.employeePensionCents,
                    ],
                    [
                      'Employee unemployment insurance',
                      result.annual.employeeUnemploymentCents,
                    ],
                    [
                      'Employee health insurance',
                      result.annual.employeeHealthCents,
                    ],
                    [
                      'Employee care insurance',
                      result.annual.employeeCareCents,
                    ],
                    ['Total deductions', result.annual.allDeductionsCents],
                    ['Net payroll pay', result.annual.netPayrollCents],
                  ] as const
                ).map(([name, value]) => (
                  <tr key={name}>
                    <th scope="row">{name}</th>
                    <td>{euro(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>
              Annual net equals gross base salary minus the listed deductions.
              No bonus, benefit, employer pension benefit, commute or
              home-office adjustment is included.
            </p>
          </details>
        </>
      ) : (
        <p>
          {label}: Net compensation unavailable.{' '}
          {offerNetReasonText(result.reason)}
        </p>
      )}
    </section>
  )
}

export function OfferNetCompensation({
  draft,
  inputValidity,
  hourlyInputs,
}: {
  readonly draft: OfferComparisonDraft
  readonly inputValidity: readonly [boolean, boolean]
  readonly hourlyInputs?: Omit<EffectiveHourlyInputs, 'netResult'>
}) {
  const sectionRef = useRef<HTMLElement>(null)
  const [focusRequest, setFocusRequest] = useState<{
    readonly target: 'result' | 'reset'
  } | null>(null)
  useLayoutEffect(() => {
    if (focusRequest === null) return
    focusDestination(
      sectionRef.current?.querySelector<HTMLElement>(
        focusRequest.target === 'reset'
          ? '#comparison-tax-class'
          : '#comparison-net-results',
      ) ?? null,
    )
  }, [focusRequest])
  const [context, setContext] = useState<ComparisonPayrollContext>(
    emptyComparisonPayrollContext,
  )
  const [requested, setRequested] = useState(false)
  // Recalculate from current props and context. Invalid edits cannot retain an old result.
  const result = requested
    ? calculateOfferNetCompensation(draft, context, inputValidity)
    : null
  const changeEssential = (
    key: 'taxClass' | 'federalState' | 'dateOfBirth',
    value: string,
  ): void => {
    setContext((current) => ({
      ...current,
      essential: { ...current.essential, [key]: value },
    }))
  }
  return (
    <section
      ref={sectionRef}
      className="offer-net-compensation"
      aria-labelledby="offer-net-heading"
    >
      <h3 id="offer-net-heading">Net compensation per offer</h3>
      <p>
        Compare estimated recurring base salary using the same explicit payroll
        assumptions for both offers. These settings are separate from the salary
        calculator above.
      </p>
      <p id="comparison-payroll-scope">
        Supported scope: 2026, twelve equal payroll months, monthly gross above
        €2,000 and below €5,800, compulsory statutory insurance, no children or
        church tax, and birth dates from 1963 through 2002. Annual inputs must
        divide into twelve exact monthly cent amounts. Additional cash payments
        need separate settlement and currently make that offer unavailable.
      </p>
      <fieldset className="offer-payroll-context">
        <legend>Shared payroll assumptions</legend>
        <p id="comparison-payroll-help">
          Tax year: 2026. No pension or benefit value is converted into payroll
          cash. Commute and remote-work costs remain separate.
        </p>
        <div className="np-field">
          <label htmlFor="comparison-tax-class">Comparison tax class</label>
          <select
            id="comparison-tax-class"
            aria-describedby="comparison-payroll-scope comparison-payroll-help"
            value={context.essential.taxClass}
            onChange={(event) => {
              changeEssential('taxClass', event.target.value)
            }}
          >
            <option value="">Choose tax class</option>
            {[1, 3, 4, 5, 6].map((value) => (
              <option key={value} value={String(value)}>
                Class {value}
              </option>
            ))}
          </select>
        </div>
        <div className="np-field">
          <label htmlFor="comparison-state">Comparison federal state</label>
          <select
            id="comparison-state"
            aria-describedby="comparison-payroll-scope comparison-payroll-help"
            value={context.essential.federalState}
            onChange={(event) => {
              changeEssential('federalState', event.target.value)
            }}
          >
            <option value="">Choose state</option>
            {states.map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="np-field">
          <label htmlFor="comparison-birth">Comparison date of birth</label>
          <input
            id="comparison-birth"
            autoComplete="bday"
            aria-describedby="comparison-payroll-scope comparison-payroll-help"
            type="date"
            value={context.essential.dateOfBirth}
            onChange={(event) => {
              changeEssential('dateOfBirth', event.target.value)
            }}
          />
        </div>
        <div className="np-field">
          <label htmlFor="comparison-health-rate">
            Comparison additional health rate (%)
          </label>
          <input
            id="comparison-health-rate"
            aria-describedby="comparison-payroll-scope comparison-health-rate-help"
            type="text"
            inputMode="decimal"
            value={context.additionalHealthRatePercent}
            onChange={(event) => {
              setContext((current) => ({
                ...current,
                additionalHealthRatePercent: event.target.value,
              }))
            }}
          />
          <small id="comparison-health-rate-help">
            Leave blank to use the published 2026 average in the salary engine
            for both offers, or enter the same insurer-specific additional rate
            (0–10%).
          </small>
        </div>
        <label htmlFor="comparison-confirmed">
          <input
            id="comparison-confirmed"
            aria-describedby="comparison-payroll-scope comparison-payroll-help"
            type="checkbox"
            checked={context.standardEmploymentConfirmed}
            onChange={(event) => {
              setContext((current) => ({
                ...current,
                standardEmploymentConfirmed: event.target.checked,
              }))
            }}
          />
          Confirm shared standard payroll assumptions: both offers concern the
          same person and tax profile, ordinary full-year employment with
          compulsory GKV, statutory pension and unemployment insurance, no
          children, no church tax, no adjusted allowances, and no special
          payroll treatment.
        </label>
      </fieldset>
      <div className="offer-actions">
        <button
          type="button"
          className="np-button-primary"
          onClick={() => {
            setRequested(true)
            setFocusRequest({ target: 'result' })
          }}
        >
          Calculate net compensation
        </button>
        <button
          type="button"
          className="np-button-secondary"
          onClick={() => {
            setContext(emptyComparisonPayrollContext())
            setRequested(false)
            setFocusRequest({ target: 'reset' })
          }}
        >
          Reset payroll assumptions
        </button>
      </div>
      {requested && (
        <section
          id="comparison-net-results"
          aria-label="Offer net compensation results"
          aria-live="polite"
          tabIndex={-1}
        >
          <h4>Current payroll results</h4>
          {result !== null && (
            <>
              <div className="offer-net-results">
                <NetResult label="Offer A" result={result.offers[0]} />
                <NetResult label="Offer B" result={result.offers[1]} />
              </div>
              {result.comparison.state === 'calculated' ? (
                <div>
                  <p>
                    Annual net difference (Offer B minus Offer A):{' '}
                    {euro(result.comparison.annualNetDifferenceCents)}
                  </p>
                  {result.comparison.monthlyNetDifferenceCents !== null && (
                    <p>
                      Monthly net difference (Offer B minus Offer A):{' '}
                      {euro(result.comparison.monthlyNetDifferenceCents)}
                    </p>
                  )}
                  {result.comparison.annualNetDifferenceCents === 0 && (
                    <p>Estimated recurring net pay is equal.</p>
                  )}
                </div>
              ) : (
                <p>
                  A net-pay difference is unavailable until both offers have
                  supported payroll results.
                </p>
              )}
              <details>
                <summary>Shared calculation basis and sources</summary>
                <p>
                  Both offers use the existing 2026 salary engine, the same
                  shared tax and insurance inputs, and twelve separately
                  aggregated payroll months. These are estimates, not a
                  tax-return calculation or an offer recommendation.
                </p>
                <p>
                  Calculation profile: {result.provenance.profileId}; year:{' '}
                  {result.provenance.calculationYear}.
                </p>
                <p>
                  Module assumptions:{' '}
                  {result.provenance.assumptionSetIds.join(', ')}.
                </p>
                <p>
                  Source references: {result.provenance.sourceIds.join(', ')}.
                </p>
              </details>
              {hourlyInputs !== undefined && (
                <EffectiveHourlyComparison
                  {...hourlyInputs}
                  netResult={result}
                />
              )}
            </>
          )}
        </section>
      )}
    </section>
  )
}
