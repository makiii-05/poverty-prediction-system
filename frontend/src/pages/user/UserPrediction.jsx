import { useState } from "react";
import { Sparkles } from "lucide-react";
import UserLayout from "../../layouts/UserLayout";
import PredictionForm from "../../components/predictions/PredictionForm";
import PredictionResult from "../../components/predictions/PredictionResult";
import VisualizationModal from "../../components/predictions/VisualizationModal";

const regionOptions = [
  {
    value: "BARMM",
    label: "BARMM – Bangsamoro Autonomous Region in Muslim Mindanao",
  },
  {
    value: "CAR",
    label: "CAR – Cordillera Administrative Region",
  },
  {
    value: "CARAGA",
    label: "CARAGA – Caraga Region",
  },
  {
    value: "MIMAROPA",
    label: "MIMAROPA – Mindoro, Marinduque, Romblon, Palawan",
  },
  {
    value: "NCR",
    label: "NCR – National Capital Region",
  },
  {
    value: "Region I",
    label: "Region I – Ilocos Region",
  },
  {
    value: "Region II",
    label: "Region II – Cagayan Valley",
  },
  {
    value: "Region III",
    label: "Region III – Central Luzon",
  },
  {
    value: "Region IV",
    label: "Region IV – CALABARZON",
  },
  {
    value: "Region V",
    label: "Region V – Bicol Region",
  },
  {
    value: "Region VI",
    label: "Region VI – Western Visayas",
  },
  {
    value: "Region VII",
    label: "Region VII – Central Visayas",
  },
  {
    value: "Region VIII",
    label: "Region VIII – Eastern Visayas",
  },
  {
    value: "Region IX",
    label: "Region IX – Zamboanga Peninsula",
  },
  {
    value: "Region X",
    label: "Region X – Northern Mindanao",
  },
  {
    value: "Region XI",
    label: "Region XI – Davao Region",
  },
  {
    value: "Region XII",
    label: "Region XII – SOCCSKSARGEN",
  },
];

export default function UserPrediction() {
  const [formData, setFormData] = useState({
    year: "",
    ave_income: "",
    expenditure: "",
    unemployment_rate: "",
    mean_years_education: "",
    population_size: "",
    region: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showVisualization, setShowVisualization] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const payload = {
        ...formData,
        year: Number(formData.year),
        ave_income: Number(formData.ave_income),
        expenditure: Number(formData.expenditure),
        unemployment_rate: Number(formData.unemployment_rate),
        mean_years_education: Number(formData.mean_years_education),
        population_size: Number(formData.population_size),
      };

      const res = await fetch("/api/prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Prediction failed");
      }

      const predicted = data.result || data.poverty_level;
      setResult(predicted);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      year: "",
      ave_income: "",
      expenditure: "",
      unemployment_rate: "",
      mean_years_education: "",
      population_size: "",
      region: "",
    });
    setResult(null);
    setError("");
    setShowVisualization(false);
  };

  const visualizationData = [
    {
      label: "Average Income",
      value: Number(formData.ave_income) || 0,
      max: 500000,
    },
    {
      label: "Expenditure",
      value: Number(formData.expenditure) || 0,
      max: 500000,
    },
    {
      label: "Unemployment Rate",
      value: Number(formData.unemployment_rate) || 0,
      max: 20,
    },
    {
      label: "Mean Years of Education",
      value: Number(formData.mean_years_education) || 0,
      max: 20,
    },
    {
      label: "Population Size",
      value: Number(formData.population_size) || 0,
      max: 5000000,
    },
  ];

  return (
    <UserLayout>
      <div className="bg-slate-50 p-4 sm:p-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#003B95] to-[#002F7A] p-6 text-white shadow-lg">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-white/15 p-3">
                  <Sparkles className="h-6 w-6" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold sm:text-3xl">
                    User Prediction
                  </h1>
                  <p className="mt-2 text-sm text-blue-100 sm:text-base">
                    Test the poverty level prediction using socioeconomic
                    indicators. This is for user testing only and is not saved
                    to the database.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <PredictionForm
              formData={formData}
              onChange={handleChange}
              onSubmit={handlePredict}
              loading={loading}
              onReset={handleReset}
              error={error}
              regionOptions={regionOptions}
            />

            <PredictionResult
              result={result}
              region={formData.region}
              onShowVisualization={() => setShowVisualization(true)}
            />
          </div>
        </div>
      </div>

      {showVisualization && (
        <VisualizationModal
          data={visualizationData}
          result={result}
          formData={formData}
          onClose={() => setShowVisualization(false)}
        />
      )}
    </UserLayout>
  );
}