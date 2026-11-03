import {
  evaluatePayrollScope,
  PAYROLL_SCOPE_2026,
  type PayrollScopeInput,
} from './payroll-scope'

const euros = (cents: number): string =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(cents / 100)

export function PayrollScopeSummary({ id }: { readonly id?: string }) {
  const scope = PAYROLL_SCOPE_2026
  return (
    <p id={id} className="payroll-scope-summary">
      Supported estimate: {scope.year}, monthly gross above{' '}
      {euros(scope.monthlyGrossMinExclusiveCents)} and below{' '}
      {euros(scope.monthlyGrossMaxExclusiveCents)}; birth dates{' '}
      {scope.birthDateMinInclusive} through {scope.birthDateMaxInclusive}{' '}
      (inclusive). Ordinary full-year employment with {scope.payrollMonths}{' '}
      equal payroll months, compulsory GKV, statutory pension and unemployment
      insurance, no children or church tax, and no allowance adjustments or
      special payments. Annual gross must divide into {scope.payrollMonths}{' '}
      equal monthly cent amounts.
    </p>
  )
}

/** Guidance uses current draft fields and never invokes the payroll engine. */
export function PayrollScopeGuidance({
  data,
  label = 'Salary',
  showSummary = true,
}: {
  readonly data: PayrollScopeInput
  readonly label?: string
  readonly showSummary?: boolean
}) {
  const guidance = evaluatePayrollScope(data)
  return (
    <div className="payroll-scope-guidance">
      {showSummary && <PayrollScopeSummary />}
      <div
        role="status"
        aria-label={`${label} payroll scope`}
        aria-live="polite"
      >
        {guidance.issues.length > 0 && (
          <>
            <p>{label}: A net estimate is unavailable for these selections.</p>
            <ul>
              {guidance.issues.map((issue) => (
                <li key={issue.reason}>{issue.message}</li>
              ))}
            </ul>
          </>
        )}
        {guidance.missingFields.length > 0 && (
          <p>Missing payroll inputs: complete the remaining required fields.</p>
        )}
        {(guidance.invalidFields.length > 0 ||
          guidance.advancedErrors.length > 0) && (
          <p>
            Invalid payroll inputs: correct the entered values using the field
            validation messages.
          </p>
        )}
        {guidance.confirmationRequired && (
          <p>
            Confirm the employment assumptions only if they match the actual
            payroll case.
          </p>
        )}
        {guidance.state === 'within_scope' && (
          <p>
            {label}: These inputs match the limited payroll scope. Calculate to
            validate the estimate.
          </p>
        )}
      </div>
    </div>
  )
}
