import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const levelToScore = {
  Low: 1,
  Moderate: 2,
  High: 3,
};

const scoreToLevel = {
  1: "Low",
  2: "Moderate",
  3: "High",
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

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0].payload;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold text-slate-800">Year: {label}</p>
      <p className="text-sm text-slate-600">
        Poverty Level: {item.level}
      </p>
      <p className="text-sm text-slate-600">
        Rank Score: {item.score}
      </p>
    </div>
  );
};

export default function VisualizationLineChart({ rows, selectedRegion }) {
  const filteredRows = rows
    .filter((item) => item.displayRegion === selectedRegion)
    .map((item) => ({
      year: String(item.year),
      level: item.poverty_level,
      score: levelToScore[item.poverty_level] || 0,
    }))
    .sort((a, b) => Number(a.year) - Number(b.year));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-800">
          Regional Poverty Level Trend
        </h2>
        <p className="text-sm text-slate-500">
          Poverty level progression of {getDisplayRegionName(selectedRegion)}
        </p>
      </div>

      <div className="h-[420px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={filteredRows}
            margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis
              domain={[1, 3]}
              ticks={[1, 2, 3]}
              tickFormatter={(value) => scoreToLevel[value] || value}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />

            <ReferenceLine y={1} stroke="#22c55e" strokeDasharray="3 3" />
            <ReferenceLine y={2} stroke="#eab308" strokeDasharray="3 3" />
            <ReferenceLine y={3} stroke="#ef4444" strokeDasharray="3 3" />

            <Line
              type="monotone"
              dataKey="score"
              stroke="#003B95"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-700">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-500" />
          Low
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-yellow-500" />
          Moderate
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          High
        </div>
      </div>
    </div>
  );
}