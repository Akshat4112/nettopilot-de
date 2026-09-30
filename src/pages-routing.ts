export const PAGES_BASE_PATH = '/nettopilot-de/'

const ROUTE_QUERY_PARAMETER = '__route'

function toUrl(value: URL | string): URL {
  return value instanceof URL ? value : new URL(value)
}

export function createPagesRedirect(currentLocation: URL | string): URL {
  const currentUrl = toUrl(currentLocation)
  const destination = new URL(PAGES_BASE_PATH, currentUrl.origin)

  if (!currentUrl.pathname.startsWith(PAGES_BASE_PATH)) {
    return destination
  }

  const requestedRoute =
    currentUrl.pathname + currentUrl.search + currentUrl.hash
  destination.searchParams.set(ROUTE_QUERY_PARAMETER, requestedRoute)

  return destination
}

export function restorePagesRoute(entryLocation: URL | string): URL | null {
  const entryUrl = toUrl(entryLocation)
  const requestedRoute = entryUrl.searchParams.get(ROUTE_QUERY_PARAMETER)

  if (!requestedRoute) {
    return null
  }

  const restoredUrl = new URL(requestedRoute, entryUrl.origin)
  const isSafeProjectRoute =
    restoredUrl.origin === entryUrl.origin &&
    restoredUrl.pathname.startsWith(PAGES_BASE_PATH)

  return isSafeProjectRoute ? restoredUrl : null
}
