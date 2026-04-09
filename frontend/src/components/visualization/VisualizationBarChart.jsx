import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const levelToScore = {
  Low: 1,
  Moderate: 2,
  High: 3,
};

const COLORS = {
  Low: "#22c55e",
  Moderate: "#eab308",
  High: "#ef4444",
};

const getShortName = (regionName) => {
  if (!regionName) return "";

  if (regionName === "Metropolitan Manila") return "NCR";

  if (regionName.includes("Autonomous Region")) return "BARMM";

  if (regionName.includes("(CAR)")) return "CAR";

  const match = regionName.match(/\(Region (.*?)\)/);
  if (match) {
    return `Region ${match[1]}`;
  }

  return regionName;
};

const getFullName = (regionName) => {
  if (!regionName) return "";

  if (regionName.includes("Autonomous Region of Muslim Mindanao")) {
    return "Bangsamoro Autonomous Region in Muslim Mindanao";
  }

  if (regionName === "Metropolitan Manila") {
    return "National Capital Region";
  }

  return regionName;
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0].payload;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold text-slate-800">
        {item.fullName}
      </p>
      <p className="text-sm text-slate-600">
        Poverty Level: {item.level}
      </p>
    </div>
  );
};

export default function VisualizationBarChart({ data, selectedYear }) {
  const chartData = Object.entries(data)
    .map(([region, level]) => ({
      shortName: getShortName(region),
      fullName: getFullName(region),
      level,
      score: levelToScore[level] || 0,
    }))

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-800">
          Regional Poverty Level Ranking
        </h2>
        <p className="text-sm text-slate-500">
          Poverty level ranking of Philippine regions — {selectedYear}
        </p>
      </div>

      <div className="h-[460px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 20, left: 10, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="shortName"
              angle={-35}
              textAnchor="end"
              interval={0}
              height={90}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={[0, 3]}
              ticks={[1, 2, 3]}
              tickFormatter={(value) => {
                if (value === 1) return "Low";
                if (value === 2) return "Moderate";
                if (value === 3) return "High";
                return value;
              }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="score" radius={[8, 8, 0, 0]}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.shortName}
                  fill={COLORS[entry.level] || "#e5e7eb"}
                />
              ))}
            </Bar>
          </BarChart>
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