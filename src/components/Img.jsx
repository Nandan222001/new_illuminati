import { useState } from 'react'

export default function Img({ src, alt, className = '', eager = false }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <>
      {!loaded && <div className="skeleton" />}
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        className={`${className} img-fade${loaded ? ' loaded' : ''}`}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />
    </>
  )
}
