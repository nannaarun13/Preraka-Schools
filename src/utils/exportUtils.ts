import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/* =========================
   NORMALIZE DATA
========================= */

export const normalizeData = (data: any[] | any) => {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
};

/* =========================
   FORMAT HEADERS
========================= */

export const formatHeaders = (data: any[]) => {
  return data.map((row) => {
    const formattedRow: any = {};

    Object.keys(row).forEach((key) => {
      const formattedKey = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());

      formattedRow[formattedKey] = row[key];
    });

    return formattedRow;
  });
};

/* =========================
   EXPORT EXCEL
========================= */

export const exportToExcel = (data: any[] | any, fileName: string) => {
  const normalized = normalizeData(data);

  if (normalized.length === 0) {
    console.warn("No data to export");
    return;
  }

  try {
    const formatted = formatHeaders(normalized);

    const worksheet = XLSX.utils.json_to_sheet(formatted);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `${fileName}.xlsx`);
  } catch (error) {
    console.error("Excel export failed:", error);
  }
};

/* =========================
   EXPORT CSV
========================= */

export const exportToCSV = (data: any[] | any, fileName: string) => {
  const normalized = normalizeData(data);

  if (normalized.length === 0) return;

  const headers = Object.keys(normalized[0]);

  const rows = normalized.map((row) =>
    headers
      .map((header) => {
        const value = row[header] ?? "";
        return `"${value.toString().replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  saveAs(blob, `${fileName}.csv`);
};

/* =========================
   EXPORT MULTIPLE SHEETS
========================= */

export const exportMultipleSheets = (
  sheets: { sheetName: string; data: any[] }[],
  fileName: string
) => {
  if (!sheets || sheets.length === 0) return;

  try {
    const workbook = XLSX.utils.book_new();

    sheets.forEach((sheet) => {
      const formatted = formatHeaders(normalizeData(sheet.data));

      const worksheet = XLSX.utils.json_to_sheet(formatted);

      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.sheetName);
    });

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `${fileName}.xlsx`);
  } catch (error) {
    console.error("Multi-sheet export failed:", error);
  }
};
