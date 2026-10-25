import { prepareBonus2026 } from './bonus'
import {
  calculateBonusSettlement2026,
  type BonusSettlementInput2026,
  type BonusSettlement2026,
} from './bonus-settlement'

type CalculatedBonus = Extract<
  BonusSettlement2026,
  { readonly state: 'calculated' }
>

export type BonusSettlementSequence2026 =
  | {
      readonly state: 'incomplete' | 'unsupported'
      readonly paymentIndex: number
      readonly reason: string
    }
  | {
      readonly state: 'calculated'
      readonly payments: readonly CalculatedBonus[]
      readonly totalGrossCents: number
      readonly totalNetCents: number
      readonly totalIncrementalEmployerCostCents: number
    }

const safe = (value: bigint): number => {
  const result = Number(value)
  if (!Number.isSafeInteger(result))
    throw new RangeError('Bonus sequence cents exceed safe integer range')
  return result
}

/** Payment order is stable; each current bonus consumes headroom for subsequent payments. */
export type BonusSequenceHistoryMode = 'reported_includes_batch' | 'reported_excludes_batch'

export const calculateBonusSettlementSequence2026 = (
  historyMode: BonusSequenceHistoryMode,
  inputs: readonly BonusSettlementInput2026[],
): BonusSettlementSequence2026 => {
  const payments: CalculatedBonus[] = []
  let previousMonth = 0
  let earlierOther = 0n
  let earlierKv = 0n
  let earlierRv = 0n
  let gross = 0n
  let net = 0n
  let cost = 0n
  for (const [index, input] of inputs.entries()) {
    const b = input.bonus
    if (b.paymentMonth < previousMonth)
      return {
        state: 'unsupported',
        paymentIndex: index,
        reason: 'payments_not_chronological',
      }
    previousMonth = b.paymentMonth
    if (
      b.priorKvPvContributoryPayCents === 'unknown' ||
      b.priorRvAvContributoryPayCents === 'unknown'
    )
      return {
        state: 'incomplete',
        paymentIndex: index,
        reason: 'contribution_history_required',
      }
    const current = {
      ...b,
      priorOtherRemunerationCents: safe(
        BigInt(b.priorOtherRemunerationCents) + (historyMode === 'reported_excludes_batch' ? earlierOther : 0n),
      ),
      priorKvPvContributoryPayCents: safe(
        BigInt(b.priorKvPvContributoryPayCents) + (historyMode === 'reported_excludes_batch' ? earlierKv : 0n),
      ),
      priorRvAvContributoryPayCents: safe(
        BigInt(b.priorRvAvContributoryPayCents) + (historyMode === 'reported_excludes_batch' ? earlierRv : 0n),
      ),
    }
    const prepared = prepareBonus2026(current)
    if (prepared.state !== 'prepared')
      return {
        state: prepared.state,
        paymentIndex: index,
        reason: prepared.reason,
      }
    const settled = calculateBonusSettlement2026({ ...input, bonus: current })
    if (settled.state !== 'calculated')
      return {
        state: settled.state,
        paymentIndex: index,
        reason: settled.reason,
      }
    payments.push(settled)
    earlierOther += BigInt(prepared.grossPaymentCents)
    earlierKv += BigInt(prepared.kvPvLiableCents)
    earlierRv += BigInt(prepared.rvAvLiableCents)
    gross += BigInt(settled.grossCents)
    net += BigInt(settled.netBonusCents)
    cost += BigInt(settled.incrementalEmployerCostCents)
  }
  return {
    state: 'calculated',
    payments,
    totalGrossCents: safe(gross),
    totalNetCents: safe(net),
    totalIncrementalEmployerCostCents: safe(cost),
  }
}
