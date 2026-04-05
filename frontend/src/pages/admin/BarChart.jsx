import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import PovertyBarChart from "../../components/visualization/VisualizationBarChart";
import { getRegionYearLevel } from "../../api/DataAPI";

export default function BarChart() {
  const [rows, setRows] = useState([]);
  const [chartData, setChartData] = useState({});
  const [selectedYear, setSelectedYear] = useState("");
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);

  const regionNameMap = {
    NCR: "Metropolitan Manila",
    CAR: "Cordillera Administrative Region (CAR)",
    "Region I": "Ilocos Region (Region I)",
    "Region II": "Cagayan Valley (Region II)",
    "Region III": "Central Luzon (Region III)",
    "Region IV": "CALABARZON (Region IV-A)",
    MIMAROPA: "MIMAROPA (Region IV-B)",
    "Region V": "Bicol Region (Region V)",
    "Region VI": "Western Visayas (Region VI)",
    "Region VII": "Central Visayas (Region VII)",
    "Region VIII": "Eastern Visayas (Region VIII)",
    "Region IX": "Zamboanga Peninsula (Region IX)",
    "Region X": "Northern Mindanao (Region X)",
    "Region XI": "Davao Region (Region XI)",
    "Region XII": "SOCCSKSARGEN (Region XII)",
    CARAGA: "Caraga (Region XIII)",
    BARMM: "Autonomous Region of Muslim Mindanao (ARMM)",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const result = await getRegionYearLevel();
        setRows(result);

        const uniqueYears = [...new Set(result.map((item) => String(item.year)))].sort();
        setYears(uniqueYears);

        if (uniqueYears.length > 0) {
          setSelectedYear(uniqueYears[uniqueYears.length - 1]);
        }
      } catch (err) {
        console.error("Failed to fetch chart data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedYear || rows.length === 0) return;

    const filtered = rows.filter(
      (item) => String(item.year) === String(selectedYear)
    );

    const formatted = filtered.reduce((acc, item) => {
      const key =
        regionNameMap[item.region] ||
        regionNameMap[item.region_name] ||
        item.region_name ||
        item.region;

      acc[key] = item.poverty_level;
      return acc;
    }, {});

    setChartData(formatted);
  }, [selectedYear, rows]);

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">

        {/* HEADER */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#003B95] to-[#0056d2] p-6 text-white shadow-md">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* LEFT */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Bar Chart Visualization
              </h1>
              <p className="mt-1 text-sm text-blue-100">
                Poverty level ranking by region
              </p>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-blue-200">Selected Year</p>
                <p className="text-lg font-semibold">
                  {selectedYear || "-"}
                </p>
              </div>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-sm text-white backdrop-blur focus:outline-none"
              >
                {years.map((year) => (
                  <option key={year} value={year} className="text-black">
                    {year}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Decorative blur */}
          <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500 shadow-sm">
            Loading chart...
          </div>
        ) : (
          <PovertyBarChart data={chartData} selectedYear={selectedYear} />
        )}

      </div>
    </AdminLayout>
  );
}