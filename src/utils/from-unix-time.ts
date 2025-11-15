/**
 * Convert Unix timestamp (seconds) to Date
 */
export function fromUnixTime(unixTime: number | null): Date | null {
  if (unixTime === null) {
    return null
  }
  return new Date(unixTime * 1000)
}
