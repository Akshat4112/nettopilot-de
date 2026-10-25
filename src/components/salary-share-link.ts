/**
 * Privacy-first share contract. The URL never includes salary, tax class,
 * church/religion, date of birth, child count, insurance status, or bonuses.
 * Recipients must enter their own private payroll data and re-confirm it.
 */
export interface ShareableSalarySettings {
  readonly year: '2026'
  readonly period: 'monthly' | 'annual'
  readonly federalState?: string
}

export type ShareReadResult =
  | { readonly status: 'none' }
  | { readonly status: 'invalid' }
  | {
      readonly status: 'valid'
      readonly settings: ShareableSalarySettings
    }

const federalStates = new Set([
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
])

const permittedKeys = new Set(['np', 'year', 'period', 'state'])

export const readShareableSalarySettings = (search: string): ShareReadResult => {
  const params = new URLSearchParams(search)
  if (!params.has('np')) return { status: 'none' }
  if ([...params.keys()].some((key) => !permittedKeys.has(key)))
    return { status: 'invalid' }
  if ([...permittedKeys].some((key) => params.getAll(key).length > 1))
    return { status: 'invalid' }
  if (params.get('np') !== '1' || params.get('year') !== '2026')
    return { status: 'invalid' }
  const period = params.get('period')
  if (period !== 'monthly' && period !== 'annual')
    return { status: 'invalid' }
  const state = params.get('state')
  if (state !== null && !federalStates.has(state))
    return { status: 'invalid' }
  return {
    status: 'valid',
    settings: {
      year: '2026',
      period,
      ...(state === null ? {} : { federalState: state }),
    },
  }
}

export const createShareableSalaryUrl = (
  currentUrl: string,
  settings: ShareableSalarySettings,
): string => {
  if (settings.year !== '2026')
    throw new RangeError('Unsupported share year')
  if (settings.period !== 'monthly' && settings.period !== 'annual')
    throw new RangeError('Unsupported share frequency')
  if (
    settings.federalState !== undefined &&
    settings.federalState !== '' &&
    !federalStates.has(settings.federalState)
  )
    throw new RangeError('Unsupported federal state')
  const url = new URL(currentUrl)
  if (url.protocol !== 'https:' && url.protocol !== 'http:')
    throw new RangeError('Share links must use HTTP(S)')
  const params = new URLSearchParams({
    np: '1',
    year: '2026',
    period: settings.period,
  })
  if (settings.federalState) params.set('state', settings.federalState)
  url.search = params.toString()
  url.hash = ''
  return url.toString()
}
