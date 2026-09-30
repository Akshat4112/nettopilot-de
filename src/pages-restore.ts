import { restorePagesRoute } from './pages-routing'

const restoredRoute = restorePagesRoute(window.location.href)

if (restoredRoute) {
  window.history.replaceState(
    null,
    '',
    `${restoredRoute.pathname}${restoredRoute.search}${restoredRoute.hash}`,
  )
}
