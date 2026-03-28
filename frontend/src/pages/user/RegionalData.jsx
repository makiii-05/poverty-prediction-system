import { useEffect, useMemo, useState } from "react";
import UserLayout from "../../layouts/UserLayout";
import { getAllData, filterData } from "../../api/DataAPI";
import Search from "../../components/common/Search";
import RegionalDataTable from "../../components/regional-data/RegionalDataTable";
import RegionalDataCards from "../../components/regional-data/RegionalDataCard";

export default function RegionalData() {
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 8;

  useEffect(() => {
    fetchRegionalData();
  }, []);

  useEffect(() => {
    if (allData.length === 0) return;

    if (!selectedRegion && !selectedYear) {
      setData(allData);
      setCurrentPage(1);
      return;
    }

    handleFilter();
  }, [selectedRegion, selectedYear, allData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const fetchRegionalData = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getAllData();
      setAllData(result);
      setData(result);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || "Failed to fetch regional data");
      setAllData([]);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await filterData({
        region: selectedRegion,
        year: selectedYear,
      });

      setData(result);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || "Failed to filter regional data");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const getPovertyBadgeStyle = (level) => {
    switch (level?.toLowerCase()) {
      case "low":
        return {
          badge:
            "border border-green-200 bg-green-50 text-green-700 shadow-green-100",
          dot: "bg-green-500",
        };
      case "moderate":
        return {
          badge:
            "border border-yellow-200 bg-yellow-50 text-yellow-700 shadow-yellow-100",
          dot: "bg-yellow-500",
        };
      case "high":
        return {
          badge:
            "border border-red-200 bg-red-50 text-red-700 shadow-red-100",
          dot: "bg-red-500",
        };
      default:
        return {
          badge:
            "border border-slate-200 bg-slate-50 text-slate-700 shadow-slate-100",
          dot: "bg-slate-400",
        };
    }
  };

  const highlightText = (text, keyword) => {
    if (!keyword?.trim()) return text;

    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedKeyword})`, "gi");

    return String(text)
      .split(regex)
      .map((part, index) =>
        part.toLowerCase() === keyword.toLowerCase() ? (
          <span
            key={index}
            className="rounded bg-[#003B95]/20 px-[2px] font-semibold text-[#003B95]"
          >
            {part}
          </span>
        ) : (
          part
        )
      );
  };

  const PovertyBadge = ({ level }) => {
    const style = getPovertyBadgeStyle(level);

    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-sm ${style.badge}`}
      >
        <span className={`h-2 w-2 rounded-full ${style.dot}`} />
        {highlightText(level, search)}
      </span>
    );
  };

  const regionOptions = useMemo(() => {
    const uniqueRegions = [...new Set(allData.map((item) => item.region_name))];
    return uniqueRegions.sort();
  }, [allData]);

  const yearOptions = useMemo(() => {
    const uniqueYears = [...new Set(allData.map((item) => item.year))];
    return uniqueYears.sort((a, b) => b - a);
  }, [allData]);

  const searchedData = useMemo(() => {
    if (!search.trim()) return data;

    const keyword = search.toLowerCase();

    return data.filter((item) => {
      return (
        item.region_name?.toLowerCase().includes(keyword) ||
        item.region?.toLowerCase().includes(keyword) ||
        String(item.year).includes(keyword) ||
        String(item.unemployment_rate).includes(keyword) ||
        String(item.ave_income).includes(keyword) ||
        String(item.expenditure).includes(keyword) ||
        String(item.mean_years_education).includes(keyword) ||
        String(item.population_size).includes(keyword) ||
        String(item.poverty_level).toLowerCase().includes(keyword)
      );
    });
  }, [data, search]);

  const totalPages = Math.ceil(searchedData.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentData = searchedData.slice(startIndex, endIndex);

  return (
    <UserLayout>
      <div className="min-h-screen bg-slate-50 px-3 py-4 sm:px-4 md:px-6">
        <div className="mb-4 sm:mb-5">
          <h1 className="text-xl font-bold tracking-tight text-[#003B95] sm:text-2xl md:text-3xl">
            Regional Data
          </h1>
          <p className="mt-1 text-xs text-slate-600 sm:text-sm">
            View historical regional socioeconomic data
          </p>
        </div>

        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Select Region
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#003B95] focus:ring-2 focus:ring-[#003B95]/20"
              >
                <option value="">All Regions</option>
                {regionOptions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Select Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#003B95] focus:ring-2 focus:ring-[#003B95]/20"
              >
                <option value="">All Years</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:flex md:items-end">
              <div className="w-full md:max-w-xs">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Search
                </label>
                <Search
                  value={search}
                  onChange={setSearch}
                  placeholder="Search..."
                />
              </div>
            </div>
          </div>
        </div>

        <RegionalDataCards
          loading={loading}
          error={error}
          currentData={currentData}
          PovertyBadge={PovertyBadge}
          highlightText={highlightText}
          search={search}
        />

        <RegionalDataTable
          loading={loading}
          error={error}
          currentData={currentData}
          startIndex={startIndex}
          endIndex={endIndex}
          searchedData={searchedData}
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          PovertyBadge={PovertyBadge}
          highlightText={highlightText}
          search={search}
        />

        <div className="mt-4 md:hidden">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-xs text-slate-600 sm:text-left sm:text-sm">
              Showing {currentData.length > 0 ? startIndex + 1 : 0}–
              {Math.min(endIndex, searchedData.length)} of {searchedData.length}{" "}
              records
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
      </div>
    </UserLayout>
  );
}