export function filterStationCode(
  codes: string[],
  lineFilter: string
): string[] {
  return lineFilter
    ? codes.filter(code => {
        const cleanCode = (code.split(/\d/)[0] ?? '').toLowerCase()
        const cleanFilter = (lineFilter.split(/\d/)[0] ?? '').toLowerCase()

        return (
          cleanCode.startsWith(cleanFilter) || cleanFilter.startsWith(cleanCode)
        )
      })
    : codes
}
