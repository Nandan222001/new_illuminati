import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { addMessage, listThreads, normalizeThread, onThreadsChanged, setThreadStatus, THREAD_STATUS } from '../../api/community'
import ThreadList from '../../components/ThreadList'

/**
 * Council Inbox — every private initiate ⇄ Keeper thread in one place.
 * Only Keepers reach this route (ProtectedRoute adminOnly) and the API only
 * ever returns threads to their author or an admin.
 */
export default function AdminMessages() {
  const { user } = useAuth()
  const toast = useToast()
  const { t } = useTranslation()
  const [threads, setThreads] = useState([])
  const [filter, setFilter] = useState('all')

  const refresh = useCallback(async () => {
    const list = await listThreads({ user, isAdmin: true })
    setThreads(list.map(normalizeThread))
  }, [user])

  useEffect(() => { refresh() }, [refresh])
  useEffect(() => onThreadsChanged(() => { refresh() }), [refresh])

  const visible = useMemo(() => (
    filter === 'all' ? threads : threads.filter((thread) => thread.status === filter)
  ), [threads, filter])

  const reply = async (threadId, body) => {
    await addMessage({ threadId, user, body })
    toast(t('community.replyToast'))
    await refresh()
  }

  const changeStatus = async (threadId, status) => {
    await setThreadStatus({ threadId, status })
    await refresh()
  }

  return (
    <>
      <div className="admin-head">
        <h1>{t('admin.inboxTitle')}</h1>
        <p>{t('admin.inboxHint')}</p>
      </div>

      <div className="admin-toolbar">
        <span className="muted">{t('admin.threadsCount', { count: threads.length })}</span>
        <div className="chips">
          {[['all', t('common.tags.all')], [THREAD_STATUS.OPEN, t('admin.statusOpen')], [THREAD_STATUS.ANSWERED, t('admin.statusAnswered')]].map(([key, label]) => (
            <button key={key} type="button" className={`chip${filter === key ? ' active' : ''}`} onClick={() => setFilter(key)}>{label}</button>
          ))}
        </div>
      </div>

      <section className="admin-card">
        <ThreadList
          threads={visible}
          isAdmin
          onReply={reply}
          onStatus={changeStatus}
          emptyText={t('admin.noThreads')}
        />
      </section>
    </>
  )
}
