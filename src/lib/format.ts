const LOCALE = 'pt-BR'
const EMPTY = '—'

// Datas de calendário chegam como "2026-10-01" ou meia-noite UTC
// ("2026-10-01T00:00:00.000000Z"); lidas como UTC virariam 30/09 no Brasil.
const CALENDAR_DATE = /^(\d{4}-\d{2}-\d{2})(T00:00:00(\.0+)?Z)?$/

export function parseDate(iso: string): Date {
  const m = CALENDAR_DATE.exec(iso)
  return m ? new Date(`${m[1]}T00:00:00`) : new Date(iso)
}

const dateFmt = new Intl.DateTimeFormat(LOCALE, { day: '2-digit', month: '2-digit', year: 'numeric' })
const shortDateFmt = new Intl.DateTimeFormat(LOCALE, { day: '2-digit', month: '2-digit' })

export function formatDate(iso?: string | null): string {
  return iso ? dateFmt.format(parseDate(iso)) : EMPTY
}

export function formatShortDate(iso: string): string {
  return shortDateFmt.format(parseDate(iso))
}

export function formatPeriod(start?: string | null, end?: string | null): string {
  if (start && end) return `${formatDate(start)} – ${formatDate(end)}`
  if (start) return `desde ${formatDate(start)}`
  if (end) return `até ${formatDate(end)}`
  return EMPTY
}

export function formatDuration(minutes?: number | null): string {
  if (minutes == null) return EMPTY
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m}min`
  return m === 0 ? `${h}h` : `${h}h ${m}min`
}

export function formatDistance(km: number): string {
  return `${km.toLocaleString(LOCALE, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`
}

export function formatCalories(kcal: number): string {
  return `${Math.round(kcal).toLocaleString(LOCALE)} kcal`
}

export function formatPoints(points: number): string {
  return points.toLocaleString(LOCALE, { maximumFractionDigits: 1 })
}

export function formatRelative(iso?: string | null, now: Date = new Date()): string {
  if (!iso) return 'nunca'
  const minutes = Math.floor((now.getTime() - new Date(iso).getTime()) / 60_000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `há ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `há ${hours} h`
  const days = Math.floor(hours / 24)
  return days === 1 ? 'há 1 dia' : `há ${days} dias`
}
