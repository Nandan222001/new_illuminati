import { useTranslation } from 'react-i18next'
import { THREAD_STATUS } from '../api/community'

/** Thread timestamps are published in GMT, like every other time on the site. */
function when(value, fallback) {
  if (!value) return fallback
  try {
    const date = new Date(value)
    const day = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
    const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' })
    return `${day} · ${time} GMT`
  } catch {
    return fallback
  }
}

/**
 * Renders a set of private threads (initiate ⇄ Keepers). Each thread shows its
 * full one-to-one history and a reply box. Kept in one place so the public
 * Community page and the admin Council Inbox render identically.
 */
export default function ThreadList({ threads, isAdmin, onReply, onStatus, emptyText }) {
  const { t } = useTranslation()

  if (!threads.length) return <p className="empty">{emptyText || t('admin.noThreads')}</p>

  return (
    <ul className="thread-list">
      {threads.map((thread) => (
        <li className={`thread${thread.status === THREAD_STATUS.ANSWERED ? ' answered' : ''}`} key={thread.id}>
          <div className="thread-head">
            <div>
              <span className="thread-private">🔒 {t('community.privateThread')}</span>
              <h4>{thread.subject || (isAdmin ? t('admin.threadFrom', { name: thread.userName }) : t('community.newThread'))}</h4>
              <p className="thread-meta">
                {isAdmin ? `${t('admin.threadFrom', { name: thread.userName })}${thread.userEmail ? ` · ${thread.userEmail}` : ''}` : when(thread.createdAt, t('community.justNow'))}
                {' · '}{t('admin.threadMeta', { count: thread.messages.length, when: when(thread.updatedAt || thread.createdAt, t('community.justNow')) })}
              </p>
            </div>
            <span className={`thread-status ${thread.status}`}>
              {thread.status === THREAD_STATUS.ANSWERED ? t('community.statusAnswered') : t('community.statusOpen')}
            </span>
          </div>

          <ol className="thread-messages">
            {thread.messages.map((m) => (
              <li className={`msg ${m.role === 'admin' ? 'from-keeper' : 'from-initiate'}`} key={m.id}>
                <div className="msg-head">
                  <b>{m.author}</b>
                  <em>{m.role === 'admin' ? t('community.keeper') : t('community.you')}</em>
                  <span>{when(m.at, t('community.justNow'))}</span>
                </div>
                <p>{m.body}</p>
              </li>
            ))}
          </ol>

          <form
            className="thread-reply"
            onSubmit={(e) => {
              e.preventDefault()
              const input = e.target.elements.reply
              const body = input.value.trim()
              if (!body) return
              input.value = ''
              onReply(thread.id, body)
            }}
          >
            <textarea name="reply" rows={2} maxLength={1000} placeholder={isAdmin ? t('admin.replyAsKeeper') : t('community.replyPlaceholder')} />
            <div className="thread-reply-foot">
              {isAdmin && onStatus && (
                <button
                  type="button"
                  className="btn-ghost small"
                  onClick={() => onStatus(thread.id, thread.status === THREAD_STATUS.ANSWERED ? THREAD_STATUS.OPEN : THREAD_STATUS.ANSWERED)}
                >
                  {thread.status === THREAD_STATUS.ANSWERED ? t('admin.reopen') : t('admin.resolve')}
                </button>
              )}
              <button type="submit" className="btn-gold small">{t('community.reply')}</button>
            </div>
          </form>
        </li>
      ))}
    </ul>
  )
}
