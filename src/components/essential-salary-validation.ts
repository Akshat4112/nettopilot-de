import type { EssentialSalaryDraft } from './EssentialSalaryInputs'

export type EssentialField = keyof EssentialSalaryDraft
export type FieldErrors = Partial<Record<EssentialField, string>>

/** Fail closed: no inferred values for missing or unsupported payroll inputs. */
export function validateEssentialSalaryDraft(draft: EssentialSalaryDraft): FieldErrors {
  const errors: FieldErrors = {}
  const gross = Number(draft.gross)
  if (!draft.gross || !/^(?:0|[1-9]\\d*)(?:\\.\\d{1,2})?$/.test(draft.gross) ||
      gross <= 0 || gross * (draft.period === 'monthly' ? 12 : 1) > 10000000)
    errors.gross = 'Enter a positive gross salary within the supported range.'
  if (!['monthly', 'annual'].includes(draft.period))
    errors.period = 'Choose a supported pay frequency.'
  if (draft.year !== '2026') errors.year = 'Only tax year 2026 is supported.'
  if (!['1','2','3','4','5','6'].includes(draft.taxClass))
    errors.taxClass = 'Choose a valid tax class.'
  if (!/^DE-(BB|BE|BW|BY|HB|HE|HH|MV|NI|NW|RP|SH|SL|SN|ST|TH)$/.test(draft.federalState))
    errors.federalState = 'Choose a federal state.'
  if (!['liable', 'not_liable'].includes(draft.churchTax))
    errors.churchTax = draft.churchTax === 'unknown'
      ? 'Confirm church-tax liability before calculating.'
      : 'Choose your church-tax liability.'
  const birth = draft.dateOfBirth
  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(birth) ||
      Number.isNaN(Date.parse(birth)) || new Date(birth).toISOString().slice(0,10) !== birth ||
      birth < '1900-01-01' || birth > '2026-12-31')
    errors.dateOfBirth = 'Enter a valid date of birth.'
  if (!/^(?:0|[1-9]\\d?)$/.test(draft.children) || Number(draft.children)>20)
    errors.children = 'Enter a number of children from 0 to 20.'
  if (!['statutory','private'].includes(draft.insurance))
    errors.insurance = draft.insurance === 'unknown'
      ? 'Confirm your health-insurance type before calculating.'
      : 'Choose your health-insurance type.'
  return errors
}
