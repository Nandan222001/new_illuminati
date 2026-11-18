import { useTranslation } from 'react-i18next'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { SOCIAL_PLATFORMS } from '../utils/social'
import { SOCIAL_ICONS } from './SocialIcons'

/** Only publish channels that have an actual destination in site settings. */
export default function SocialLinks({ className = 'social-row', size = 18, platforms = SOCIAL_PLATFORMS, labels = true }) {
  const { social } = useSiteSettings()
  const { t } = useTranslation()
  const linked = platforms.filter((platform) => social[platform] && SOCIAL_ICONS[platform])
  if (linked.length === 0) return null

  return (
    <div className={className}>
      {linked.map((platform) => {
        const Icon = SOCIAL_ICONS[platform]
        const name = t(`social.${platform}`, { defaultValue: platform })
        return (
          <a key={platform} className={`social-link${labels ? ' with-label' : ''}`} href={social[platform]} target="_blank" rel="noopener noreferrer me" aria-label={name}>
            <Icon width={size} height={size} />
            {labels && <span>{name}</span>}
          </a>
        )
      })}
    </div>
  )
}
