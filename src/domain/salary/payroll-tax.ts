/**
 * 2026 BMF payroll-tax plan (Anlage 1, final 12 November 2025).
 *
 * The named helpers mirror the official PAP procedures. Arithmetic is rational
 * until the plan explicitly requests ROUND_DOWN/ROUND_UP, so no binary
 * floating-point value enters a tax calculation.
 */
import type { PapInput } from './taxable-pay'

interface Rat {
  n: bigint
  d: bigint
}
const r = (n: bigint | number, d: bigint | number = 1): Rat => ({
  n: BigInt(n),
  d: BigInt(d),
})
const pow10 = (n: number) => 10n ** BigInt(n)
const dec = (value: string): Rat => {
  const [parsedWhole, fraction = ''] = value.split('.')
  const whole = parsedWhole ?? '0'
  return r(BigInt(`${whole}${fraction}`), pow10(fraction.length))
}
const add = (a: Rat, b: Rat): Rat => r(a.n * b.d + b.n * a.d, a.d * b.d)
const sub = (a: Rat, b: Rat): Rat => r(a.n * b.d - b.n * a.d, a.d * b.d)
const mul = (a: Rat, b: Rat): Rat => r(a.n * b.n, a.d * b.d)
const div = (a: Rat, b: Rat): Rat => {
  if (b.n === 0n) throw new RangeError('Division by zero')
  return r(a.n * b.d, a.d * b.n)
}
const cmp = (a: Rat, b: Rat) => {
  const delta = a.n * b.d - b.n * a.d
  return delta < 0n ? -1 : delta > 0n ? 1 : 0
}
const truncInt = (a: Rat) => a.n / a.d
const floorInt = (a: Rat) => {
  const q = a.n / a.d
  return a.n < 0n && a.n % a.d !== 0n ? q - 1n : q
}
const ceilInt = (a: Rat) => {
  const q = a.n / a.d
  return a.n > 0n && a.n % a.d !== 0n ? q + 1n : q
}
const quantize = (a: Rat, scale: number, mode: 'down' | 'up'): Rat => {
  const factor = pow10(scale)
  const scaled = mul(a, r(factor))
  const value = mode === 'down' ? truncInt(scaled) : ceilInt(scaled)
  return r(value, factor)
}
const max = (a: Rat, b: Rat) => (cmp(a, b) >= 0 ? a : b)
const min = (a: Rat, b: Rat) => (cmp(a, b) <= 0 ? a : b)
const centsToEuro = (cents: number): Rat => r(BigInt(cents), 100)
const integer = (value: Rat): bigint => truncInt(value)
const safeNumber = (value: bigint): number => {
  const result = Number(value)
  if (!Number.isSafeInteger(result))
    throw new RangeError('PAP result exceeds safe integer range')
  return result
}

export interface PayrollTaxTrace {
  annualisedRecurringPayEuro: string
  fixedAllowanceEuro: string
  vorsorgepauschaleEuro: string
  taxableIncomeEuro: string
  annualWageTaxEuro: string
  soliAssessmentTaxEuro: string
}

export interface PayrollTaxResult {
  calculationYear: 2026
  sourceId: 'DE-BMF-PAP-2026-A1'
  wageTaxCents: number
  solidaritySurchargeCents: number
  churchTaxAssessmentBaseCents: number
  otherRemunerationWageTaxCents: number
  otherRemunerationSolidaritySurchargeCents: number
  otherRemunerationChurchTaxAssessmentBaseCents: number
  trace: PayrollTaxTrace
}

interface AnnualResult {
  taxEuro: Rat
  taxBeforeFactorEuro: Rat
  ztabfb: Rat
  vsp: Rat
  zve: Rat
  kztab: 1 | 2
  kfb: Rat
}

const validate = (i: PapInput) => {
  if (i.calculationYear !== 2026)
    throw new RangeError('Only the 2026 BMF PAP is implemented')
  for (const [name, value] of Object.entries(i)) {
    if (typeof value === 'number' && !Number.isFinite(value))
      throw new TypeError(`${name} must be finite`)
  }
  if (![1, 2, 3, 4].includes(i.LZZ))
    throw new RangeError('LZZ must be 1, 2, 3, or 4')
  if (i.STKL < 1 || i.STKL > 6) throw new RangeError('STKL must be 1 through 6')
  if (i.RE4 < 0 || i.SONSTB < 0)
    throw new RangeError('RE4 and SONSTB must be non-negative')
  if (i.F !== undefined && i.STKL !== 4)
    throw new RangeError('The factor method is only valid for tax class IV')
  if (i.VBEZ > i.RE4) throw new RangeError('VBEZ must not exceed RE4')
  if (i.ALTER1 !== 0 || i.VBEZ !== 0 || i.VBS !== 0 || i.JVBEZ !== 0)
    throw new RangeError(
      'Pension-benefit and age-relief PAP branches are not admitted in v1',
    )
  if (i.MBV !== 0 || i.JRE4ENT !== 0 || i.SONSTENT !== 0 || i.STERBE !== 0)
    throw new RangeError(
      'Section 19a, compensation, and death-benefit branches are not admitted in v1',
    )
  if (i.LZZFREIB !== 0 || i.LZZHINZU !== 0 || i.JFREIB !== 0 || i.JHINZU !== 0)
    throw new RangeError(
      'ELStAM allowance/addition branches are not admitted in v1',
    )
  if (i.SONSTB > 0 && i.JRE4 === 0)
    throw new RangeError('JRE4 is required for other remuneration')
}

/** MRE4JL — annualise the selected wage-payment period. */
const annualise = (cents: number, lzz: PapInput['LZZ']): Rat => {
  const value = centsToEuro(cents)
  if (lzz === 1) return quantize(value, 2, 'down')
  if (lzz === 2) return quantize(mul(value, r(12)), 2, 'down')
  if (lzz === 3) return quantize(div(mul(value, r(360)), r(7)), 2, 'down')
  return quantize(mul(value, r(360)), 2, 'down')
}

/** UPTAB26 — 2026 income-tax tariff. */
const tariff = (x: Rat, kztab: 1 | 2): Rat => {
  let st: Rat
  if (cmp(x, r(12_349)) < 0) st = r(0)
  else if (cmp(x, r(17_800)) < 0) {
    const y = quantize(div(sub(x, r(12_348)), r(10_000)), 6, 'down')
    st = r(floorInt(mul(add(mul(y, dec('914.51')), r(1_400)), y)))
  } else if (cmp(x, r(69_879)) < 0) {
    const y = quantize(div(sub(x, r(17_799)), r(10_000)), 6, 'down')
    st = r(
      floorInt(
        add(mul(add(mul(y, dec('173.1')), r(2_397)), y), dec('1034.87')),
      ),
    )
  } else if (cmp(x, r(277_826)) < 0)
    st = r(floorInt(sub(mul(x, dec('0.42')), dec('11135.63'))))
  else st = r(floorInt(sub(mul(x, dec('0.45')), dec('19470.38'))))
  return mul(st, r(kztab))
}

/** UP5_6 / MST5_6 — special tax-class V/VI path. */
const classFiveSixTax = (zzx: Rat): Rat => {
  const probe = (zx: Rat) => {
    const st1 = tariff(r(floorInt(mul(zx, dec('1.25')))), 1)
    const st2 = tariff(r(floorInt(mul(zx, dec('0.75')))), 1)
    return max(mul(sub(st1, st2), r(2)), r(floorInt(mul(zx, dec('0.14')))))
  }
  if (cmp(zzx, r(34_939)) > 0) {
    let st = probe(r(34_939))
    st = add(st, mul(sub(min(zzx, r(222_260)), r(34_939)), dec('0.42')))
    if (cmp(zzx, r(222_260)) > 0)
      st = add(st, mul(sub(zzx, r(222_260)), dec('0.45')))
    return r(floorInt(st))
  }
  const direct = probe(zzx)
  if (cmp(zzx, r(14_071)) <= 0) return direct
  const capped = r(
    floorInt(add(probe(r(14_071)), mul(sub(zzx, r(14_071)), dec('0.42')))),
  )
  return min(capped, direct)
}

/** UPEVP / MVSPKVPV / MVSPHB — Vorsorgepauschale. */
const vorsorgepauschale = (i: PapInput, annualGross: Rat): Rat => {
  const rvBase = min(annualGross, r(101_400))
  const kvBase = min(annualGross, r(69_750))
  const vspr =
    i.KRV === 1 ? r(0) : quantize(mul(rvBase, dec('0.093')), 2, 'down')
  let kvpv: Rat
  if (i.PKV === 1) {
    kvpv =
      i.STKL === 6
        ? r(0)
        : max(
            r(0),
            sub(
              quantize(mul(centsToEuro(i.PKPV), r(12)), 2, 'down'),
              quantize(mul(centsToEuro(i.PKPVAGZ), r(12)), 2, 'down'),
            ),
          )
  } else {
    const healthRate = add(dec('0.07'), div(dec(String(i.KVZ)), r(200)))
    let careRate = i.PVS === 1 ? dec('0.023') : dec('0.018')
    careRate =
      i.PVZ === 1
        ? add(careRate, dec('0.006'))
        : sub(careRate, mul(r(i.PVA), dec('0.0025')))
    kvpv = quantize(mul(kvBase, add(healthRate, careRate)), 2, 'down')
  }
  let vsp = r(ceilInt(add(vspr, kvpv)))
  if (i.ALV === 0 && i.STKL !== 6) {
    const alv = quantize(mul(rvBase, dec('0.013')), 2, 'down')
    const cappedOther = min(quantize(add(alv, kvpv), 2, 'down'), r(1_900))
    vsp = max(vsp, r(ceilInt(add(vspr, cappedOther))))
  }
  return vsp
}

/** MZTABFB + MLSTJAHR for the admitted active-employment path. */
const annualTax = (
  i: PapInput,
  annualGross: Rat,
  childAllowance = false,
): AnnualResult => {
  const activePay = annualGross
  const anp = i.STKL < 6 ? min(activePay, r(1_230)) : r(0)
  const efa = i.STKL === 2 ? r(4_260) : r(0)
  const sap = i.STKL < 6 ? r(36) : r(0)
  const kztab: 1 | 2 = i.STKL === 3 ? 2 : 1
  const kfbUnit = i.STKL === 4 ? 4_878 : i.STKL <= 3 ? 9_756 : 0
  const kfb = r(floorInt(mul(dec(String(i.ZKF)), r(kfbUnit))))
  let ztabfb = quantize(add(add(efa, anp), sap), 2, 'down')
  if (childAllowance) ztabfb = add(ztabfb, kfb)
  const vsp = vorsorgepauschale(i, annualGross)
  const zve = sub(activePay, add(ztabfb, vsp))
  const x = cmp(zve, r(1)) < 0 ? r(0) : r(floorInt(div(zve, r(kztab))))
  const taxBeforeFactorEuro = i.STKL < 5 ? tariff(x, kztab) : classFiveSixTax(x)
  const factor = i.F === undefined ? r(1) : dec(String(i.F))
  const taxEuro = r(floorInt(mul(taxBeforeFactorEuro, factor)))
  return { taxEuro, taxBeforeFactorEuro, ztabfb, vsp, zve, kztab, kfb }
}

const allocateAnnualCents = (annualEuro: Rat, lzz: PapInput['LZZ']): bigint => {
  const cents = mul(annualEuro, r(100))
  if (lzz === 1) return integer(cents)
  if (lzz === 2) return truncInt(div(cents, r(12)))
  if (lzz === 3) return truncInt(div(mul(cents, r(7)), r(360)))
  return truncInt(div(cents, r(360)))
}

const soli = (
  assessmentTaxEuro: Rat,
  kztab: 1 | 2,
  lzz: PapInput['LZZ'],
): bigint => {
  const threshold = r(20_350 * kztab)
  if (cmp(assessmentTaxEuro, threshold) <= 0) return 0n
  const full = quantize(
    div(mul(assessmentTaxEuro, dec('5.5')), r(100)),
    2,
    'down',
  )
  const taper = quantize(
    div(mul(sub(assessmentTaxEuro, threshold), dec('11.9')), r(100)),
    2,
    'down',
  )
  return allocateAnnualCents(min(full, taper), lzz)
}

const format = (value: Rat, scale = 2) => {
  const q = quantize(value, scale, 'down')
  const n = q.n < 0n ? -q.n : q.n
  const sign = q.n < 0n ? '-' : ''
  const text = n.toString().padStart(scale + 1, '0')
  return `${sign}${text.slice(0, -scale)}.${text.slice(-scale)}`
}

export const calculatePayrollTax2026 = (input: PapInput): PayrollTaxResult => {
  validate(input)
  const annualGross = annualise(input.RE4, input.LZZ)
  const regular = annualTax(input, annualGross)
  const assessment =
    input.ZKF > 0 ? annualTax(input, annualGross, true) : regular
  const wageTax = allocateAnnualCents(regular.taxEuro, input.LZZ)
  const regularSoli = soli(assessment.taxEuro, assessment.kztab, input.LZZ)
  const regularChurchBase =
    input.R > 0 ? allocateAnnualCents(assessment.taxEuro, input.LZZ) : 0n

  let otherTax = 0n
  let otherSoli = 0n
  let otherChurchBase = 0n
  if (input.SONSTB > 0) {
    const beforeGross = centsToEuro(input.JRE4)
    const afterGross = centsToEuro(input.JRE4 + input.SONSTB)
    const before = annualTax({ ...input, LZZ: 1 }, beforeGross)
    const after = annualTax({ ...input, LZZ: 1 }, afterGross)
    const factor = input.F === undefined ? r(1) : dec(String(input.F))
    otherTax =
      truncInt(
        div(
          mul(
            sub(
              mul(after.taxBeforeFactorEuro, r(100)),
              mul(before.taxBeforeFactorEuro, r(100)),
            ),
            factor,
          ),
          r(100),
        ),
      ) * 100n
    if (otherTax < 0n) otherTax = 0n
    const afterAssessment =
      input.ZKF > 0 ? annualTax({ ...input, LZZ: 1 }, afterGross, true) : after
    if (cmp(afterAssessment.taxEuro, r(20_350 * afterAssessment.kztab)) > 0)
      otherSoli = truncInt(div(mul(r(otherTax), dec('5.5')), r(100)))
    if (input.R > 0) otherChurchBase = otherTax
  }

  return {
    calculationYear: 2026,
    sourceId: 'DE-BMF-PAP-2026-A1',
    wageTaxCents: safeNumber(wageTax),
    solidaritySurchargeCents: safeNumber(regularSoli),
    churchTaxAssessmentBaseCents: safeNumber(regularChurchBase),
    otherRemunerationWageTaxCents: safeNumber(otherTax),
    otherRemunerationSolidaritySurchargeCents: safeNumber(otherSoli),
    otherRemunerationChurchTaxAssessmentBaseCents: safeNumber(otherChurchBase),
    trace: {
      annualisedRecurringPayEuro: format(annualGross),
      fixedAllowanceEuro: format(regular.ztabfb),
      vorsorgepauschaleEuro: format(regular.vsp),
      taxableIncomeEuro: format(regular.zve),
      annualWageTaxEuro: format(regular.taxEuro),
      soliAssessmentTaxEuro: format(assessment.taxEuro),
    },
  }
}
