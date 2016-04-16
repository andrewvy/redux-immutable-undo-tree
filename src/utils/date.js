// Poly-fill for Date.now()
export function dateNow() {
  if (!Date.now) {
    return new Date().getTime()
  } else {
    return Date.now()
  }
}

// Normalizes date delta in milliseconds
export function normalizeDate(amount, type) {
  const dateTypes = {
    'seconds': 1000,
    'minutes': 60 * 1000,
    'hours': 60 * 60 * 1000,
    'days': 24 * 60 * 60 * 1000
  }

  if (!dateTypes[type]) return 0
  if (amount <= 0) return 0

  return amount * dateTypes[type]
}

// Sees if B (A < B < A + diff) when diff >= 0
// or if B (A + diff < B < A) when diff < 0
export function isWithin(a, b, diff) {
  if (diff > 0) {
    return a <= b && b <= (a + diff)
  } else {
    return (a + diff) <= b && b <= a
  }
}
