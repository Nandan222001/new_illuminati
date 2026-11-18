import { useTranslation } from 'react-i18next'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { socialHandle } from '../utils/social'
import { SOCIAL_ICONS } from './SocialIcons'

export default function InstagramFollow() {
  const { t } = useTranslation()
  const { social } = useSiteSettings()
  const Instagram = SOCIAL_ICONS.instagram
  if (!social.instagram) return null

  return (
    <aside className="instagram-follow">
      <Instagram width={24} height={24} />
      <div><h2>{t('editorial.instagram')}</h2><p>{socialHandle(social.instagram)}</p></div>
      <a className="editorial-button secondary" href={social.instagram} target="_blank" rel="noopener noreferrer me">
        {t('editorial.viewProfile')} <span aria-hidden="true">↗</span>
      </a>
    </aside>
  )
}
