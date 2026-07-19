export function hasPremiumAccess(profile) {
  if (!profile) return false

  const now = new Date()

  if (profile.trial_ends_at && new Date(profile.trial_ends_at) > now) {
    return true
  }

  if (profile.subscribed_until && new Date(profile.subscribed_until) > now) {
    return true
  }

  return false
}

export function premiumStatusLabel(profile) {
  if (!profile) return ''

  const now = new Date()
  const trialEnds = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null
  const subEnds = profile.subscribed_until ? new Date(profile.subscribed_until) : null

  if (subEnds && subEnds > now) {
    const days = Math.ceil((subEnds - now) / (1000 * 60 * 60 * 24))
    return `Premium — renews in ${days}d`
  }

  if (trialEnds && trialEnds > now) {
    const days = Math.ceil((trialEnds - now) / (1000 * 60 * 60 * 24))
    return `Free trial — ${days}d left`
  }

  return 'Free plan'
}
