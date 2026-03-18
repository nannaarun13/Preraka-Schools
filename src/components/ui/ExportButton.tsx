import { exportToExcel } from "@/utils/exportUtils";

interface Props {
  data: any;
  fileName: string;
}

export default function ExportButton({ data, fileName }: Props) {

  const handleExport = () => {
    exportToExcel(data, fileName);
  };

  return (
    <button
      onClick={handleExport}
      className="bg-green-600 text-white px-4 py-2 rounded"
    >
      Export Excel
    </button>
  );
}
