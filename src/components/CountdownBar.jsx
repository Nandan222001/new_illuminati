import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getTimeLeft, MEMBERS_JOINED_DISPLAY } from '../data/content'
import { formatGmtClock } from '../utils/validation'

/**
 * Slim strip pinned above the navbar: the membership countdown (and the live
 * GMT clock) sits on the upper row, the joined-members total directly below
 * it. Every published time on the site is GMT.
 */
export default function CountdownBar() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const [timeLeft, setTimeLeft] = useState(null)
  const [clock, setClock] = useState('')

  useEffect(() => {
    const tick = () => {
      setTimeLeft(getTimeLeft())
      setClock(formatGmtClock(new Date()))
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])

  if (pathname === '/rules') return null

  const unit = (value, pad) => (timeLeft ? String(value).padStart(pad, '0') : '—'.repeat(pad))

  return (
    <div className="countdown-bar" role="region" aria-label={t('countdownBar.aria')}>
      <div className="cb-row cb-timer">
        <Link to="/new-order" className="cb-label">
          <span className="cb-dot" aria-hidden="true" />
          {t('countdownBar.countdownLabel')}
        </Link>
        <div className="cb-units">
          <span><b>{unit(timeLeft?.d ?? 0, 3)}</b><em>{t('common.days')}</em></span>
          <span><b>{unit(timeLeft?.h ?? 0, 2)}</b><em>{t('common.hours')}</em></span>
          <span><b>{unit(timeLeft?.m ?? 0, 2)}</b><em>{t('common.minutes')}</em></span>
          <span><b>{unit(timeLeft?.s ?? 0, 2)}</b><em>{t('common.seconds')}</em></span>
        </div>
        <span className="cb-gmt" data-gmt-clock>{clock || '——:——:—— GMT'}</span>
      </div>
      <div className="cb-row cb-members">
        <span className="cb-members-value">{MEMBERS_JOINED_DISPLAY}</span>
        <span className="cb-members-label">{t('countdownBar.membersJoined')}</span>
        <span className="cb-gmt-note">{t('countdownBar.allTimesGmt')}</span>
      </div>
    </div>
  )
}
