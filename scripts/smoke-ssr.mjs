/** Render the real application routes, including lazy pages, without a browser. */
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { renderRoutes } from '../src/seo/routes.js'

const vite = await createServer({ appType: 'custom', logLevel: 'error', optimizeDeps: { noDiscovery: true }, server: { middlewareMode: true } })
try {
  const { render } = await vite.ssrLoadModule('/src/entry-server.jsx')
  for (const route of renderRoutes) {
    const html = await render(route)
    const marker = route === '/book' ? 'store-page' : route.startsWith('/admin') ? 'page-loading' : 'id="site-main"'
    assert.ok(html.includes(marker), `${route} did not render its expected shell`)
    console.log(`PASS ${route}`)
  }
} finally {
  await vite.close()
}
