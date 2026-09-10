/**
 * Render-every-route smoke test (no browser needed).
 * Builds the app with Vite in SSR mode, then renders each route to a string
 * with a fake localStorage/window so runtime errors surface in CI.
 */
import { build } from 'vite'
import react from '@vitejs/plugin-react'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const routes = ['/', '/archives', '/archives/the-third-eye', '/rituals', '/new-order', '/videos', '/videos/satanic-mythology',
  '/videos/the-last-screening', '/visuals', '/community', '/about', '/login', '/register', '/profile', '/admin',
  '/admin/revenue', '/admin/members', '/admin/videos', '/admin/images', '/admin/rituals', '/admin/settings', '/nope']

const out = join(process.cwd(), 'node_modules', '.cache', 'ib-ssr')
await rm(out, { recursive: true, force: true })
await mkdir(out, { recursive: true })
await writeFile(join(out, 'entry.jsx'), `
import React from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '/src/context/AuthContext'
import { ContentProvider } from '/src/context/ContentContext'
import { ToastProvider } from '/src/context/ToastContext'
import Layout from '/src/components/Layout'
import AdminLayout from '/src/components/AdminLayout'
import ProtectedRoute from '/src/components/ProtectedRoute'
import Home from '/src/pages/Home'
import Archives from '/src/pages/Archives'
import ArchiveDetail from '/src/pages/ArchiveDetail'
import Rituals from '/src/pages/Rituals'
import NewOrder from '/src/pages/NewOrder'
import Videos from '/src/pages/Videos'
import VideoDetail from '/src/pages/VideoDetail'
import Visuals from '/src/pages/Visuals'
import Community from '/src/pages/Community'
import About from '/src/pages/About'
import Login from '/src/pages/Login'
import Register from '/src/pages/Register'
import Profile from '/src/pages/Profile'
import AdminDashboard from '/src/pages/admin/Dashboard'
import AdminRevenue from '/src/pages/admin/Revenue'
import AdminMembers from '/src/pages/admin/Members'
import AdminVideos from '/src/pages/admin/VideosAdmin'
import AdminImages from '/src/pages/admin/ImagesAdmin'
import AdminRituals from '/src/pages/admin/RitualsAdmin'
import AdminSettings from '/src/pages/admin/Settings'
import NotFound from '/src/pages/NotFound'
export function render(url) {
  return renderToString(
    <MemoryRouter initialEntries={[url]}>
      <ToastProvider><AuthProvider><ContentProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/archives" element={<Archives />} />
            <Route path="/archives/:slug" element={<ArchiveDetail />} />
            <Route path="/rituals" element={<Rituals />} />
            <Route path="/new-order" element={<NewOrder />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/videos/:slug" element={<VideoDetail />} />
            <Route path="/visuals" element={<Visuals />} />
            <Route path="/community" element={<Community />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="revenue" element={<AdminRevenue />} />
              <Route path="members" element={<AdminMembers />} />
              <Route path="videos" element={<AdminVideos />} />
              <Route path="images" element={<AdminImages />} />
              <Route path="rituals" element={<AdminRituals />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ContentProvider></AuthProvider></ToastProvider>
    </MemoryRouter>
  )
}
`)

await build({
  root: process.cwd(), logLevel: 'error', plugins: [react()],
  build: { ssr: join(out, 'entry.jsx'), outDir: join(out, 'dist'), emptyOutDir: true, rollupOptions: { external: ['react', 'react-dom', 'react-dom/server', 'react-router-dom'] } },
})

// Minimal browser shims
const store = new Map()
globalThis.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) }
globalThis.window = { addEventListener() {}, removeEventListener() {}, scrollTo() {}, location: { href: 'http://localhost/' } }
globalThis.document = { getElementById: () => null, body: { classList: { toggle() {}, remove() {} } }, addEventListener() {}, removeEventListener() {} }

const { render } = await import(pathToFileURL(join(out, 'dist', 'entry.js')).href)
let failed = 0
for (const r of routes) {
  try {
    const html = render(r)
    const ok = html.includes('class="nav"') || html.includes('page-loading')
    console.log(`${ok ? 'PASS' : 'WARN'} ${r.padEnd(32)} ${html.length} chars`)
    if (!ok) failed++
  } catch (e) {
    failed++
    console.log(`FAIL ${r}\n   ${e.stack?.split('\n').slice(0, 3).join('\n   ')}`)
  }
}
await rm(out, { recursive: true, force: true })
if (failed) { console.error(`${failed} route(s) failed`); process.exit(1) }
console.log('All routes rendered.')
