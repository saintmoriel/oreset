export function formatRate(minorUnits: number, currency: string) {
  const symbol = currency === 'NGN' ? '₦' : `${currency} `
  return `${symbol}${(minorUnits / 100).toLocaleString()}`
}

export function maskPhone(phone: string) {
  if (phone.length < 6) return phone
  return `${phone.slice(0, 4)} •••• ••${phone.slice(-2)}`
}

export function sameMonth(iso: string, ref: Date) {
  const d = new Date(iso)
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth()
}

export function daysAgo(iso: string) {
  return (Date.now() - new Date(iso).getTime()) / 86_400_000
}

// A real derived stat, not a fabricated one — consecutive calendar days
// (ending today or yesterday) with at least one submission.
export function computeStreak(createdAtDates: string[]): number {
  const days = new Set(createdAtDates.map((d) => new Date(d).toISOString().slice(0, 10)))
  const cursor = new Date()
  const today = cursor.toISOString().slice(0, 10)
  if (!days.has(today)) cursor.setDate(cursor.getDate() - 1)

  let streak = 0
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
