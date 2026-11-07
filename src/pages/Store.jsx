import { useCallback, useEffect, useRef, useState } from 'react'
import { createStoreOrder, fetchStoreBook, storeDownloadUrl, verifyStorePayment } from '../api/store'
import { loadRazorpay } from '../api/payments'
import './Store.css'

/**
 * The one-book sale page.
 *
 * Deliberately the whole page: no header, no footer, no navigation, no consent
 * gate — one card, one volume, one price. The Keeper chooses the book and its
 * price from **Admin → Book Sale**; nothing on this page is hard-coded.
 *
 * Paying needs no account: Checkout collects the buyer's details, the server
 * verifies the signature and returns a short-lived download link.
 */

const inr = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`

export default function Store() {
  const [book, setBook] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  // idle | starting | checkout | confirming | paid
  const [stage, setStage] = useState('idle')
  const [failure, setFailure] = useState('')
  const [receipt, setReceipt] = useState(null)
  const stageRef = useRef('idle')
  const pendingRef = useRef(null)
  const setStageBoth = (next) => { stageRef.current = next; setStage(next) }

  useEffect(() => {
    let alive = true
    fetchStoreBook()
      .then((data) => { if (alive) setBook(data) })
      .catch((err) => { if (alive) setError(err.message || 'No book is on sale right now.') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  // The card is the only thing on the page, so let it own the tab title too.
  useEffect(() => {
    if (book?.title) document.title = `${book.title} | Illuminati Brotherhood`
  }, [book?.title])

  const confirm = useCallback(async (response) => {
    setStageBoth('confirming')
    setFailure('')
    try {
      const result = await verifyStorePayment(response)
      setReceipt(result)
      setStageBoth('paid')
      return true
    } catch (err) {
      // The money moved but our check failed; keep the response so it can retry.
      pendingRef.current = response
      setFailure(err.message || 'Payment received, but the download is not ready yet. Try again.')
      setStageBoth('idle')
      return false
    }
  }, [])

  const buy = useCallback(async () => {
    if (!book) return
    setFailure('')
    setStageBoth('starting')
    try {
      const [Razorpay, order] = await Promise.all([loadRazorpay(), createStoreOrder()])
      const rzp = new Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: 'ILLUMINATI BROTHERHOOD',
        description: book.title,
        image: book.image_url ? new URL(book.image_url, window.location.origin).href : undefined,
        theme: { color: '#b8892f', backdrop_color: '#050203' },
        modal: {
          escape: true,
          ondismiss: () => { if (stageRef.current === 'checkout') setStageBoth('idle') },
        },
        handler: (response) => { confirm(response) },
      })
      rzp.on('payment.failed', (res) => {
        setFailure(res?.error?.description || 'The payment failed. You have not been charged twice — try again.')
        setStageBoth('idle')
      })
      setStageBoth('checkout')
      rzp.open()
    } catch (err) {
      setFailure(err.message || 'Could not start the payment. Please try again.')
      setStageBoth('idle')
    }
  }, [book, confirm])

  if (loading) {
    return (
      <div className="store-page">
        <div className="store-card store-card-loading" aria-busy="true">
          <div className="store-cover store-cover-empty" aria-hidden="true" />
          <div className="store-body">
            <span className="store-bar" />
            <span className="store-bar short" />
            <span className="store-bar tiny" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !book) {
    return (
      <div className="store-page">
        <div className="store-card store-card-empty-state">
          <div className="store-body">
            <h1 className="store-title">Nothing here yet</h1>
            <p className="store-desc">{error || 'No book is on sale right now.'}</p>
          </div>
        </div>
      </div>
    )
  }

  const paid = stage === 'paid'
  const busy = stage === 'starting' || stage === 'confirming'
  const meta = [book.format ? String(book.format).toUpperCase() : null, book.pages ? `${book.pages} pages` : null].filter(Boolean)

  return (
    <div className="store-page">
      <div className={`store-card${paid ? ' is-paid' : ''}`}>
        {book.image_url ? (
          <div className="store-cover">
            <img src={book.image_url} alt={`Cover of ${book.title}`} />
          </div>
        ) : (
          <div className="store-cover store-cover-empty" aria-hidden="true">
            <span>{book.title.slice(0, 1)}</span>
          </div>
        )}

        <div className="store-body">
          {paid ? (
            <>
              <p className="store-eyebrow">Payment received</p>
              <h1 className="store-title">{receipt?.title || book.title}</h1>
              <p className="store-desc">Thank you. Your copy is ready — the download link below stays open for 24 hours.</p>
              {receipt?.download_url ? (
                <a className="store-buy" href={storeDownloadUrl(receipt.download_url)} rel="noopener">
                  {receipt.file_name || 'Download your book'}
                </a>
              ) : (
                <p className="store-note">We could not find a file for this volume. Contact the publisher for your copy.</p>
              )}
            </>
          ) : (
            <>
              <h1 className="store-title">{book.title}</h1>
              {book.description ? <p className="store-desc">{book.description}</p> : null}
              {meta.length ? <p className="store-meta">{meta.join(' · ')}</p> : null}
              <p className="store-price">
                <span>{inr(book.price)}</span>
                {book.file_name ? <small>instant download</small> : null}
              </p>
              <button type="button" className="store-buy" onClick={buy} disabled={busy}>
                {stage === 'starting' ? 'Opening…' : stage === 'confirming' ? 'Confirming…' : (book.cta_label || `Buy now — ${inr(book.price)}`)}
              </button>
              {failure ? <p className="store-error" role="alert">{failure}</p> : null}
              {pendingRef.current ? (
                <button type="button" className="store-retry" onClick={() => confirm(pendingRef.current)}>
                  Retry download
                </button>
              ) : null}
              <p className="store-note">Secure payment by Razorpay · UPI, cards &amp; netbanking</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
