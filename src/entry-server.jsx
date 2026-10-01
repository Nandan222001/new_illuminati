import React from 'react'
import { PassThrough } from 'node:stream'
import { renderToPipeableStream } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import './i18n/config.js'
import { AppRoutes } from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ConsentProvider } from './context/ConsentContext.jsx'
import { ContentProvider } from './context/ContentContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'

/** Render one route after any lazy page chunk is ready for build-time HTML. */
export function render(url) {
  return new Promise((resolve, reject) => {
    const output = new PassThrough()
    const chunks = []
    let renderer

    output.on('data', (chunk) => chunks.push(chunk))
    output.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    output.on('error', reject)

    try {
      renderer = renderToPipeableStream(
        <StaticRouter location={url}>
          <ToastProvider>
            <ConsentProvider>
              <AuthProvider>
                <ContentProvider>
                  <AppRoutes />
                </ContentProvider>
              </AuthProvider>
            </ConsentProvider>
          </ToastProvider>
        </StaticRouter>,
        {
          onAllReady() {
            renderer.pipe(output)
          },
          onShellError: reject,
          onError: reject,
        },
      )
    } catch (error) {
      reject(error)
    }
  })
}
