import {
  prepareBonus2026,
  type BonusPreparationInput2026,
  type BonusPreparationResult2026,
} from './bonus'

export type BonusSequence2026 =
  | {
      readonly state: 'incomplete' | 'unsupported'
      readonly paymentIndex: number
      readonly reason: string
    }
  | {
      readonly state: 'prepared'
      readonly payments: readonly Extract<
        BonusPreparationResult2026,
        { readonly state: 'prepared' }
      >[]
      readonly totalGrossCents: number
    }

const safe = (value: bigint): number => {
  const result = Number(value)
  if (!Number.isSafeInteger(result))
    throw new RangeError('Bonus sequence exceeds safe integer range')
  return result
}

/** Preserve entered order for same-month payments and reject reversed months. */
export type BonusSequenceHistoryMode = 'reported_includes_batch' | 'reported_excludes_batch'

export const prepareBonusSequence2026 = (
  historyMode: BonusSequenceHistoryMode,
  payments: readonly BonusPreparationInput2026[],
): BonusSequence2026 => {
  let previousMonth = 0
  let earlierOther = 0n
  let earlierKv = 0n
  let earlierRv = 0n
  let totalGross = 0n
  const prepared: Extract<
    BonusPreparationResult2026,
    { readonly state: 'prepared' }
  >[] = []
  for (const [index, payment] of payments.entries()) {
    if (payment.paymentMonth < previousMonth)
      return {
        state: 'unsupported',
        paymentIndex: index,
        reason: 'payments_not_chronological',
      }
    previousMonth = payment.paymentMonth
    if (
      payment.priorKvPvContributoryPayCents === 'unknown' ||
      payment.priorRvAvContributoryPayCents === 'unknown'
    )
      return {
        state: 'incomplete',
        paymentIndex: index,
        reason: 'contribution_history_required',
      }
    const result = prepareBonus2026({
      ...payment,
      priorOtherRemunerationCents: safe(
        BigInt(payment.priorOtherRemunerationCents) + (historyMode === 'reported_excludes_batch' ? earlierOther : 0n),
      ),
      priorKvPvContributoryPayCents: safe(
        BigInt(payment.priorKvPvContributoryPayCents) + (historyMode === 'reported_excludes_batch' ? earlierKv : 0n),
      ),
      priorRvAvContributoryPayCents: safe(
        BigInt(payment.priorRvAvContributoryPayCents) + (historyMode === 'reported_excludes_batch' ? earlierRv : 0n),
      ),
    })
    if (result.state !== 'prepared')
      return {
        state: result.state,
        paymentIndex: index,
        reason: result.reason,
      }
    prepared.push(result)
    earlierOther += BigInt(result.grossPaymentCents)
    earlierKv += BigInt(result.kvPvLiableCents)
    earlierRv += BigInt(result.rvAvLiableCents)
    totalGross += BigInt(result.grossPaymentCents)
  }
  return {
    state: 'prepared',
    payments: prepared,
    totalGrossCents: safe(totalGross),
  }
}
