import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

const projectOrigin = 'https://akshat4112.github.io'
const basePath = '/nettopilot-de/'
const deepPath = '/nettopilot-de/offers/compare'

const indexHtml = await readFile('dist/index.html', 'utf8')
const notFoundHtml = await readFile('dist/404.html', 'utf8')

assert.match(
  indexHtml,
  /(?:src|href)="\/nettopilot-de\/assets\/[^"]+"/,
  'Built assets must use the GitHub Pages project base path.',
)
assert.match(
  notFoundHtml,
  /(?:src|href)="\/nettopilot-de\/assets\/[^"]+"/,
  'The fallback page must load its redirect bundle from the project path.',
)

const routingAssetMatch = notFoundHtml.match(
  /href="\/nettopilot-de\/(assets\/pages-routing-[^"]+\.js)"/,
)
assert.ok(routingAssetMatch, 'The fallback page must preload the routing bundle.')

const routingModule = await import(
  pathToFileURL(`dist/${routingAssetMatch[1]}`).href
)
const routingFunctions = Object.values(routingModule).filter(
  (value) => typeof value === 'function',
)
assert.equal(routingFunctions.length, 2, 'The routing bundle must expose two helpers.')

const requestedUrl = new URL(
  `${deepPath}?lang=en#summary`,
  projectOrigin,
)
const redirectResults = routingFunctions.map((routingFunction) =>
  routingFunction(requestedUrl),
)
const redirectedUrl = redirectResults.find((result) => result instanceof URL)
const createPagesRedirect = routingFunctions[redirectResults.indexOf(redirectedUrl)]
const restorePagesRoute = routingFunctions.find(
  (routingFunction) => routingFunction !== createPagesRedirect,
)

assert.ok(redirectedUrl)
assert.ok(restorePagesRoute)

assert.equal(redirectedUrl.pathname, basePath)
assert.equal(
  redirectedUrl.searchParams.get('__route'),
  `${deepPath}?lang=en#summary`,
)

const restoredUrl = restorePagesRoute(redirectedUrl)

assert.ok(restoredUrl)
assert.equal(restoredUrl.pathname, deepPath)
assert.equal(restoredUrl.search, '?lang=en')
assert.equal(restoredUrl.hash, '#summary')
assert.equal(
  restorePagesRoute(
    new URL('/nettopilot-de/?__route=https://example.com/', projectOrigin),
  ),
  null,
  'Route restoration must reject another origin.',
)

console.log(
  'GitHub Pages verification passed: base assets and deep-link refresh routing are valid.',
)
