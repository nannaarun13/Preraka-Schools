export const exportToExcel = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.warn("No data available to export.");
    return;
  }

  try {
    // Extract headers
    const headers = Object.keys(data[0]);

    // Convert rows
    const rows = data.map((row) =>
      headers.map((header) => {
        let value = row[header];

        if (value === null || value === undefined) value = "";

        // Convert objects / arrays to string
        if (typeof value === "object") {
          value = JSON.stringify(value);
        }

        // Escape quotes
        return `"${value.toString().replace(/"/g, '""')}"`;
      })
    );

    // Create CSV content
    const csvContent =
      "\uFEFF" + // BOM for Excel UTF-8 support
      [
        headers.join(","), // header row
        ...rows.map((row) => row.join(",")),
      ].join("\n");

    // Create file
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.download = `${filename}.csv`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);

    // cleanup memory
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Excel export failed:", error);
  }
};
