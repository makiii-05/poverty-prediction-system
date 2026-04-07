import { useState } from "react";
import {
  LayoutDashboard,
  MapPin,
  TrendingUp,
  FileText,
  X,
  BarChart3,
  ChevronDown,
  Map,
  ChartColumn,
  ChartSpline,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

export default function UserSidebar({ isOpen, onClose }) {
  const location = useLocation();

  const [openDropdown, setOpenDropdown] = useState(() =>
    location.pathname.startsWith("/visualization")
  );

  const menu = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Regional Data", icon: MapPin, path: "/data" },
    { label: "Predictions", icon: TrendingUp, path: "/predictions" },
  ];

  const visualizationItems = [
    { label: "Map", icon: Map, path: "/visualization/map" },
    { label: "Bar Chart", icon: ChartColumn, path: "/visualization/bar-chart" },
    { label: "Line Chart", icon: ChartSpline, path: "/visualization/line-chart" },
  ];

  const isVisualizationActive =
    location.pathname.startsWith("/visualization");

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-[260px] border-r bg-white px-4 py-6 transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between lg:block">
          <p className="px-3 text-xs font-semibold tracking-wide text-slate-500">
            USER MENU
          </p>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition ${
                    isActive
                      ? "bg-[#003B95] text-white shadow-sm"
                      : "text-slate-700 hover:bg-[#E8EEF9]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-5 w-5 ${
                        isActive ? "text-white" : "text-slate-500"
                      }`}
                    />
                    {item.label}
                  </>
                )}
              </NavLink>
            );
          })}

          {/* Visualization Dropdown */}
          <div className="rounded-xl">
            <button
              type="button"
              onClick={() => setOpenDropdown((prev) => !prev)}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-[15px] font-medium transition ${
                isVisualizationActive
                  ? "bg-[#003B95] text-white shadow-sm"
                  : "text-slate-700 hover:bg-[#E8EEF9]"
              }`}
            >
              <div className="flex items-center gap-3">
                <BarChart3
                  className={`h-5 w-5 ${
                    isVisualizationActive ? "text-white" : "text-slate-500"
                  }`}
                />
                <span>Visualization</span>
              </div>

              <ChevronDown
                className={`h-4 w-4 transition-transform duration-300 ${
                  openDropdown ? "rotate-180" : ""
                } ${isVisualizationActive ? "text-white" : "text-slate-500"}`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openDropdown ? "mt-2 max-h-60 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="ml-4 flex flex-col gap-2 border-l border-slate-200 pl-3">
                {visualizationItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                          isActive
                            ? "bg-[#E8EEF9] text-[#003B95]"
                            : "text-slate-600 hover:bg-slate-100"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            className={`h-4 w-4 ${
                              isActive ? "text-[#003B95]" : "text-slate-500"
                            }`}
                          />
                          {item.label}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}