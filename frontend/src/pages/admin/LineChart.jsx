import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import PovertyLineChart from "../../components/visualization/VisualizationLineChart";
import { getRegionYearLevel } from "../../api/DataAPI";

export default function LineChart() {
  const [rows, setRows] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("");
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

  const getDisplayRegionName = (regionName) => {
    if (!regionName) return "";

    if (regionName.includes("Autonomous Region of Muslim Mindanao")) {
      return "Bangsamoro Autonomous Region in Muslim Mindanao";
    }

    if (regionName === "Metropolitan Manila") {
      return "National Capital Region";
    }

    return regionName;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const result = await getRegionYearLevel();

        const formattedRows = result.map((item) => {
          const mappedRegion =
            regionNameMap[item.region] ||
            regionNameMap[item.region_name] ||
            item.region_name ||
            item.region;

          return {
            ...item,
            mappedRegion,
            displayRegion: getDisplayRegionName(mappedRegion),
          };
        });

        setRows(formattedRows);

        const uniqueRegions = [
          ...new Set(formattedRows.map((item) => item.displayRegion)),
        ].sort();

        if (uniqueRegions.length > 0) {
          setSelectedRegion(uniqueRegions[0]);
        }
      } catch (err) {
        console.error("Failed to fetch line chart data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const regionOptions = useMemo(() => {
    return [...new Set(rows.map((item) => item.displayRegion))].sort();
  }, [rows]);

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#003B95] to-[#0056d2] p-6 text-white shadow-md">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Line Chart Visualization
              </h1>
              <p className="mt-1 text-sm text-blue-100">
                Poverty level trend by region across years
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-blue-200">Selected Region</p>
                <p className="max-w-[220px] truncate text-lg font-semibold">
                  {selectedRegion || "-"}
                </p>
              </div>

              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="max-w-[240px] rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-sm text-white backdrop-blur focus:outline-none"
              >
                {regionOptions.map((region) => (
                  <option key={region} value={region} className="text-black">
                    {region}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500 shadow-sm">
            Loading chart...
          </div>
        ) : (
          <PovertyLineChart rows={rows} selectedRegion={selectedRegion} />
        )}
      </div>
    </AdminLayout>
  );
}