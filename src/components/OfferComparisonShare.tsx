import { useState } from 'react'
import type { OfferComparisonMetrics } from './offer-comparison-metrics'
import { formatOfferComparisonShareText } from './offer-comparison-share'

/**
 * User-triggered sharing only. Never place private results in URLs, storage,
 * analytics, printing or an automatic outbound request.
 */
export function OfferComparisonShare({
  metrics,
}: {
  readonly metrics: OfferComparisonMetrics
}) {
  const text = formatOfferComparisonShareText(metrics)
  const [approvedText, setApprovedText] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{
    readonly text: string
    readonly message: string
  } | null>(null)
  const approved = approvedText === text
  const copy = async (): Promise<void> => {
    if (!approved || navigator.clipboard?.writeText === undefined) {
      setFeedback({
        text,
        message: 'Clipboard unavailable. You can download the text instead.',
      })
      return
    }
    try {
      await navigator.clipboard.writeText(text)
      setFeedback({ text, message: 'Current comparison copied as text.' })
    } catch {
      setFeedback({
        text,
        message: 'Clipboard permission was denied. Use Download instead.',
      })
    }
  }
  const download = (): void => {
    if (!approved) return
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    try {
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'nettopilot-offer-comparison-2026.txt'
      document.body.append(anchor)
      anchor.click()
      anchor.remove()
      setFeedback({
        text,
        message: 'Comparison text download requested on this device.',
      })
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  return (
    <section className="offer-comparison-share" aria-label="Share comparison">
      <h4>Share or save this comparison</h4>
      <p id="offer-share-warning">
        This report contains salary and compensation figures. Copying or
        downloading it may disclose those values to anyone you send it to.
        Nothing is uploaded, saved by NettoPilot, or placed into a URL. It
        includes current comparison results only, not your date of birth, tax
        class, or health-insurance settings.
      </p>
      <label className="offer-share-consent">
        <input
          type="checkbox"
          checked={approved}
          onChange={(event) => {
            setApprovedText(event.target.checked ? text : null)
            setFeedback(null)
          }}
          aria-describedby="offer-share-warning"
        />
        I understand this export contains private compensation figures.
      </label>
      <div className="offer-actions">
        <button
          type="button"
          className="np-button-secondary"
          disabled={!approved}
          onClick={() => {
            void copy()
          }}
        >
          Copy comparison as text
        </button>
        <button
          type="button"
          className="np-button-secondary"
          disabled={!approved}
          onClick={download}
        >
          Download comparison (.txt)
        </button>
      </div>
      {feedback?.text === text && <p role="status">{feedback.message}</p>}
    </section>
  )
}
