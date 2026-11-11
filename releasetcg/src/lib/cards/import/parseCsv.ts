/**
 * Reads CSV text into rows of cells.
 *
 * Handles what spreadsheet exports produce: quoted cells, commas and line
 * breaks inside quotes, "" for a quote character, Windows line endings and
 * a leading byte-order mark. Throws if a quoted cell is never closed.
 */
export function parseCsv(text: string): string[][] {
  const input = text.replace(/^\uFEFF/, "")

  const rows: string[][] = []

  let row: string[] = []
  let field = ""
  let inQuotes = false

  for (let i = 0; i < input.length; i++) {
    const char = input[i]

    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }

      continue
    }

    if (char === '"' && field === "") {
      inQuotes = true
    } else if (char === ",") {
      row.push(field)
      field = ""
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && input[i + 1] === "\n") i++

      row.push(field)
      rows.push(row)

      row = []
      field = ""
    } else {
      field += char
    }
  }

  if (inQuotes) {
    throw new Error("A quoted cell was never closed. Check for a stray quote mark.")
  }

  if (field !== "" || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows
}
