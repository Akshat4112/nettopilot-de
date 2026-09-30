import { createPagesRedirect } from './pages-routing'

const destination = createPagesRedirect(window.location.href)

window.location.replace(destination.href)
