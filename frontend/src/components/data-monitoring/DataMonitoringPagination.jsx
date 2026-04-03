export default function DataMonitoringPagination({
  currentData,
  startIndex,
  endIndex,
  searchedData,
  totalPages,
  currentPage,
  setCurrentPage,
}) {
  return (
    <div className="mt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-center text-xs text-slate-600 sm:text-left sm:text-sm">
          Showing {currentData.length > 0 ? startIndex + 1 : 0}–
          {Math.min(endIndex, searchedData.length)} of {searchedData.length} records
        </p>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 sm:justify-end">
            <button
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
            >
              Previous
            </button>

            <span className="text-xs font-medium text-slate-700 sm:text-sm">
              Page {currentPage} of {totalPages || 1}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="rounded-lg bg-[#003B95] px-3 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}