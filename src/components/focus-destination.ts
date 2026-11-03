/** Reveal a validation target before moving focus, including grouped errors. */
export function focusDestination(element: HTMLElement | null): void {
  if (element === null) return
  const controls =
    'input:not(:disabled), select:not(:disabled), textarea:not(:disabled), button:not(:disabled), summary, a[href], [tabindex]'
  const target = element.matches(controls)
    ? element
    : element.querySelector<HTMLElement>(controls)
  if (target === null) return
  for (
    let parent = target.parentElement;
    parent;
    parent = parent.parentElement
  ) {
    if (parent instanceof HTMLDetailsElement) parent.open = true
  }
  target.focus()
}
