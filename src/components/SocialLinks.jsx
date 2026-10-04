import { useTranslation } from 'react-i18next'
import { useToast } from '../context/ToastContext'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { SOCIAL_PLATFORMS } from '../utils/social'
import { SOCIAL_ICONS } from './SocialIcons'

/**
 * The site's social row. Every link comes from Admin → Settings, opens in a
 * new tab and carries the correct brand logo. Platforms the Keeper has not
 * filled in yet show a "coming soon" toast instead of a dead `#` link.
 */
export default function SocialLinks({ className = 'social-row', size = 18, platforms = SOCIAL_PLATFORMS, labels = true }) {
  const { social } = useSiteSettings()
  const toast = useToast()
  const { t } = useTranslation()

  return (
    <div className={className}>
      {platforms.map((platform) => {
        const Icon = SOCIAL_ICONS[platform]
        const name = t(`social.${platform}`, { defaultValue: platform })
        const href = social[platform]
        if (!Icon) return null

        if (!href) {
          return (
            <button
              key={platform}
              type="button"
              className={`social-link empty${labels ? ' with-label' : ''}`}
              title={t('social.notLinked', { name })}
              aria-label={t('social.notLinked', { name })}
              onClick={() => toast(t('social.comingSoon', { name }))}
            >
              <Icon width={size} height={size} />
              {labels && <span>{name}</span>}
            </button>
          )
        }

        return (
          <a
            key={platform}
            className={`social-link${labels ? ' with-label' : ''}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer me"
            title={`${name} — ${href}`}
            aria-label={name}
          >
            <Icon width={size} height={size} />
            {labels && <span>{name}</span>}
          </a>
        )
      })}
    </div>
  )
}
