const REFERRAL_KEY = 'mindmint:referral'
const SHARE_UNLOCK_KEY = 'mindmint:share_unlock'
const REF_VISIT_KEY = 'mindmint:ref_visit'

function generateCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export function getReferralCode(): string {
  if (typeof window === 'undefined') return 'MINT00'
  const existing = window.localStorage.getItem(REFERRAL_KEY)
  if (existing) return existing
  const next = generateCode()
  window.localStorage.setItem(REFERRAL_KEY, next)
  return next
}

export function setReferralVisit(ref: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(REF_VISIT_KEY, ref)
}

export function getReferralVisit() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(REF_VISIT_KEY)
}

export function setShareUnlock() {
  if (typeof window === 'undefined') return
  // TODO: replace localStorage unlock with backend-backed entitlement.
  window.localStorage.setItem(SHARE_UNLOCK_KEY, 'true')
}

export function getShareUnlock(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(SHARE_UNLOCK_KEY) === 'true'
}

export function clearShareUnlock() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(SHARE_UNLOCK_KEY)
}
