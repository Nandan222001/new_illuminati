import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DEFAULT_SITE_URL, normalizeSiteUrl } from '../seo/site.js'

const siteOrigin = normalizeSiteUrl(import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL)

export default function ShareLinks({ title, path }) {
  const { t } = useTranslation()
  const [nativeShare, setNativeShare] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showLink, setShowLink] = useState(false)
  const input = useRef(null)
  const url = new URL(path, siteOrigin).href
  const email = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`

  useEffect(() => { setNativeShare(typeof navigator.share === 'function') }, [])
  useEffect(() => {
    if (showLink) { input.current?.focus(); input.current?.select() }
  }, [showLink])

  async function copy() {
    setCopied(false)
    try {
      await navigator.clipboard.writeText(url)
      setShowLink(false)
      setCopied(true)
    } catch {
      setShowLink(true)
    }
  }

  async function share() {
    try {
      await navigator.share({ title, url })
    } catch (error) {
      if (error?.name !== 'AbortError') await copy()
    }
  }

  return (
    <div className="story-share" aria-label={t('editorial.share.label')} role="group">
      {nativeShare
        ? <button type="button" className="editorial-button secondary" onClick={share}>{t('editorial.share.native')}</button>
        : <a className="editorial-button secondary" href={email}>{t('editorial.share.email')}</a>}
      <button type="button" className="editorial-button secondary" onClick={copy}>{t('editorial.share.copy')}</button>
      {copied && <span role="status" className="share-feedback">{t('editorial.share.copied')}</span>}
      {showLink && (
        <label className="share-fallback">
          {t('editorial.share.manual')}
          <input ref={input} readOnly value={url} />
        </label>
      )}
    </div>
  )
}
