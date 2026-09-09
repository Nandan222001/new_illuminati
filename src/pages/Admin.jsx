import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROLES } from '../auth/authService'
import { RITUALS, VIDEOS } from '../data/content'
import { useAuth } from '../context/AuthContext'
import { useContent } from '../context/ContentContext'
import { useToast } from '../context/ToastContext'
import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import Img from '../components/Img'

const TABS = [
  { id: 'members', label: 'MEMBERS' },
  { id: 'content', label: 'SEALED CONTENT' },
  { id: 'overview', label: 'OVERVIEW' },
]

export default function Admin() {
  const { user, users, updateRole, removeUser } = useAuth()
  const { locks, setLocked } = useContent()
  const toast = useToast()
  const [tab, setTab] = useState('members')
  const [query, setQuery] = useState('')
  const [confirm, setConfirm] = useState(null)

  const admins = users.filter((u) => u.role === ROLES.ADMIN).length
  const members = users.length - admins
  const sealedCount = Object.values(locks).filter(Boolean).length

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users
      .filter((u) => !q || `${u.name} ${u.email}`.toLowerCase().includes(q))
      .sort((a, b) => (a.role === b.role ? new Date(a.createdAt) - new Date(b.createdAt) : a.role === ROLES.ADMIN ? -1 : 1))
  }, [users, query])

  const act = (fn, okMsg) => {
    try {
      fn()
      toast(okMsg)
    } catch (err) {
      toast(err.message)
    }
  }

  const toggleRole = (u) => act(
    () => updateRole(u.id, u.role === ROLES.ADMIN ? ROLES.MEMBER : ROLES.ADMIN),
    u.role === ROLES.ADMIN ? `${u.name} is now an initiate.` : `${u.name} has been raised to Keeper.`,
  )

  const banish = (u) => {
    act(() => removeUser(u.id), `${u.name} has been banished.`)
    setConfirm(null)
  }

  const contentRows = [
    ...VIDEOS.map((v) => ({ id: v.slug, title: v.title, kind: 'VIDEO', img: v.img, to: `/videos/${v.slug}` })),
    ...RITUALS.map((r) => ({ id: r.slug, title: r.title, kind: 'RITUAL', img: r.img, to: `/rituals#${r.slug}` })),
  ]

  return (
    <>
      <PageHero kicker="KEEPER CONSOLE" title="ADMIN PANEL" sub={`SIGNED IN AS ${user.name.toUpperCase()} · ${user.email}`} image="/assets/community-hero.jpg" compact>
        <div className="stat-row">
          <div className="stat"><b>{users.length}</b><span>ACCOUNTS</span></div>
          <div className="stat"><b>{admins}</b><span>KEEPERS</span></div>
          <div className="stat"><b>{members}</b><span>INITIATES</span></div>
          <div className="stat"><b>{sealedCount}</b><span>SEALED ITEMS</span></div>
        </div>
      </PageHero>

      <section className="page-section admin">
        <div className="tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={`chip${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {tab === 'members' && (
          <>
            <SectionHead
              title="MEMBERS"
              sub={`${list.length} OF ${users.length} ACCOUNTS`}
              right={<div className="filter-bar"><input type="search" placeholder="Search name or email…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search members" /></div>}
            />
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>INITIATE</th><th>EMAIL</th><th>RANK</th><th>JOINED</th><th className="right">ACTIONS</th></tr>
                </thead>
                <tbody>
                  {list.map((u) => {
                    const self = u.id === user.id
                    return (
                      <tr key={u.id} className={self ? 'self' : ''}>
                        <td data-label="INITIATE"><span className={`avatar${u.role === ROLES.ADMIN ? ' admin' : ''}`}>{u.name[0]}</span><b>{u.name}</b>{self && <em className="you">YOU</em>}</td>
                        <td data-label="EMAIL">{u.email}</td>
                        <td data-label="RANK"><em className={`role-pill ${u.role}`}>{u.role === ROLES.ADMIN ? 'KEEPER' : `INITIATE #${String(u.initiate || 0).padStart(3, '0')}`}</em></td>
                        <td data-label="JOINED">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td data-label="ACTIONS" className="right">
                          <div className="row-actions">
                            <button type="button" className="btn-ghost small" disabled={self} onClick={() => toggleRole(u)}>{u.role === ROLES.ADMIN ? 'DEMOTE' : 'PROMOTE'}</button>
                            {confirm === u.id ? (
                              <>
                                <button type="button" className="btn-danger small" onClick={() => banish(u)}>CONFIRM</button>
                                <button type="button" className="btn-ghost small" onClick={() => setConfirm(null)}>CANCEL</button>
                              </>
                            ) : (
                              <button type="button" className="btn-danger small" disabled={self} onClick={() => setConfirm(u.id)}>BANISH</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {list.length === 0 && <tr><td colSpan={5} className="empty">No initiates match that search.</td></tr>}
                </tbody>
              </table>
            </div>
            <p className="muted">Accounts live in this browser&apos;s local storage (demo). Connect a backend to make them global.</p>
          </>
        )}

        {tab === 'content' && (
          <>
            <SectionHead title="SEALED CONTENT" sub="SEALED ITEMS ARE ONLY VISIBLE TO SIGNED-IN INITIATES." />
            <div className="content-grid">
              {contentRows.map((c) => {
                const sealed = !!locks[c.id]
                return (
                  <div className={`content-row${sealed ? ' sealed' : ''}`} key={c.id}>
                    <div className="content-thumb"><Img src={c.img} alt={c.title} /></div>
                    <div className="content-body">
                      <span className="tag fact">{c.kind}</span>
                      <h5>{c.title}</h5>
                      <Link to={c.to} className="sec-link">VIEW ›</Link>
                    </div>
                    <label className="switch">
                      <input type="checkbox" checked={sealed} onChange={(e) => { setLocked(c.id, e.target.checked); toast(`${c.title} ${e.target.checked ? 'sealed' : 'unsealed'}.`) }} />
                      <i /><span>{sealed ? 'SEALED' : 'OPEN'}</span>
                    </label>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {tab === 'overview' && (
          <>
            <SectionHead title="OVERVIEW" sub="HOW THE ROLES WORK." />
            <div className="pillar-grid">
              <article className="pillar"><span className="pillar-icon">▲</span><h3>KEEPER (ADMIN)</h3><p>Full access. Can promote or demote initiates, banish accounts and seal or unseal videos and rituals. The Brotherhood always keeps at least one Keeper.</p></article>
              <article className="pillar"><span className="pillar-icon">◈</span><h3>INITIATE (MEMBER)</h3><p>Signed-in users. Can read sealed rituals, watch sealed episodes, post on the discussion board and edit their own profile.</p></article>
              <article className="pillar"><span className="pillar-icon">◎</span><h3>VISITOR</h3><p>Anyone not signed in. Sees every public page, the countdown, the visuals gallery and open videos, with prompts to register.</p></article>
              <article className="pillar"><span className="pillar-icon">⊘</span><h3>DEMO STORAGE</h3><p>Accounts and locks are persisted in localStorage with salted SHA-256 password hashes. Swap <code>src/auth/authService.js</code> for an API when a backend exists.</p></article>
            </div>
          </>
        )}
      </section>
    </>
  )
}
