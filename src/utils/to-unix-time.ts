/**
 * Convert Date to Unix timestamp (seconds)
 */
export function toUnixTime(date: Date): number {
  return Math.floor(date.getTime() / 1000)
}
