import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "@vnedyalk0v/react19-simple-maps";
import geoData from "../../data/philippines.json";

const getColor = (level) => {
  if (level === "Low") return "#22c55e";
  if (level === "Moderate") return "#eab308";
  if (level === "High") return "#ef4444";
  return "#e5e7eb";
};

const getDisplayRegionName = (regionName) => {
  if (regionName === "Autonomous Region of Muslim Mindanao (ARMM)")
    return "BARMM";
  if (regionName === "Metropolitan Manila") return "NCR";
  return regionName;
};

export default function PHMap({ data, selectedYear }) {
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    region: "",
    level: "",
  });

  const showTooltip = (event, regionName, level) => {
    setTooltip({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      region: getDisplayRegionName(regionName),
      level: level || "No data",
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

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      
      {/* TITLE */}
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-800">
          Regional Poverty Level
        </h2>
        <p className="text-sm text-slate-500">
          Philippines — {selectedYear}
        </p>
      </div>

      {/* 🔥 MAIN LAYOUT */}
      <div className="flex flex-col gap-6 lg:flex-row">
        
        {/* 🗺️ MAP */}
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

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      stroke="#ffffff"
                      strokeWidth={0.8}
                      onMouseEnter={(e) => showTooltip(e, regionName, level)}
                      onMouseMove={moveTooltip}
                      onMouseLeave={hideTooltip}
                      style={{
                        default: {
                          fill: getColor(level),
                          outline: "none",
                          transition: "fill 0.5s ease-in-out",
                        },
                        hover: {
                          fill: "#93c5fd",
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

        {/* 📊 SIDE SUMMARY (LIKE YOUR IMAGE) */}
        <div className="w-full max-w-[260px]">
          <div className="rounded-xl border border-slate-200 p-3">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">
              Region Summary
            </h3>

            <div className="flex flex-col gap-2 text-xs">
              {Object.entries(data).map(([region, level]) => (
                <div
                  key={region}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-sm"
                      style={{ backgroundColor: getColor(level) }}
                    />
                    <span className="text-slate-700">
                      {getDisplayRegionName(region)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TOOLTIP */}
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