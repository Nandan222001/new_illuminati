import { apiFetch } from './client'

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

let loader = null

/** Loads Razorpay Checkout once; resolves with the global constructor. */
export function loadRazorpay() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Checkout needs a browser.'))
  if (window.Razorpay) return Promise.resolve(window.Razorpay)
  if (!loader) {
    loader = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = CHECKOUT_SRC
      script.async = true
      script.onload = () => (window.Razorpay ? resolve(window.Razorpay) : reject(new Error('Razorpay failed to load.')))
      script.onerror = () => { loader = null; reject(new Error('Could not load the payment window. Check your connection and try again.')) }
      document.head.appendChild(script)
    })
  }
  return loader
}

export const createOrder = () => apiFetch('/payments/order', { method: 'POST' })
export const verifyPayment = (body) => apiFetch('/payments/verify', { method: 'POST', body })
