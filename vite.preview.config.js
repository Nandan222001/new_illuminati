import { defineConfig, mergeConfig } from 'vite'
import baseConfig from './vite.config.js'
import { CARDS, VIDEOS } from './src/data/content.js'

const staticRoutes = new Set([
  '/',
  '/archives',
  '/rituals',
  '/new-order',
  '/videos',
  '/visuals',
  '/community',
  '/about',
  '/rules',
  '/login',
  '/register',
  '/profile',
  '/admin',
  '/admin/revenue',
  '/admin/members',
  '/admin/videos',
  '/admin/images',
  '/admin/rituals',
  '/admin/settings',
  ...CARDS.map((card) => `/archives/${card.slug}`),
  ...VIDEOS.map((video) => `/videos/${video.slug}`),
])

const prerenderedRoutePreview = {
  name: 'prerendered-route-preview',
  configurePreviewServer(server) {
    server.middlewares.use((request, _response, next) => {
      if (!request.url || !['GET', 'HEAD'].includes(request.method || 'GET')) return next()
      const queryIndex = request.url.indexOf('?')
      const pathname = (queryIndex < 0 ? request.url : request.url.slice(0, queryIndex)).replace(/\/+$/, '') || '/'
      const isKnownDynamicPage = /^\/(archives|videos)\/[^/]+$/.test(pathname)
      if (staticRoutes.has(pathname) || isKnownDynamicPage) {
        const query = queryIndex < 0 ? '' : request.url.slice(queryIndex)
        request.url = `${pathname === '/' ? '' : pathname}/index.html${query}`
      }
      next()
    })
  },
}

// Serve the generated per-route HTML during preview instead of falling back to
// the root document, so local checks reflect the SEO files shipped to Vercel.
export default mergeConfig(baseConfig, defineConfig({
  appType: 'mpa',
  plugins: [prerenderedRoutePreview],
}))
