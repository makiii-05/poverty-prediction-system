export default function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
  step,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          step={step}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-[#003B95] focus:ring-2 focus:ring-[#003B95]/20"
          required
        />
      </div>
    </div>
  );
}