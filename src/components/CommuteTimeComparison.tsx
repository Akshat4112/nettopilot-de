import {
  compareCommuteTime,
  type CommuteTimeEntry,
} from '../domain/comparison/commute-time'

const formatHours = (value: number) =>
  (value / 100).toLocaleString('en-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

export function CommuteTimeComparison({
  offerA,
  offerB,
}: {
  readonly offerA: CommuteTimeEntry
  readonly offerB: CommuteTimeEntry
}) {
  const result = compareCommuteTime(offerA, offerB)
  return (
    <section
      className="commute-time-comparison"
      aria-labelledby="commute-time-heading"
    >
      <h3 id="commute-time-heading">Estimated annual commute hours</h3>
      {result.state === 'comparable' ? (
        <>
          <dl className="vacation-comparison-values">
            <div>
              <dt>Offer A travel hours</dt>
              <dd>{formatHours(result.aHoursHundredths)} hours</dd>
            </div>
            <div>
              <dt>Offer B travel hours</dt>
              <dd>{formatHours(result.bHoursHundredths)} hours</dd>
            </div>
          </dl>
          <p>
            Annual commute time difference (B − A):{' '}
            {result.bMinusAHoursHundredths > 0 ? '+' : ''}
            {formatHours(result.bMinusAHoursHundredths)} hours.
          </p>
          <p>
            Travel time is not a salary deduction and has no invented euro
            value in this comparison.
          </p>
        </>
      ) : (
        <p>
          Annual commute time unavailable. Enter workdays, office days,
          paid vacation and one-way commute minutes for both offers.
          {result.offerA === 'invalid' ? ' Review Offer A.' : ''}
          {result.offerB === 'invalid' ? ' Review Offer B.' : ''}
        </p>
      )}
      <p className="vacation-method">
        Assumes two trips per office day, 52 weeks adjusted for paid leave.
        Public holidays, sickness, overtime and unpaid leave are excluded.
      </p>
    </section>
  )
}
