export const convertDateToISO8601Format = (date: Date): string => {
  const y = date.getFullYear()
  const m = ('0' + (date.getMonth() + 1)).slice(-2)
  const d = ('0' + date.getDay()).slice(-2)
  return `${y}-${m}-${d}`
}
