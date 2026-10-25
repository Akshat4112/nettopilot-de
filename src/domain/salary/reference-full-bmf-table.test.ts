import { describe, expect, it } from 'vitest'
import officialCsv from '../../../fixtures/reference/2026/bmf-annual-wage-tax-check-table.csv?raw'
import { calculatePayrollTax2026 } from './payroll-tax'
import type { PapInput, StklValue } from './taxable-pay'

const headers = [
  'gross_reference_eur',
  'table_step_from_eur',
  'table_step_to_eur',
  'general_class_I_eur',
  'general_class_II_eur',
  'general_class_III_eur',
  'general_class_IV_eur',
  'general_class_V_eur',
  'general_class_VI_eur',
  'special_class_I_eur',
  'special_class_II_eur',
  'special_class_III_eur',
  'special_class_IV_eur',
  'special_class_V_eur',
  'special_class_VI_eur',
] as const

const exactCents = (decimal: string): number => {
  if (!/^\d+\.\d{2}$/.test(decimal))
    throw new Error('Invalid official reference decimal: ' + decimal)
  const [whole, cents] = decimal.split('.')
  const value = Number(whole) * 100 + Number(cents)
  if (!Number.isSafeInteger(value))
    throw new RangeError('Official reference cents exceed safe integer range')
  return value
}

const rows = officialCsv.trim().split('\n')
const columns = rows[0]?.split(',')
if (columns?.join(',') !== headers.join(','))
  throw new Error('BMF check-table header contract mismatch')
const data = rows.slice(1).map((line, index) => {
  const values = line.trim().split(',')
  if (values.length !== headers.length)
    throw new Error(`BMF CSV width mismatch at row ${String(index + 2)}`)
  return values.map(exactCents)
})

const referenceInput = (grossCents: number, taxClass: StklValue): PapInput => ({
  ALTER1: 0,
  ALV: 0,
  JFREIB: 0,
  JHINZU: 0,
  JRE4: 0,
  JRE4ENT: 0,
  JVBEZ: 0,
  KRV: 0,
  KVZ: 2.9,
  LZZ: 1,
  LZZFREIB: 0,
  LZZHINZU: 0,
  MBV: 0,
  PKPV: 0,
  PKPVAGZ: 0,
  PKV: 0,
  PVA: 0,
  PVS: 0,
  PVZ: 0,
  R: 0,
  RE4: grossCents,
  SONSTB: 0,
  SONSTENT: 0,
  STERBE: 0,
  STKL: taxClass,
  VBEZ: 0,
  VBEZM: 0,
  VBEZS: 0,
  VBS: 0,
  ZKF: 0,
  calculationYear: 2026,
})

describe('NP-CALC-017 complete official Annex 2 matrix', () => {
  it('transcribes the complete 43×12 check table without missing cells', () => {
    expect(data).toHaveLength(43)
    for (const row of data) {
      expect(row).toHaveLength(15)
      expect(row.every((value) => Number.isSafeInteger(value))).toBe(true)
      expect(row[1]).toBeLessThanOrEqual(row[2] ?? -1)
    }
    expect(data.length * 12).toBe(516)
  })

  it.each(
    data.flatMap((row, index) =>
      [1, 2, 3, 4, 5, 6].map((taxClass) => ({
        referenceIndex: index + 1,
        classIndex: taxClass,
        grossCents: row[2] ?? 0,
        expectedCents: row[2 + taxClass] ?? -1,
      })),
    ),
  )(
    'matches general Annex 2 row $referenceIndex tax class $classIndex exactly',
    ({ grossCents, classIndex, expectedCents }) => {
      const result = calculatePayrollTax2026(
        referenceInput(grossCents, classIndex as StklValue),
      )
      expect(result.wageTaxCents).toBe(expectedCents)
    },
  )
  it.each(
    data.flatMap((row, index) =>
      [1, 2, 3, 4, 5, 6].map((taxClass) => ({
        referenceIndex: index + 1,
        classIndex: taxClass,
        grossCents: row[2] ?? 0,
        expectedCents: row[8 + taxClass] ?? -1,
      })),
    ),
  )(
    'matches special Annex 2 row $referenceIndex class $classIndex exactly',
    ({ grossCents, classIndex, expectedCents }) => {
      const input = {
        ...referenceInput(grossCents, classIndex as StklValue),
        ALV: 1 as const,
        KRV: 1 as const,
        PKV: 1 as const,
        PKPV: 0,
        PKPVAGZ: 0,
      }
      const result = calculatePayrollTax2026(input)
      expect(result.wageTaxCents).toBe(expectedCents)
    },
  )

})
