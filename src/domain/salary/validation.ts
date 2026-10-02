import type {
  CalculationYear,
  DecimalString,
  IndividualSalaryScenarioInput,
} from './types'

export type ValidationIssueCode =
  | 'required'
  | 'invalid_type'
  | 'invalid_value'
  | 'out_of_range'
  | 'unsupported_option'
  | 'unsupported_year'
  | 'inconsistent_fields'
  | 'annual_compensation_high'

export interface LocalizedValidationMessage {
  readonly de: string
  readonly en: string
}

export interface SalaryValidationIssue {
  readonly path: string
  readonly code: ValidationIssueCode
  readonly message: LocalizedValidationMessage
}

export interface SalaryValidationRules {
  readonly calculationYear: number
  readonly taxClassIds: readonly string[]
  readonly pensionStatusIds: readonly string[]
  readonly unemploymentStatusIds: readonly string[]
  readonly oneOffPaymentClassificationIds: readonly string[]
  readonly childAllowanceFactorMaximum: DecimalString
}

export type SalaryValidationResult =
  | {
      readonly success: true
      readonly value: IndividualSalaryScenarioInput
      readonly warnings: readonly SalaryValidationIssue[]
    }
  | {
      readonly success: false
      readonly errors: readonly SalaryValidationIssue[]
      readonly warnings: readonly SalaryValidationIssue[]
    }

const states = [
  'DE-BB',
  'DE-BE',
  'DE-BW',
  'DE-BY',
  'DE-HB',
  'DE-HE',
  'DE-HH',
  'DE-MV',
  'DE-NI',
  'DE-NW',
  'DE-RP',
  'DE-SH',
  'DE-SL',
  'DE-SN',
  'DE-ST',
  'DE-TH',
] as const

const decimalPattern = /^(0|[1-9]\d*)(\.\d+)?$/
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/

type RecordValue = Record<string, unknown>

const isRecord = (value: unknown): value is RecordValue =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const issue = (
  path: string,
  code: ValidationIssueCode,
  en: string,
  de: string,
): SalaryValidationIssue => ({ path, code, message: { de, en } })

const compareDecimals = (left: string, right: string): number => {
  const [leftWhole = '0', leftFraction = ''] = left.split('.')
  const [rightWhole = '0', rightFraction = ''] = right.split('.')
  const scale = Math.max(leftFraction.length, rightFraction.length)
  const leftValue = BigInt(leftWhole + leftFraction.padEnd(scale, '0'))
  const rightValue = BigInt(rightWhole + rightFraction.padEnd(scale, '0'))
  return leftValue < rightValue ? -1 : leftValue > rightValue ? 1 : 0
}

const annualCompensation = (compensation: RecordValue): string | undefined => {
  const base = compensation.baseSalary
  const regular = compensation.regularAdditionalCash
  const oneOffs = compensation.oneOffPayments
  if (!isRecord(base) || !isRecord(regular) || !Array.isArray(oneOffs)) return
  if (oneOffs.length > 12) return

  const amounts: { value: string; multiplier: bigint }[] = []
  const baseAmount = isRecord(base.grossAmount) && base.grossAmount.amount
  if (typeof baseAmount !== 'string' || !decimalPattern.test(baseAmount)) return
  amounts.push({
    value: baseAmount,
    multiplier: base.period === 'monthly' ? 12n : 1n,
  })

  if (regular.kind === 'included') {
    const value = isRecord(regular.amount) && regular.amount.amount
    if (typeof value !== 'string' || !decimalPattern.test(value)) return
    amounts.push({
      value,
      multiplier: regular.period === 'monthly' ? 12n : 1n,
    })
  }

  for (const payment of oneOffs) {
    if (!isRecord(payment) || !isRecord(payment.amount)) return
    const value = payment.amount.amount
    if (typeof value !== 'string' || !decimalPattern.test(value)) return
    amounts.push({ value, multiplier: 1n })
  }

  const scale = Math.max(
    ...amounts.map(({ value }) => value.split('.')[1]?.length ?? 0),
  )
  const total = amounts.reduce((sum, { value, multiplier }) => {
    const [whole = '0', fraction = ''] = value.split('.')
    return sum + BigInt(whole + fraction.padEnd(scale, '0')) * multiplier
  }, 0n)
  const digits = total.toString().padStart(scale + 1, '0')
  return scale === 0
    ? digits
    : `${digits.slice(0, -scale)}.${digits.slice(-scale)}`
}

export const validateIndividualSalaryScenario = (
  input: unknown,
  rules: SalaryValidationRules,
  today = new Date().toISOString().slice(0, 10),
): SalaryValidationResult => {
  const errors: SalaryValidationIssue[] = []
  const warnings: SalaryValidationIssue[] = []

  const requiredRecord = (value: unknown, path: string): RecordValue => {
    if (value === undefined || value === null) {
      errors.push(
        issue(
          path,
          'required',
          'This field is required.',
          'Dieses Feld ist erforderlich.',
        ),
      )
      return {}
    }
    if (!isRecord(value)) {
      errors.push(
        issue(
          path,
          'invalid_type',
          'Expected an object.',
          'Ein Objekt wird erwartet.',
        ),
      )
      return {}
    }
    return value
  }

  const requiredString = (value: unknown, path: string): string | undefined => {
    if (value === undefined || value === null || value === '') {
      errors.push(
        issue(
          path,
          'required',
          'This field is required.',
          'Dieses Feld ist erforderlich.',
        ),
      )
      return
    }
    if (typeof value !== 'string') {
      errors.push(
        issue(path, 'invalid_type', 'Expected text.', 'Text wird erwartet.'),
      )
      return
    }
    return value
  }

  const enumValue = (
    value: unknown,
    path: string,
    options: readonly string[],
    allowUnknown = false,
  ): string | undefined => {
    const candidate = requiredString(value, path)
    if (candidate === undefined) return
    if (
      !options.includes(candidate) &&
      !(allowUnknown && candidate === 'unknown')
    ) {
      errors.push(
        issue(
          path,
          'unsupported_option',
          'Select a supported option.',
          'Wählen Sie eine unterstützte Option.',
        ),
      )
      return
    }
    return candidate
  }

  const decimal = (
    value: unknown,
    path: string,
    minimum = '0',
    maximum = '10000000',
  ): string | undefined => {
    const candidate = requiredString(value, path)
    if (candidate === undefined) return
    if (!decimalPattern.test(candidate)) {
      errors.push(
        issue(
          path,
          'invalid_value',
          'Enter a non-negative decimal using a dot.',
          'Geben Sie eine nicht negative Dezimalzahl mit Punkt ein.',
        ),
      )
      return
    }
    if (
      compareDecimals(candidate, minimum) < 0 ||
      compareDecimals(candidate, maximum) > 0
    ) {
      errors.push(
        issue(
          path,
          'out_of_range',
          `Enter a value from ${minimum} to ${maximum}.`,
          `Geben Sie einen Wert von ${minimum} bis ${maximum} ein.`,
        ),
      )
      return
    }
    return candidate
  }

  const euro = (
    value: unknown,
    path: string,
    minimum = '0',
    maximum = '10000000',
  ): string | undefined => {
    const amount = requiredRecord(value, path)
    enumValue(amount.currency, `${path}.currency`, ['EUR'])
    return decimal(amount.amount, `${path}.amount`, minimum, maximum)
  }

  const optionalLabel = (
    value: unknown,
    path: string,
    maximum: number,
  ): void => {
    if (value === undefined) return
    const candidate = requiredString(value, path)
    if (candidate === undefined) return
    const trimmed = candidate.trim()
    if (trimmed.length < 1 || trimmed.length > maximum) {
      errors.push(
        issue(
          path,
          'out_of_range',
          `Use 1 to ${String(maximum)} characters.`,
          `Verwenden Sie 1 bis ${String(maximum)} Zeichen.`,
        ),
      )
    } else if (candidate !== trimmed) {
      errors.push(
        issue(
          path,
          'invalid_value',
          'Remove leading or trailing whitespace.',
          'Entfernen Sie Leerzeichen am Anfang oder Ende.',
        ),
      )
    }
  }

  const requiredLabel = (
    value: unknown,
    path: string,
    maximum: number,
  ): void => {
    const candidate = requiredString(value, path)
    if (candidate === undefined) return
    const trimmed = candidate.trim()
    if (trimmed.length < 1 || trimmed.length > maximum) {
      errors.push(
        issue(
          path,
          'out_of_range',
          `Use 1 to ${String(maximum)} visible characters.`,
          `Verwenden Sie 1 bis ${String(maximum)} sichtbare Zeichen.`,
        ),
      )
    } else if (candidate !== trimmed) {
      errors.push(
        issue(
          path,
          'invalid_value',
          'Remove leading or trailing whitespace.',
          'Entfernen Sie Leerzeichen am Anfang oder Ende.',
        ),
      )
    }
  }

  const rejectInactiveFields = (
    value: RecordValue,
    path: string,
    activeFields: readonly string[],
  ): void => {
    for (const field of Object.keys(value)) {
      if (!activeFields.includes(field)) {
        errors.push(
          issue(
            `${path}.${field}`,
            'inconsistent_fields',
            'Remove this field because it does not apply to the selected option.',
            'Entfernen Sie dieses Feld, da es für die ausgewählte Option nicht gilt.',
          ),
        )
      }
    }
  }

  const root = requiredRecord(input, '$')
  const context = requiredRecord(root.context, 'context')
  if (!Number.isInteger(context.calculationYear)) {
    errors.push(
      issue(
        'context.calculationYear',
        context.calculationYear == null ? 'required' : 'invalid_type',
        'Select a calculation year.',
        'Wählen Sie ein Berechnungsjahr.',
      ),
    )
  } else if (context.calculationYear !== rules.calculationYear) {
    errors.push(
      issue(
        'context.calculationYear',
        'unsupported_year',
        'The selected calculation year is not supported by this assumption set.',
        'Das ausgewählte Berechnungsjahr wird von diesem Annahmensatz nicht unterstützt.',
      ),
    )
  }
  enumValue(context.locale, 'context.locale', ['de-DE', 'en-DE'])
  enumValue(context.currency, 'context.currency', ['EUR'])
  optionalLabel(context.scenarioLabel, 'context.scenarioLabel', 80)

  const scope = requiredRecord(root.scope, 'scope')
  enumValue(scope.employmentCategory, 'scope.employmentCategory', [
    'regular_employee_full_time',
    'regular_employee_part_time',
    'unsupported_other',
  ])
  enumValue(scope.payrollCountry, 'scope.payrollCountry', [
    'DE',
    'unsupported_other',
  ])
  if (
    ![true, false, 'unknown'].includes(
      scope.crossBorderTreatmentRequired as never,
    )
  ) {
    errors.push(
      issue(
        'scope.crossBorderTreatmentRequired',
        scope.crossBorderTreatmentRequired == null
          ? 'required'
          : 'invalid_value',
        'Choose yes, no, or unknown.',
        'Wählen Sie ja, nein oder unbekannt.',
      ),
    )
  }
  if (
    scope.simultaneousEmploymentCount !== 'unknown' &&
    (!Number.isInteger(scope.simultaneousEmploymentCount) ||
      (scope.simultaneousEmploymentCount as number) < 1 ||
      (scope.simultaneousEmploymentCount as number) > 20)
  ) {
    errors.push(
      issue(
        'scope.simultaneousEmploymentCount',
        scope.simultaneousEmploymentCount == null ? 'required' : 'out_of_range',
        'Enter 1 to 20, or unknown.',
        'Geben Sie 1 bis 20 oder unbekannt ein.',
      ),
    )
  }
  enumValue(
    scope.specialEmploymentCase,
    'scope.specialEmploymentCase',
    [
      'none',
      'mini_job',
      'midijob',
      'working_student',
      'short_time_work',
      'severance',
      'company_car',
      'complex_equity',
      'other',
    ],
    true,
  )

  const compensation = requiredRecord(root.compensation, 'compensation')
  const base = requiredRecord(
    compensation.baseSalary,
    'compensation.baseSalary',
  )
  enumValue(base.period, 'compensation.baseSalary.period', [
    'monthly',
    'annual',
  ])
  euro(base.grossAmount, 'compensation.baseSalary.grossAmount', '0.01')
  if (base.paymentsPerYear !== 12) {
    errors.push(
      issue(
        'compensation.baseSalary.paymentsPerYear',
        base.paymentsPerYear == null ? 'required' : 'invalid_value',
        'Payments per year must be 12 in v1.',
        'Die Zahlungen pro Jahr müssen in v1 12 betragen.',
      ),
    )
  }
  const regular = requiredRecord(
    compensation.regularAdditionalCash,
    'compensation.regularAdditionalCash',
  )
  const regularKind = enumValue(
    regular.kind,
    'compensation.regularAdditionalCash.kind',
    ['none', 'included'],
  )
  const regularAmount = euro(
    regular.amount,
    'compensation.regularAdditionalCash.amount',
  )
  if (
    regularKind === 'none' &&
    regularAmount !== undefined &&
    compareDecimals(regularAmount, '0') !== 0
  ) {
    errors.push(
      issue(
        'compensation.regularAdditionalCash.amount.amount',
        'inconsistent_fields',
        'Use zero when no recurring additional cash is included.',
        'Verwenden Sie null, wenn keine regelmäßige Zusatzvergütung enthalten ist.',
      ),
    )
  }
  if (regularKind === 'included') {
    enumValue(regular.period, 'compensation.regularAdditionalCash.period', [
      'monthly',
      'annual',
    ])
    enumValue(
      regular.guarantee,
      'compensation.regularAdditionalCash.guarantee',
      ['guaranteed', 'variable'],
    )
  }
  if (!Array.isArray(compensation.oneOffPayments)) {
    errors.push(
      issue(
        'compensation.oneOffPayments',
        compensation.oneOffPayments == null ? 'required' : 'invalid_type',
        'Expected a list of payments.',
        'Eine Liste von Zahlungen wird erwartet.',
      ),
    )
  } else {
    if (compensation.oneOffPayments.length > 12) {
      errors.push(
        issue(
          'compensation.oneOffPayments',
          'out_of_range',
          'Add no more than 12 one-off payments.',
          'Fügen Sie höchstens 12 Einmalzahlungen hinzu.',
        ),
      )
    }
    compensation.oneOffPayments.slice(0, 12).forEach((rawPayment, index) => {
      const path = `compensation.oneOffPayments.${String(index)}`
      const payment = requiredRecord(rawPayment, path)
      euro(payment.amount, `${path}.amount`, '0.01')
      if (
        !Number.isInteger(payment.paymentMonth) ||
        (payment.paymentMonth as number) < 1 ||
        (payment.paymentMonth as number) > 12
      ) {
        errors.push(
          issue(
            `${path}.paymentMonth`,
            payment.paymentMonth == null ? 'required' : 'out_of_range',
            'Enter a month from 1 to 12.',
            'Geben Sie einen Monat von 1 bis 12 ein.',
          ),
        )
      }
      enumValue(
        payment.classification,
        `${path}.classification`,
        rules.oneOffPaymentClassificationIds,
      )
      enumValue(payment.guarantee, `${path}.guarantee`, [
        'guaranteed',
        'variable',
      ])
      optionalLabel(payment.label, `${path}.label`, 80)
    })
  }

  const tax = requiredRecord(root.tax, 'tax')
  enumValue(tax.taxClass, 'tax.taxClass', rules.taxClassIds)
  enumValue(tax.federalState, 'tax.federalState', states)
  enumValue(
    tax.churchTaxStatus,
    'tax.churchTaxStatus',
    ['liable', 'not_liable'],
    true,
  )
  const birthDate = requiredString(tax.dateOfBirth, 'tax.dateOfBirth')
  if (birthDate !== undefined) {
    const parsed = new Date(`${birthDate}T00:00:00Z`)
    if (
      !isoDatePattern.test(birthDate) ||
      Number.isNaN(parsed.valueOf()) ||
      parsed.toISOString().slice(0, 10) !== birthDate ||
      birthDate >= today
    ) {
      errors.push(
        issue(
          'tax.dateOfBirth',
          'invalid_value',
          'Enter a real date in the past as YYYY-MM-DD.',
          'Geben Sie ein gültiges Datum in der Vergangenheit als JJJJ-MM-TT ein.',
        ),
      )
    }
  }
  decimal(
    tax.childAllowanceFactor,
    'tax.childAllowanceFactor',
    '0',
    rules.childAllowanceFactorMaximum,
  )
  euro(tax.annualAllowanceAmount, 'tax.annualAllowanceAmount')
  euro(tax.annualAdditionalAmount, 'tax.annualAdditionalAmount')

  const social = requiredRecord(root.social, 'social')
  enumValue(
    social.pensionStatus,
    'social.pensionStatus',
    rules.pensionStatusIds,
    true,
  )
  enumValue(
    social.unemploymentStatus,
    'social.unemploymentStatus',
    rules.unemploymentStatusIds,
    true,
  )
  enumValue(
    social.careInsuranceChildStatus,
    'social.careInsuranceChildStatus',
    ['has_child', 'childless'],
    true,
  )
  if (
    social.childrenUnderRelevantAge !== 'unknown' &&
    (!Number.isInteger(social.childrenUnderRelevantAge) ||
      (social.childrenUnderRelevantAge as number) < 0 ||
      (social.childrenUnderRelevantAge as number) > 20)
  ) {
    errors.push(
      issue(
        'social.childrenUnderRelevantAge',
        social.childrenUnderRelevantAge == null ? 'required' : 'out_of_range',
        'Enter 0 to 20, or unknown.',
        'Geben Sie 0 bis 20 oder unbekannt ein.',
      ),
    )
  }
  const health = requiredRecord(social.health, 'social.health')
  const healthType = enumValue(
    health.healthInsuranceType,
    'social.health.healthInsuranceType',
    ['statutory', 'private'],
    true,
  )
  if (healthType === 'statutory') {
    const rateMode = enumValue(
      health.additionalRateMode,
      'social.health.additionalRateMode',
      ['published_average', 'insurer_specific'],
    )
    if (rateMode === 'insurer_specific') {
      rejectInactiveFields(health, 'social.health', [
        'healthInsuranceType',
        'additionalRateMode',
        'additionalContributionRate',
      ])
      const rate = requiredRecord(
        health.additionalContributionRate,
        'social.health.additionalContributionRate',
      )
      decimal(
        rate.value,
        'social.health.additionalContributionRate.value',
        '0',
        '100',
      )
      enumValue(rate.unit, 'social.health.additionalContributionRate.unit', [
        'percent',
      ])
    } else if (rateMode === 'published_average') {
      rejectInactiveFields(health, 'social.health', [
        'healthInsuranceType',
        'additionalRateMode',
      ])
    }
  } else if (healthType === 'private') {
    rejectInactiveFields(health, 'social.health', [
      'healthInsuranceType',
      'totalHealthPremiumMonthly',
      'totalCarePremiumMonthly',
      'payrollBasicCoverageAmountMonthly',
      'employerContributionKnown',
      ...(health.employerContributionKnown === true
        ? ['employerContributionMonthly']
        : []),
    ])
    const healthPremium = euro(
      health.totalHealthPremiumMonthly,
      'social.health.totalHealthPremiumMonthly',
      '0',
      '100000',
    )
    const carePremium = euro(
      health.totalCarePremiumMonthly,
      'social.health.totalCarePremiumMonthly',
      '0',
      '100000',
    )
    const basic =
      health.payrollBasicCoverageAmountMonthly === undefined
        ? undefined
        : euro(
            health.payrollBasicCoverageAmountMonthly,
            'social.health.payrollBasicCoverageAmountMonthly',
            '0',
            '100000',
          )
    const totalPremium =
      healthPremium !== undefined && carePremium !== undefined
        ? annualCompensation({
            baseSalary: {
              period: 'annual',
              grossAmount: { amount: healthPremium },
            },
            regularAdditionalCash: {
              kind: 'included',
              period: 'annual',
              amount: { amount: carePremium },
            },
            oneOffPayments: [],
          })
        : undefined
    if (basic !== undefined && totalPremium !== undefined) {
      if (compareDecimals(basic, totalPremium) > 0) {
        errors.push(
          issue(
            'social.health.payrollBasicCoverageAmountMonthly.amount',
            'inconsistent_fields',
            'Basic coverage cannot exceed the total health and care premium.',
            'Der Basistarif darf den gesamten Kranken- und Pflegeversicherungsbeitrag nicht übersteigen.',
          ),
        )
      }
    }
    if (health.employerContributionKnown === true) {
      const contribution = euro(
        health.employerContributionMonthly,
        'social.health.employerContributionMonthly',
        '0',
        '100000',
      )
      if (
        contribution !== undefined &&
        totalPremium !== undefined &&
        compareDecimals(contribution, totalPremium) > 0
      ) {
        errors.push(
          issue(
            'social.health.employerContributionMonthly.amount',
            'inconsistent_fields',
            'The employer contribution cannot exceed the total health and care premium.',
            'Der Arbeitgeberzuschuss darf den gesamten Kranken- und Pflegeversicherungsbeitrag nicht übersteigen.',
          ),
        )
      }
    } else if (health.employerContributionKnown !== false) {
      errors.push(
        issue(
          'social.health.employerContributionKnown',
          health.employerContributionKnown == null
            ? 'required'
            : 'invalid_value',
          'Choose yes or no.',
          'Wählen Sie ja oder nein.',
        ),
      )
    }
  } else if (healthType === 'unknown') {
    rejectInactiveFields(health, 'social.health', ['healthInsuranceType'])
  }

  const comparison = requiredRecord(root.comparison, 'comparison')
  if (!Array.isArray(comparison.benefits)) {
    errors.push(
      issue(
        'comparison.benefits',
        comparison.benefits == null ? 'required' : 'invalid_type',
        'Expected a list of benefits.',
        'Eine Liste von Leistungen wird erwartet.',
      ),
    )
  } else {
    if (comparison.benefits.length > 20)
      errors.push(
        issue(
          'comparison.benefits',
          'out_of_range',
          'Add no more than 20 benefits.',
          'Fügen Sie höchstens 20 Leistungen hinzu.',
        ),
      )
    comparison.benefits.slice(0, 20).forEach((rawBenefit, index) => {
      const path = `comparison.benefits.${String(index)}`
      const benefit = requiredRecord(rawBenefit, path)
      requiredLabel(benefit.label, `${path}.label`, 120)
      if (benefit.employerValueAnnual !== undefined)
        euro(
          benefit.employerValueAnnual,
          `${path}.employerValueAnnual`,
          '0',
          '1000000',
        )
      if (benefit.userValueAnnual !== undefined)
        euro(benefit.userValueAnnual, `${path}.userValueAnnual`, '0', '1000000')
      enumValue(
        benefit.certainty,
        `${path}.certainty`,
        ['guaranteed', 'conditional'],
        true,
      )
    })
  }
  if (comparison.weeklyHours !== undefined)
    decimal(comparison.weeklyHours, 'comparison.weeklyHours', '0.01', '80')
  if (comparison.vacationDaysAnnual !== undefined)
    decimal(
      comparison.vacationDaysAnnual,
      'comparison.vacationDaysAnnual',
      '0',
      '366',
    )
  if (comparison.remoteDaysPerWeek !== undefined)
    decimal(
      comparison.remoteDaysPerWeek,
      'comparison.remoteDaysPerWeek',
      '0',
      '7',
    )
  if (comparison.commuteOneWayKm !== undefined)
    decimal(
      comparison.commuteOneWayKm,
      'comparison.commuteOneWayKm',
      '0',
      '2000',
    )

  const annual = annualCompensation(compensation)
  if (annual !== undefined) {
    if (compareDecimals(annual, '10000000') > 0)
      errors.push(
        issue(
          'compensation',
          'out_of_range',
          'Annual compensation must not exceed EUR 10,000,000.',
          'Die Jahresvergütung darf 10.000.000 EUR nicht überschreiten.',
        ),
      )
    else if (compareDecimals(annual, '1000000') > 0)
      warnings.push(
        issue(
          'compensation',
          'annual_compensation_high',
          'Please verify this unusually high annual compensation.',
          'Bitte prüfen Sie diese ungewöhnlich hohe Jahresvergütung.',
        ),
      )
  }

  if (errors.length > 0) return { success: false, errors, warnings }
  return {
    success: true,
    value: input as IndividualSalaryScenarioInput & {
      readonly context: { readonly calculationYear: CalculationYear }
    },
    warnings,
  }
}
