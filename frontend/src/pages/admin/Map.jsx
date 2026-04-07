import { useEffect, useMemo, useState } from "react";
import PHMap from "../../components/visualization/PHMap";
import { getRegionYearLevel } from "../../api/DataAPI";

const REGION_NAME_MAP = {
  NCR: " National Capital Region",
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
  BARMM: "Bangsamoro Autonomous Region of Muslim Mindanao (BARMM)",
};

export default function MapPage() {
  const [rows, setRows] = useState([]);
  const [mapData, setMapData] = useState({});
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const result = await getRegionYearLevel();
        const safeRows = result || [];

        setRows(safeRows);

        const uniqueYears = [...new Set(safeRows.map((item) => String(item.year)))].sort();
        setYears(uniqueYears);

        if (uniqueYears.length > 0) {
          setSelectedYear(uniqueYears[uniqueYears.length - 1]);
        }
      } catch (err) {
        console.error("Failed to fetch visualization data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const regionOptions = useMemo(() => {
    const optionsMap = new globalThis.Map();

    rows.forEach((item) => {
      const code = item.region || item.region_name || "";
      const name =
        REGION_NAME_MAP[item.region] ||
        REGION_NAME_MAP[item.region_name] ||
        item.region_name ||
        item.region;

      if (!code || !name) return;

      optionsMap.set(code, {
        code,
        name,
      });
    });

    return Array.from(optionsMap.values()).sort((a, b) =>
      a.code.localeCompare(b.code)
    );
  }, [rows]);

  useEffect(() => {
    if (!selectedYear || rows.length === 0) {
      setMapData({});
      return;
    }

    const filtered = rows.filter(
      (item) => String(item.year) === String(selectedYear)
    );

    const formatted = filtered.reduce((acc, item) => {
      const key =
        REGION_NAME_MAP[item.region] ||
        REGION_NAME_MAP[item.region_name] ||
        item.region_name ||
        item.region;

      acc[key] = item.poverty_level;
      return acc;
    }, {});

    setMapData(formatted);
  }, [selectedYear, rows]);

  const selectedRegionLabel = useMemo(() => {
    if (!selectedRegion) return "All Regions";

    const found = regionOptions.find((item) => item.code === selectedRegion);
    return found ? `${found.code} - ${found.name}` : selectedRegion;
  }, [selectedRegion, regionOptions]);

  return (
    <div className="space-y-6 p-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#003B95] to-[#0056d2] p-6 text-white shadow-md">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Choropleth Map
            </h1>
            <p className="mt-1 text-sm text-blue-100">
              Regional poverty level map of the Philippines
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="text-right">
              <p className="text-xs text-blue-200">Selected Year</p>
              <p className="text-lg font-semibold">{selectedYear || "-"}</p>
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

            <div className="min-w-[260px]">
              <p className="mb-1 text-xs text-blue-200">Selected Region</p>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-sm text-white backdrop-blur focus:outline-none"
              >
                <option value="" className="text-black">
                  All Regions
                </option>
                {regionOptions.map((region) => (
                  <option
                    key={region.code}
                    value={region.code}
                    className="text-black"
                  >
                    {region.code} - {region.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs text-blue-100 backdrop-blur">
          Viewing: {selectedRegionLabel}
        </div>

        <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500 shadow-sm">
          Loading map...
        </div>
      ) : (
        <PHMap
          data={mapData}
          selectedYear={selectedYear}
          selectedRegion={selectedRegion}
        />
      )}
    </div>
  );
}