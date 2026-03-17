import { Search, X } from "lucide-react";
import { monthNames } from "../utils/anniversaryCalculator";

export interface Filters {
  search: string;
  department: string;
  role: string;
  month: string; // "" = all, "0"-"11" = specific month
}

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  departments: string[];
  roles: string[];
}

export function FilterBar({ filters, onChange, departments, roles }: FilterBarProps) {
  const set = (key: keyof Filters, value: string) =>
    onChange({ ...filters, [key]: value });

  const hasFilters = !!(filters.search || filters.department || filters.role || filters.month);

  const clearAll = () =>
    onChange({ search: "", department: "", role: "", month: "" });

  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 mb-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name..."
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
          />
        </div>

        {/* Department */}
        <select
          value={filters.department}
          onChange={(e) => set("department", e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 min-w-[140px]"
        >
          <option value="">All Teams</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        {/* Role */}
        <select
          value={filters.role}
          onChange={(e) => set("role", e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 min-w-[140px]"
        >
          <option value="">All Roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        {/* Month */}
        <select
          value={filters.month}
          onChange={(e) => set("month", e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 min-w-[120px]"
        >
          <option value="">All Months</option>
          {monthNames.map((name, i) => (
            <option key={i} value={String(i)}>{name}</option>
          ))}
        </select>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

export function applyFilters(
  milestones: { employee: { name: string; department: string; position: string }; month: number }[],
  filters: Filters
) {
  let result = milestones;

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((m) => m.employee.name.toLowerCase().includes(q));
  }

  if (filters.department) {
    result = result.filter((m) => m.employee.department === filters.department);
  }

  if (filters.role) {
    result = result.filter((m) => m.employee.position === filters.role);
  }

  if (filters.month) {
    const monthNum = parseInt(filters.month, 10);
    result = result.filter((m) => m.month === monthNum);
  }

  return result;
}
