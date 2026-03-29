import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";

export default function AdminDashboard() {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const validTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ];

      if (!validTypes.includes(file.type)) {
        alert("Only CSV, XLS, and XLSX files are allowed.");
        return;
      }

      setSelectedFile(file);
    }
  };

  // Submit to backend
  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);

      const res = await fetch("/api/dataset/upload", {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }

      alert("Upload successful!");
      setSelectedFile(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

    // Download sample dataset
    const handleDownloadSample = () => {
    window.open("/MAIN_DATASET.xlsx", "_blank");
    };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#F8FAFC] px-3 py-4">
        <div className="mx-auto max-w-5xl">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-[#003B95] sm:text-2xl md:text-3xl">
              Dataset Upload
            </h1>
            <p className="text-sm text-slate-500">
              Upload and validate CSV or Excel datasets
            </p>
          </div>

          {/* Upload Card */}
          <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[#003B95]">
              Upload File
            </h2>

            <div
              onClick={handleChooseFile}
              className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center hover:border-[#003B95]/40"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xls,.xlsx"
                onChange={handleFileChange}
                className="hidden"
              />

              <Upload className="mb-3 h-8 w-8 text-slate-400" />

              {!selectedFile ? (
                <>
                  <p className="text-sm font-medium text-[#003B95]">
                    Choose file or drag & drop
                  </p>
                  <p className="text-xs text-slate-500">
                    CSV, XLS, XLSX • max 10MB
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-[#003B95]">
                    Selected:
                  </p>
                  <p className="text-xs text-slate-600 break-all">
                    {selectedFile.name}
                  </p>
                </>
              )}
            </div>

            {/* Buttons */}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={handleUpload}
                disabled={loading}
                className="rounded-lg bg-[#003B95] px-4 py-2 text-sm font-semibold text-white hover:bg-[#002c70] disabled:opacity-50"
              >
                {loading ? "Uploading..." : "Submit Dataset"}
              </button>

              <button
                onClick={handleDownloadSample}
                className="rounded-lg border border-[#003B95] px-4 py-2 text-sm font-semibold text-[#003B95] hover:bg-[#003B95]/10"
              >
                Download Sample (MAIN_DATASET)
              </button>
            </div>
          </div>

          {/* Requirements */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <h2 className="mb-3 text-lg font-semibold text-[#003B95]">
              File Requirements
            </h2>

            <ul className="space-y-1 text-xs text-slate-700">
              <li>• Required columns: Region, Year, Poverty Rate</li>
              <li>• Indicator columns must match system</li>
              <li>• Years must be valid (e.g. 2023)</li>
              <li>• No special characters in numeric values</li>
              <li>• First row must be headers</li>
            </ul>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}