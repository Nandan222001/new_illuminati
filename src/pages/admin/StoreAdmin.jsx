import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../../context/ContentContext'
import { useToast } from '../../context/ToastContext'
import { fetchStoreListing, saveStoreListing } from '../../api/store'
import { isStoredEbook } from '../../api/library'

const EMPTY = { book_id: '', price: '', active: false, cta_label: '' }

/**
 * Admin → Book Sale — the whole configuration of the /book page.
 *
 * The public page is one card selling one volume: pick the shelved e-book, set
 * its price and switch the page on. The book itself (cover, PDF, description)
 * is added from Admin → E-Books, so this page never duplicates that form.
 */
export default function AdminStore() {
  const { books } = useContent()
  const toast = useToast()
  const [form, setForm] = useState(EMPTY)
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await fetchStoreListing()
      setListing(data)
      setForm({
        book_id: data.book_id === null || data.book_id === undefined ? '' : String(data.book_id),
        price: data.price ? String(data.price) : '',
        active: !!data.active,
        cta_label: data.cta_label || '',
      })
    } catch (err) {
      toast(err.message)
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  // Only server-side volumes can be sold: a locally staged book has no id yet.
  const sellable = books.filter((b) => typeof b.id === 'number' || /^\d+$/.test(String(b.id)))
  const chosen = sellable.find((b) => String(b.id) === String(form.book_id))
  const price = Number(form.price)
  const valid = !!form.book_id && Number.isFinite(price) && price >= 1 && price <= 500000

  const submit = async (e) => {
    e.preventDefault()
    if (!valid) { toast('Choose a book and a price between ₹1 and ₹5,00,000.'); return }
    setBusy(true)
    try {
      const saved = await saveStoreListing({
        book_id: Number(form.book_id),
        price: Math.round(price),
        active: !!form.active,
        cta_label: form.cta_label.trim() || null,
      })
      setListing(saved)
      toast(form.active
        ? `“${chosen?.title || 'The book'}” is now on sale for ₹${Math.round(price).toLocaleString('en-IN')} on /book.`
        : 'Saved. The /book page is switched off, so it shows nothing for now.')
    } catch (err) {
      toast(err.message)
    } finally {
      setBusy(false)
    }
  }

  const bookHasFile = chosen ? (isStoredEbook(chosen) || !!chosen.file || !!chosen.has_file) : false

  return (
    <>
      <div className="admin-head">
        <h1>BOOK SALE</h1>
        <p>
          The standalone page <a href="/book" target="_blank" rel="noreferrer"><b>/book</b></a> sells exactly one volume — no header, no footer, one card.
          Choose the book, set its price, switch it on.
        </p>
      </div>

      {listing && !listing.payments_configured && (
        <p className="form-error">
          Razorpay is not configured yet — buyers cannot pay. Add the keys under{' '}
          <Link to="/admin/settings">Settings → Razorpay</Link> first.
        </p>
      )}

      <section className="admin-card">
        <h3>WHAT /BOOK SELLS</h3>
        {loading ? (
          <p className="muted">Loading the current listing…</p>
        ) : (
          <form className="form" onSubmit={submit}>
            <label>
              <span>THE BOOK (added under Admin → E-Books)</span>
              <select value={form.book_id} onChange={(e) => setForm({ ...form, book_id: e.target.value })}>
                <option value="">— choose a volume —</option>
                {sellable.map((b) => (
                  <option key={b.id} value={b.id}>{b.title}{isStoredEbook(b) || b.file || b.has_file ? '' : ' (no file attached)'}</option>
                ))}
              </select>
              {!sellable.length && (
                <em className="field-hint provider-note">
                  No e-books on the shelf yet — <Link to="/admin/books">shelve one first</Link>.
                </em>
              )}
            </label>

            <div className="form-row">
              <label>
                <span>PRICE (₹)</span>
                <input
                  type="number"
                  min="1"
                  max="500000"
                  step="1"
                  placeholder="499"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </label>
              <label>
                <span>BUTTON LABEL (optional)</span>
                <input
                  type="text"
                  maxLength={80}
                  placeholder="Buy now"
                  value={form.cta_label}
                  onChange={(e) => setForm({ ...form, cta_label: e.target.value })}
                />
              </label>
            </div>

            <label className="switch" style={{ flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              <i aria-hidden="true" />
              <span style={{ letterSpacing: '2px' }}>{form.active ? 'PAGE LIVE' : 'PAGE HIDDEN'}</span>
            </label>

            {chosen && !bookHasFile && (
              <p className="form-error">
                “{chosen.title}” has no PDF attached, so a buyer could pay but not receive a file.{' '}
                <Link to="/admin/books">Attach the volume</Link> or leave the page switched off.
              </p>
            )}

            <button type="submit" className="btn-gold" disabled={busy || !valid}>
              {busy ? 'SAVING…' : 'SAVE THE SALE PAGE'}
            </button>
            <p className="muted small-note">
              Buyers pay through Razorpay and get an instant download link — no account and no membership involved.
              Every sale is listed under <Link to="/admin/revenue">Revenue</Link>.
            </p>
          </form>
        )}
      </section>

      <section className="admin-card">
        <h3>LIVE PREVIEW</h3>
        {listing?.book ? (
          <ul className="mini-list">
            <li><span>Book</span><b>{listing.book.title}</b></li>
            <li><span>Price</span><b>₹{Number(listing.price || 0).toLocaleString('en-IN')}</b></li>
            <li><span>File</span><b>{listing.book.has_file ? (listing.book.file_name || 'attached') : 'none attached'}</b></li>
            <li><span>Page</span><b>{listing.active ? 'live at /book' : 'hidden'}</b></li>
          </ul>
        ) : (
          <p className="muted">Nothing is on sale yet. Choose a book above and save.</p>
        )}
        <p className="muted small-note" style={{ marginTop: '10px' }}>
          <a href="/book" target="_blank" rel="noreferrer">Open /book in a new tab ↗</a>
        </p>
      </section>
    </>
  )
}
