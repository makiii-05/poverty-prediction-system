export default function SelectField({
  label,
  name,
  value,
  onChange,
  options = [],
  icon,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>

        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#003B95] focus:ring-4 focus:ring-[#003B95]/10"
          required
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}