/**
 * Real brand marks (inline SVG, currentColor) so the social row shows the
 * correct logo instead of an emoji. Kept dependency-free and SSR-safe.
 */
const base = { viewBox: '0 0 24 24', width: 18, height: 18, 'aria-hidden': 'true', focusable: 'false' }

export function InstagramIcon(props) {
  return (
    <svg {...base} {...props} fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function DiscordIcon(props) {
  return (
    <svg {...base} {...props} fill="currentColor">
      <path d="M19.5 5.6A16 16 0 0 0 15.6 4.4l-.3.6a12 12 0 0 0-6.6 0l-.3-.6A16 16 0 0 0 4.5 5.6C1.9 9.5 1.2 13.3 1.5 17a16.4 16.4 0 0 0 5 2.6l.7-1.2a10 10 0 0 1-1.9-.9l.5-.4a11.3 11.3 0 0 0 10.4 0l.5.4c-.6.4-1.2.7-1.9.9l.7 1.2a16.3 16.3 0 0 0 5-2.6c.4-4.3-.7-8-3-11.4ZM8.6 14.7c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm6.8 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z" />
    </svg>
  )
}

export function TelegramIcon(props) {
  return (
    <svg {...base} {...props} fill="currentColor">
      <path d="M21.3 4.3 18.4 19c-.2 1-.8 1.2-1.6.8l-4.3-3.2-2.1 2c-.2.2-.4.4-.9.4l.3-4.4 8-7.2c.3-.3 0-.5-.5-.2l-9.9 6.2-4.2-1.3c-.9-.3-.9-.9.2-1.3l16.5-6.4c.8-.3 1.5.2 1.4.9Z" />
    </svg>
  )
}

export function YouTubeIcon(props) {
  return (
    <svg {...base} {...props} fill="currentColor">
      <path d="M22.5 8.1a3 3 0 0 0-2.1-2.1C18.6 5.5 12 5.5 12 5.5s-6.6 0-8.4.5A3 3 0 0 0 1.5 8.1C1 9.9 1 12 1 12s0 2.1.5 3.9a3 3 0 0 0 2.1 2.1c1.8.5 8.4.5 8.4.5s6.6 0 8.4-.5a3 3 0 0 0 2.1-2.1c.5-1.8.5-3.9.5-3.9s0-2.1-.5-3.9ZM9.8 15.3V8.7L15.6 12l-5.8 3.3Z" />
    </svg>
  )
}

export function XIcon(props) {
  return (
    <svg {...base} {...props} fill="currentColor">
      <path d="M17.5 3h3.1l-6.8 7.8L21.9 21h-6.1l-4.3-5.6L6.5 21H3.4l7.1-8.1L2.6 3h6.2l4 5.3L17.5 3Zm-1.1 16h1.7L7.2 4.7H5.4L16.4 19Z" />
    </svg>
  )
}

export function FacebookIcon(props) {
  return (
    <svg {...base} {...props} fill="currentColor">
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.7-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z" />
    </svg>
  )
}

export function WhatsAppIcon(props) {
  return (
    <svg {...base} {...props} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.967-.94 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.173.198-.297.297-.495.099-.198.05-.372-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.273.297-1.04 1.016-1.04 2.479s1.065 2.875 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.711.226 1.358.194 1.87.118.57-.085 1.758-.719 2.007-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.002-5.45 4.437-9.885 9.895-9.885 2.64.001 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.894 6.997c-.002 5.45-4.438 9.885-9.895 9.885m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.891c0 2.096.547 4.142 1.588 5.945L.057 24l6.313-1.654a11.882 11.882 0 0 0 5.675 1.448h.005c6.554 0 11.89-5.335 11.893-11.89a11.82 11.82 0 0 0-3.498-8.413Z" />
    </svg>
  )
}

export const SOCIAL_ICONS = {
  instagram: InstagramIcon,
  discord: DiscordIcon,
  telegram: TelegramIcon,
  youtube: YouTubeIcon,
  x: XIcon,
  facebook: FacebookIcon,
  whatsapp: WhatsAppIcon,
}

export default SOCIAL_ICONS
