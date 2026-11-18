import { defineConfig, mergeConfig } from 'vite'
import { createReadStream } from 'node:fs'
import { join } from 'node:path'
import baseConfig from './vite.config.js'
import { CATALOGUE_FALLBACK, documentFile, isCatalogueDetailPath, renderRoutes } from './src/seo/routes.js'

const staticRoutes = new Set(renderRoutes.filter((route) => route !== '/__not-found'))
const aliases = new Map([
  ['/home', '/'], ['/symbols', '/visuals'], ['/countdown', '/new-order'],
  ['/new-world-order', '/new-order'], ['/library', '/archives#library'],
])

const prerenderedRoutePreview = {
  name: 'prerendered-route-preview',
  configurePreviewServer(server) {
    server.middlewares.use((request, response, next) => {
      if (!request.url || !['GET', 'HEAD'].includes(request.method || 'GET')) return next()
      const queryIndex = request.url.indexOf('?')
      const query = queryIndex < 0 ? '' : request.url.slice(queryIndex)
      const pathname = (queryIndex < 0 ? request.url : request.url.slice(0, queryIndex)).replace(/\/+$/, '') || '/'
      if (aliases.has(pathname)) {
        const [location, hash] = aliases.get(pathname).split('#')
        response.writeHead(308, { Location: `${location}${query}${hash ? `#${hash}` : ''}` }).end()
        return
      }
      if (staticRoutes.has(pathname) || isCatalogueDetailPath(pathname)) {
        const file = staticRoutes.has(pathname) ? documentFile(pathname) : CATALOGUE_FALLBACK
        request.url = `/${file}${query}`
        return next()
      }
      if (!request.headers.accept?.includes('text/html') || pathname.startsWith('/api/') || /\.[^/]+$/.test(pathname)) return next()
      response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
      if (request.method === 'HEAD') return response.end()
      createReadStream(join(server.config.root, server.config.build.outDir, '404.html')).on('error', () => response.end()).pipe(response)
    })
  },
}

export default mergeConfig(baseConfig, defineConfig({
  appType: 'mpa',
  plugins: [prerenderedRoutePreview],
}))
