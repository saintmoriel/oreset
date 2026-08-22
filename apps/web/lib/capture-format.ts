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
