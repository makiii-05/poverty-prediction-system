import { useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "@vnedyalk0v/react19-simple-maps";
import geoData from "../../data/philippines.json";

const NO_DATA_COLOR = "#e5e7eb";

const getColor = (level) => {
  if (level === "Low") return "#22c55e";
  if (level === "Moderate") return "#eab308";
  if (level === "High") return "#ef4444";
  return NO_DATA_COLOR;
};

const getDisplayRegionCode = (regionName) => {
  if (regionName === "Autonomous Region of Muslim Mindanao (ARMM)") return "BARMM";
  if (regionName === "Metropolitan Manila") return "NCR";
  if (regionName === "Cordillera Administrative Region (CAR)") return "CAR";
  if (regionName === "Ilocos Region (Region I)") return "Region I";
  if (regionName === "Cagayan Valley (Region II)") return "Region II";
  if (regionName === "Central Luzon (Region III)") return "Region III";
  if (regionName === "CALABARZON (Region IV-A)") return "Region IV";
  if (regionName === "MIMAROPA (Region IV-B)") return "MIMAROPA";
  if (regionName === "Bicol Region (Region V)") return "Region V";
  if (regionName === "Western Visayas (Region VI)") return "Region VI";
  if (regionName === "Central Visayas (Region VII)") return "Region VII";
  if (regionName === "Eastern Visayas (Region VIII)") return "Region VIII";
  if (regionName === "Zamboanga Peninsula (Region IX)") return "Region IX";
  if (regionName === "Northern Mindanao (Region X)") return "Region X";
  if (regionName === "Davao Region (Region XI)") return "Region XI";
  if (regionName === "SOCCSKSARGEN (Region XII)") return "Region XII";
  if (regionName === "Caraga (Region XIII)") return "CARAGA";
  return regionName;
};

const getVisibleLevel = (regionName, level, selectedRegion) => {
  if (!selectedRegion) return level;
  const regionCode = getDisplayRegionCode(regionName);
  return regionCode === selectedRegion ? level : null;
};

export default function PHMap({
  data,
  selectedYear,
  selectedRegion,
}) {
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    region: "",
    level: "",
  });

  const showTooltip = (event, regionName, visibleLevel) => {
    const regionCode = getDisplayRegionCode(regionName);

    setTooltip({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      region: `${regionCode} - ${regionName}`,
      level: visibleLevel || "No data",
    });
  };

  const moveTooltip = (event) => {
    setTooltip((prev) => ({
      ...prev,
      x: event.clientX,
      y: event.clientY,
    }));
  };

  const hideTooltip = () => {
    setTooltip({
      visible: false,
      x: 0,
      y: 0,
      region: "",
      level: "",
    });
  };

  const summaryCounts = useMemo(() => {
    const counts = {
      Low: 0,
      Moderate: 0,
      High: 0,
      "No data": 0,
    };

    Object.entries(data || {}).forEach(([regionName, level]) => {
      const visibleLevel = getVisibleLevel(regionName, level, selectedRegion);

      if (visibleLevel === "Low") counts.Low += 1;
      else if (visibleLevel === "Moderate") counts.Moderate += 1;
      else if (visibleLevel === "High") counts.High += 1;
      else counts["No data"] += 1;
    });

    return counts;
  }, [data, selectedRegion]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-800">
          Regional Poverty Level
        </h2>
        <p className="text-sm text-slate-500">
          Philippines — {selectedYear}
          {selectedRegion ? ` • ${selectedRegion}` : " • All Regions"}
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 2300,
              center: [122, 11.5],
            }}
            style={{ width: "100%", height: "auto" }}
          >
            <Geographies geography={geoData}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const regionName =
                    geo.properties.REGION ||
                    geo.properties.name ||
                    geo.properties.NAME_1 ||
                    geo.properties.region ||
                    "";

                  const level = data[regionName];
                  const visibleLevel = getVisibleLevel(
                    regionName,
                    level,
                    selectedRegion
                  );

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      stroke="#ffffff"
                      strokeWidth={0.8}
                      onMouseEnter={(e) =>
                        showTooltip(e, regionName, visibleLevel)
                      }
                      onMouseMove={moveTooltip}
                      onMouseLeave={hideTooltip}
                      style={{
                        default: {
                          fill: getColor(visibleLevel),
                          outline: "none",
                          transition: "fill 0.3s ease-in-out",
                        },
                        hover: {
                          fill: selectedRegion && !visibleLevel ? NO_DATA_COLOR : "#93c5fd",
                          outline: "none",
                          cursor: "pointer",
                          transition: "fill 0.2s ease-in-out",
                        },
                        pressed: {
                          outline: "none",
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
        </div>

        <div className="w-full max-w-[260px] space-y-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">
              Poverty Level Legend
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-4 w-4 rounded-sm border border-slate-200"
                    style={{ backgroundColor: "#22c55e" }}
                  />
                  <span className="text-slate-700">Low</span>
                </div>
                <span className="text-slate-500">{summaryCounts.Low}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-4 w-4 rounded-sm border border-slate-200"
                    style={{ backgroundColor: "#eab308" }}
                  />
                  <span className="text-slate-700">Moderate</span>
                </div>
                <span className="text-slate-500">{summaryCounts.Moderate}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-4 w-4 rounded-sm border border-slate-200"
                    style={{ backgroundColor: "#ef4444" }}
                  />
                  <span className="text-slate-700">High</span>
                </div>
                <span className="text-slate-500">{summaryCounts.High}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-4 w-4 rounded-sm border border-slate-200"
                    style={{ backgroundColor: NO_DATA_COLOR }}
                  />
                  <span className="text-slate-700">No data</span>
                </div>
                <span className="text-slate-500">
                  {summaryCounts["No data"]}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-700">
              Notes
            </h3>
            <p className="text-xs leading-relaxed text-slate-500">
              {selectedRegion
                ? "Only the selected region is highlighted. All other regions are shown as No data."
                : "Colors represent the classified poverty level of each region for the selected year."}
            </p>
          </div>
        </div>
      </div>

      {tooltip.visible && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border bg-white px-3 py-2 text-xs shadow"
          style={{
            top: tooltip.y + 12,
            left: tooltip.x + 12,
          }}
        >
          <p className="font-semibold">{tooltip.region}</p>
          <p>Year: {selectedYear}</p>
          <p>Poverty: {tooltip.level}</p>
        </div>
      )}
    </div>
  );
}