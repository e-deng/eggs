// Shared helper for detecting when a Supabase request failed because the
// database itself is unreachable (most commonly: a free-tier project that
// has auto-paused from inactivity) rather than a normal query error (e.g.
// validation, "no rows found", etc). supabase-js generally resolves with
// `{ data: null, error }` instead of throwing, so this checks the shape of
// that error object for signs of a network/connectivity failure.
export function isDatabaseUnavailableError(error) {
  if (!error) return false

  const message = String(error.message || error).toLowerCase()

  return (
    message.includes('failed to fetch') ||
    message.includes('networkerror') ||
    message.includes('network request failed') ||
    message.includes('err_name_not_resolved') ||
    message.includes('err_internet_disconnected') ||
    message.includes('load failed') ||
    message.includes('is not valid json') ||
    message.includes('unexpected token') ||
    message.includes('timed out') ||
    message.includes('timeout')
  )
}

export const DATABASE_UNAVAILABLE_MESSAGE =
  "We're having trouble connecting to the database right now. Please try again in a moment. If this message persists, please let the site administrator know."
