import { useMemo, useState } from 'react'
import { ROLES } from '../../auth/authService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function AdminMembers() {
  const { user, users, updateRole, removeUser } = useAuth()
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [confirm, setConfirm] = useState(null)

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users
      .filter((u) => !q || `${u.name} ${u.email}`.toLowerCase().includes(q))
      .sort((a, b) => (a.role === b.role ? new Date(a.createdAt) - new Date(b.createdAt) : a.role === ROLES.ADMIN ? -1 : 1))
  }, [users, query])

  const act = async (fn, okMsg) => {
    try {
      await fn()
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

  return (
    <>
      <div className="admin-head">
        <h1>MEMBERS</h1>
        <p>{list.length} of {users.length} accounts registered.</p>
      </div>

      <div className="admin-toolbar">
        <div className="filter-bar">
          <input type="search" placeholder="Search name or email…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search members" />
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>INITIATE</th><th>EMAIL</th><th>RANK</th><th>MEMBERSHIP</th><th>JOINED</th><th className="right">ACTIONS</th></tr>
          </thead>
          <tbody>
            {list.map((u) => {
              const self = u.id === user.id
              return (
                <tr key={u.id} className={self ? 'self' : ''}>
                  <td data-label="INITIATE"><span className={`avatar${u.role === ROLES.ADMIN ? ' admin' : ''}`}>{u.name[0]}</span><b>{u.name}</b>{self && <em className="you">YOU</em>}</td>
                  <td data-label="EMAIL">{u.email}</td>
                  <td data-label="RANK"><em className={`role-pill ${u.role}`}>{u.role === ROLES.ADMIN ? 'KEEPER' : `INITIATE #${String(u.initiate || 0).padStart(3, '0')}`}</em></td>
                  <td data-label="MEMBERSHIP">{u.paid ? <em className="status-pill paid">◈ SEALED · {u.sealId}</em> : <em className="status-pill">UNSEALED</em>}</td>
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
            {list.length === 0 && <tr><td colSpan={6} className="empty">No initiates match that search.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="muted">Accounts are stored in the database and shared across every browser and device.</p>
    </>
  )
}
