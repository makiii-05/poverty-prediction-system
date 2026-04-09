import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  getAllData,
  filterData,
  deleteData,
  deleteByYear,
} from "../../api/DataAPI";
import { verifyAdminPassword } from "../../api/AdminActionAPI";

import ConfirmAction from "../../components/auth/ConfirmAction";
import DataMonitoringFilters from "../../components/data-monitoring/DataMonitoringFilters";
import DataMonitoringCards from "../../components/data-monitoring/DataMonitoringCards";
import DataMonitoringTable from "../../components/data-monitoring/DataMonitoringTable";
import DataMonitoringPagination from "../../components/data-monitoring/DataMonitoringPagination";

export default function DataMonitoring() {
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 8;

  const [selectedItems, setSelectedItems] = useState([]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

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

  const openConfirm = (message, action = null) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmOpen(true);
  };

  const fetchRegionalData = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getAllData();
      setAllData(result);
      setData(result);
      setCurrentPage(1);
      setSelectedItems([]);
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
      setSelectedItems([]);
    } catch (err) {
      setError(err.message || "Failed to filter regional data");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (item) => {
    openConfirm(
      `Are you sure you want to delete this record?\n\nRegion: ${
        item.region_name || item.region
      }\nYear: ${item.year}\n\nPlease enter the admin password to continue.`,
      async () => {
        await deleteData(item.id);
        setSelectedItems((prev) =>
          prev.filter((selected) => selected.id !== item.id)
        );
        await fetchRegionalData();
      }
    );
  };

  const handleSelectItem = (item) => {
    setSelectedItems((prev) => {
      const exists = prev.some((selected) => selected.id === item.id);

      if (exists) {
        return prev.filter((selected) => selected.id !== item.id);
      }

      return [...prev, item];
    });
  };

  const handleSelectAllCurrent = () => {
    const currentIds = currentData.map((item) => item.id);

    const allSelected = currentData.every((item) =>
      selectedItems.some((selected) => selected.id === item.id)
    );

    if (allSelected) {
      setSelectedItems((prev) =>
        prev.filter((item) => !currentIds.includes(item.id))
      );
    } else {
      const merged = [...selectedItems];

      currentData.forEach((item) => {
        const exists = merged.some((selected) => selected.id === item.id);
        if (!exists) {
          merged.push(item);
        }
      });

      setSelectedItems(merged);
    }
  };

  const handleBulkDeleteByYear = () => {
    if (selectedItems.length === 0) {
      openConfirm("Please select at least one record first.");
      return;
    }

    const uniqueYears = [...new Set(selectedItems.map((item) => item.year))];

    openConfirm(
      `Are you sure you want to delete all records for these year(s)?\n\n${uniqueYears.join(
        ", "
      )}\n\nThis action cannot be undone.\n\nPlease enter the admin password to continue.`,
      async () => {
        for (const year of uniqueYears) {
          await deleteByYear(year);
        }

        setSelectedItems([]);
        await fetchRegionalData();
      }
    );
  };

  const handleConfirmPassword = async (password) => {
    try {
      await verifyAdminPassword(password);

      if (confirmAction) {
        const action = confirmAction;
        setConfirmAction(null);
        setConfirmOpen(false);
        await action();
      } else {
        setConfirmOpen(false);
      }
    } catch (err) {
      throw new Error(err.message || "Incorrect password");
    }
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
    <AdminLayout>
      <ConfirmAction
        isOpen={confirmOpen}
        message={confirmMessage}
        onConfirm={handleConfirmPassword}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmAction(null);
        }}
      />

      <div className="min-h-screen bg-slate-50 px-3 py-4 sm:px-4 md:px-6">
      {/* HEADER */}
      <div className="relative mb-5 overflow-hidden rounded-2xl bg-gradient-to-r from-[#003B95] to-[#0056d2] p-6 text-white shadow-md">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          {/* LEFT */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Data Monitoring
            </h1>
            <p className="mt-1 text-sm text-blue-100">
              Monitor and manage historical regional socioeconomic data
            </p>
          </div>

        </div>

        {/* Decorative blur */}
        <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      </div>

        <DataMonitoringFilters
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          regionOptions={regionOptions}
          yearOptions={yearOptions}
          search={search}
          setSearch={setSearch}
        />

        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            Selected records:{" "}
            <span className="font-semibold text-slate-800">
              {selectedItems.length}
            </span>
          </div>

          <button
            onClick={handleBulkDeleteByYear}
            disabled={selectedItems.length === 0}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete Selected by Year
          </button>
        </div>

        <DataMonitoringCards
          loading={loading}
          error={error}
          currentData={currentData}
          search={search}
          onDelete={handleDelete}
        />

        <DataMonitoringTable
          loading={loading}
          error={error}
          currentData={currentData}
          search={search}
          onDelete={handleDelete}
          selectedItems={selectedItems}
          onSelectItem={handleSelectItem}
          onSelectAllCurrent={handleSelectAllCurrent}
        />

        <DataMonitoringPagination
          currentData={currentData}
          startIndex={startIndex}
          endIndex={endIndex}
          searchedData={searchedData}
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </AdminLayout>
  );
}