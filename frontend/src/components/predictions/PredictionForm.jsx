import {
  MapPin,
  CalendarDays,
  Wallet,
  Receipt,
  Briefcase,
  GraduationCap,
  Users,
} from "lucide-react";
import InputField from "./InputField";
import SelectField from "./SelectedField";

export default function PredictionForm({
  formData,
  onChange,
  onSubmit,
  loading,
  onReset,
  error,
  regionOptions,
}) {
  return (
    <div className="lg:col-span-2">
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-800">Prediction Form</h2>
          <p className="mt-1 text-sm text-slate-500">
            Fill in the indicators below and select one region to generate a
            prediction.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            label="Year"
            name="year"
            type="number"
            value={formData.year}
            onChange={onChange}
            placeholder="e.g. 2026"
            icon={<CalendarDays className="h-4 w-4" />}
          />

          <SelectField
            label="Region"
            name="region"
            value={formData.region}
            onChange={onChange}
            icon={<MapPin className="h-4 w-4" />}
            options={regionOptions}
          />

          <InputField
            label="Average Income"
            name="ave_income"
            type="number"
            value={formData.ave_income}
            onChange={onChange}
            placeholder="e.g. 200000"
            icon={<Wallet className="h-4 w-4" />}
          />

          <InputField
            label="Expenditure"
            name="expenditure"
            type="number"
            value={formData.expenditure}
            onChange={onChange}
            placeholder="e.g. 150000"
            icon={<Receipt className="h-4 w-4" />}
          />

          <InputField
            label="Unemployment Rate"
            name="unemployment_rate"
            type="number"
            step="any"
            value={formData.unemployment_rate}
            onChange={onChange}
            placeholder="e.g. 8.5"
            icon={<Briefcase className="h-4 w-4" />}
          />

          <InputField
            label="Mean Years of Education"
            name="mean_years_education"
            type="number"
            step="any"
            value={formData.mean_years_education}
            onChange={onChange}
            placeholder="e.g. 10"
            icon={<GraduationCap className="h-4 w-4" />}
          />

          <div className="md:col-span-2">
            <InputField
              label="Population Size"
              name="population_size"
              type="number"
              value={formData.population_size}
              onChange={onChange}
              placeholder="e.g. 2000000"
              icon={<Users className="h-4 w-4" />}
            />
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl bg-[#003B95] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#002F7A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Predicting..." : "Predict"}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}