/**
 * Plays whatever the Keeper linked for a video/ritual station:
 *   • a direct file (.mp4/.webm/.m4v/.ogv) → <video controls>
 *   • a YouTube / Vimeo / Dailymotion page → embedded iframe
 *   • anything else (a hosted player) → iframe
 * Renders nothing when no source is set, so callers can show their own
 * "not linked yet" state.
 */
function toEmbedUrl(url) {
  if (!url) return null
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`
    if (host.endsWith('youtube.com')) {
      if (parsed.pathname.startsWith('/embed/')) return url
      const id = parsed.searchParams.get('v')
      if (id) return `https://www.youtube.com/embed/${id}`
    }
    if (host.endsWith('vimeo.com')) {
      const id = parsed.pathname.split('/').filter(Boolean)[0]
      if (id) return `https://player.vimeo.com/video/${id}`
    }
    if (host.endsWith('dailymotion.com')) {
      const id = parsed.pathname.split('/').filter(Boolean).pop()
      if (id) return `https://www.dailymotion.com/embed/video/${id}`
    }
    return url
  } catch {
    return url
  }
}

export function isDirectVideo(url = '') {
  return /\.(mp4|webm|ogv|m4v|mov)(\?.*)?$/i.test(url)
}

export default function MediaPlayer({ src, title, poster, className = '' }) {
  if (!src) return null
  if (isDirectVideo(src)) {
    return (
      <video className={`media-player ${className}`} src={src} poster={poster || undefined} controls playsInline preload="metadata">
        <track kind="captions" />
      </video>
    )
  }
  return (
    <iframe
      className={`media-player ${className}`}
      src={toEmbedUrl(src)}
      title={title || 'Video'}
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
    />
  )
}
