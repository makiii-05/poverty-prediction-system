import { useEffect, useState } from "react";
import VisualizationLineChart from "../../components/visualization/VisualizationLineChart";
import { getAllData } from "../../api/DataAPI";

export default function LineChart() {
  const [rows, setRows] = useState([]);
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

        const result = await getAllData();
        const rawRows = Array.isArray(result) ? result : result.data || [];

        const formattedRows = rawRows.map((item) => {
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
      } catch (err) {
        console.error("Failed to fetch line chart data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#003B95] to-[#0056d2] p-6 text-white shadow-md">
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Line Chart Visualization
            </h1>
            <p className="mt-1 text-sm text-blue-100">
              Socioeconomic indicator trends by region across years
            </p>
          </div>
        </div>

        <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500 shadow-sm">
          Loading chart...
        </div>
      ) : (
        <VisualizationLineChart rows={rows} />
      )}
    </div>
  );
}