export function getLineColor(
  code: string,
  lines: { code: string; color: string }[]
): string {
  const cleanStationCode = (code.split(/\d/)[0] ?? '').toLowerCase()

  const line = lines.find(l => {
    const cleanLineCode = (l.code.split(/\d/)[0] ?? '').toLowerCase()

    return (
      cleanLineCode.startsWith(cleanStationCode) ||
      cleanStationCode.startsWith(cleanLineCode)
    )
  })

  return line?.color || '#666'
}
