import { screen } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'

/** Open the same native disclosures a user needs before editing optional terms. */
export async function openOfferCategories(
  user: UserEvent,
  ...categories: readonly string[]
): Promise<void> {
  for (const category of categories) {
    const title = screen.getByText(category, { selector: 'summary h3' })
    if (!title.closest('details')?.open) await user.click(title)
  }
}
