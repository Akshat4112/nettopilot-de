import type { OfferComparisonSummaryInputs } from '../components/OfferComparisonSummary'
import { blankBenefits } from '../domain/comparison/benefits'
import { blankRemoteWork } from '../domain/comparison/remote-work'
import { calculateOfferNetCompensation } from '../components/offer-net-calculation'
import { buildOfferPairFromEntries } from '../components/offer-input-validation'

export const comparisonInputs = (): OfferComparisonSummaryInputs => {
  const working = {
    weeklyHours: '40',
    workingDaysPerWeek: '5',
    paidVacationDaysAnnual: '20',
  }
  const commuteCosts = {
    workingDaysPerWeek: '5',
    officeDaysPerWeek: '5',
    paidVacationDaysAnnual: '20',
    publicTransportPerOfficeDayEur: '0',
    fuelPerOfficeDayEur: '5',
    parkingPerOfficeDayEur: '0',
    otherPerOfficeDayEur: '0',
  }
  const commuteTime = {
    workingDaysPerWeek: '5',
    officeDaysPerWeek: '5',
    paidVacationDaysAnnual: '20',
    oneWayMinutes: '30',
  }
  const benefit = {
    id: 'learning',
    label: 'Learning budget',
    certainty: 'guaranteed' as const,
    employerStatedAnnualValueEur: '100.01',
    userAssignedAnnualValueEur: '50.02',
    description: '',
  }
  return {
    working: [working, { ...working, paidVacationDaysAnnual: '25' }],
    commuteCosts: [
      commuteCosts,
      { ...commuteCosts, paidVacationDaysAnnual: '25' },
    ],
    commuteTime: [
      commuteTime,
      { ...commuteTime, paidVacationDaysAnnual: '25' },
    ],
    benefits: [
      {
        ...blankBenefits(),
        employerContributionAnnualEur: '1000',
        benefits: [benefit],
      },
      {
        ...blankBenefits(),
        employerContributionAnnualEur: '1100',
        benefits: [
          {
            ...benefit,
            employerStatedAnnualValueEur: '120.02',
            userAssignedAnnualValueEur: '40.01',
          },
        ],
      },
    ],
    remote: [
      {
        ...blankRemoteWork(),
        arrangement: 'onsite',
        workingDaysPerWeek: '5',
        officeDaysPerWeek: '5',
      },
      {
        ...blankRemoteWork(),
        arrangement: 'onsite',
        workingDaysPerWeek: '5',
        officeDaysPerWeek: '5',
      },
    ],
    netResult: calculateOfferNetCompensation(
      buildOfferPairFromEntries(
        { grossEur: '4000', period: 'monthly' },
        { grossEur: '5000', period: 'monthly' },
      ),
      {
        essential: {
          year: '2026',
          taxClass: '4',
          federalState: 'DE-BW',
          churchTax: 'not_liable',
          dateOfBirth: '1990-01-01',
          children: '0',
          insurance: 'statutory',
        },
        additionalHealthRatePercent: '',
        standardEmploymentConfirmed: true,
      },
    ),
  }
}
