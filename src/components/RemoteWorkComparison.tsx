import {
  evaluateRemoteWork,
  type RemoteWorkEntry,
  type RemoteWorkEvaluation,
} from '../domain/comparison/remote-work'

const euro = (cents: number) =>
  (cents / 100).toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
  })

function RemoteTerms({
  label,
  result,
}: {
  readonly label: string
  readonly result: RemoteWorkEvaluation
}) {
  return (
    <div>
      <dt>{label} remote-work terms</dt>
      {result.state === 'valid' ? (
        <dd>
          <p>Work arrangement: {result.arrangement}</p>
          <p>
            Expected remote work:{' '}
            {result.remoteDaysPerWeek.state === 'provided'
              ? String(result.remoteDaysPerWeek.value) + ' days per week'
              : 'Not specified'}
          </p>
          <p>
            Employer home-office allowance:{' '}
            {result.employerAllowanceMonthlyCents.state === 'provided'
              ? euro(result.employerAllowanceMonthlyCents.value) + ' per month'
              : 'Not specified'}
          </p>
          <p>
            Home-office expenses:{' '}
            {result.homeOfficeCostMonthlyCents.state === 'provided'
              ? euro(result.homeOfficeCostMonthlyCents.value) + ' per month'
              : 'Not specified'}
          </p>
        </dd>
      ) : (
        <dd>Unavailable until the work arrangement and office days agree.</dd>
      )}
    </div>
  )
}

export function RemoteWorkComparison({
  offerA,
  offerB,
}: {
  readonly offerA: RemoteWorkEntry
  readonly offerB: RemoteWorkEntry
}) {
  return (
    <section
      className="remote-work-comparison"
      aria-labelledby="remote-work-comparison-title"
    >
      <h3 id="remote-work-comparison-title">Remote-work comparison</h3>
      <dl className="vacation-comparison-values">
        <RemoteTerms label="Offer A" result={evaluateRemoteWork(offerA)} />
        <RemoteTerms label="Offer B" result={evaluateRemoteWork(offerB)} />
      </dl>
      <p>
        Allowances and expenses are shown separately. No tax treatment, assumed
        employer reimbursement, or automatic net-pay adjustment is calculated.
      </p>
    </section>
  )
}
