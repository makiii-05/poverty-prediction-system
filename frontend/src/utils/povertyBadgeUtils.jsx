import React from "react";

export const getPovertyBadgeStyle = (level) => {
  switch (level?.toLowerCase()) {
    case "low":
      return {
        badge:
          "border border-green-200 bg-green-50 text-green-700 shadow-green-100",
        dot: "bg-green-500",
      };
    case "moderate":
      return {
        badge:
          "border border-yellow-200 bg-yellow-50 text-yellow-700 shadow-yellow-100",
        dot: "bg-yellow-500",
      };
    case "high":
      return {
        badge:
          "border border-red-200 bg-red-50 text-red-700 shadow-red-100",
        dot: "bg-red-500",
      };
    default:
      return {
        badge:
          "border border-slate-200 bg-slate-50 text-slate-700 shadow-slate-100",
        dot: "bg-slate-400",
      };
  }
};

export const highlightText = (text, keyword) => {
  if (!keyword?.trim()) return text;

  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedKeyword})`, "gi");

  return String(text)
    .split(regex)
    .map((part, index) =>
      part.toLowerCase() === keyword.toLowerCase() ? (
        <span
          key={index}
          className="rounded bg-[#003B95]/20 px-[2px] font-semibold text-[#003B95]"
        >
          {part}
        </span>
      ) : (
        part
      )
    );
};

export const PovertyBadge = ({ level, search }) => {
  const style = getPovertyBadgeStyle(level);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-sm ${style.badge}`}
    >
      <span className={`h-2 w-2 rounded-full ${style.dot}`} />
      {highlightText(level, search)}
    </span>
  );
};