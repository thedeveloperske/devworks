import * as XLSX from "xlsx";

export type RawUploadRow = Record<string, string>;

function cellToString(value: unknown): string {
  if (value == null) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    // Excel serial date (roughly days since 1899-12-30).
    if (value > 20000 && value < 80000) {
      const parsed = XLSX.SSF.parse_date_code(value);
      if (parsed) {
        const month = String(parsed.m).padStart(2, "0");
        const day = String(parsed.d).padStart(2, "0");
        return `${parsed.y}-${month}-${day}`;
      }
    }
    return String(value);
  }
  return String(value).trim();
}

function rowsFromSheet(sheet: XLSX.WorkSheet): RawUploadRow[] {
  const matrix = XLSX.utils.sheet_to_json<(string | number | Date | null)[]>(
    sheet,
    {
      header: 1,
      defval: "",
      raw: true,
      blankrows: false,
    }
  );

  if (matrix.length < 2) return [];

  const headers = (matrix[0] ?? []).map((header) =>
    cellToString(header).trim()
  );
  const rows: RawUploadRow[] = [];

  for (let i = 1; i < matrix.length; i += 1) {
    const values = matrix[i] ?? [];
    const row: RawUploadRow = {};
    let hasValue = false;

    headers.forEach((header, index) => {
      if (!header) return;
      const value = cellToString(values[index]);
      row[header] = value;
      if (value) hasValue = true;
    });

    if (hasValue) rows.push(row);
  }

  return rows;
}

/**
 * Parses CSV or Excel file bytes into row objects keyed by the header row.
 */
export function parseMemberUploadFile(
  buffer: Buffer,
  fileName: string
): { rows: RawUploadRow[] } | { error: string } {
  const lower = fileName.toLowerCase();
  if (
    !lower.endsWith(".csv") &&
    !lower.endsWith(".xlsx") &&
    !lower.endsWith(".xls")
  ) {
    return { error: "File must be .csv, .xlsx, or .xls" };
  }

  try {
    const workbook = XLSX.read(buffer, {
      type: "buffer",
      cellDates: true,
      raw: true,
    });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return { error: "The file has no worksheets" };
    }
    const sheet = workbook.Sheets[firstSheetName];
    if (!sheet) {
      return { error: "Unable to read the first worksheet" };
    }

    const rows = rowsFromSheet(sheet);
    if (rows.length === 0) {
      return { error: "No data rows found. Include a header row and at least one member." };
    }
    return { rows };
  } catch (error: unknown) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Failed to read the upload file";
    return { error: message };
  }
}
