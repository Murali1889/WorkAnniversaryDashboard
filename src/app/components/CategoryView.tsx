import type { AnniversaryMilestone, AwardCategory } from "../types/employee";
import { AWARD_CATEGORIES } from "../config/awards";
import { groupMilestonesByCategory, getYearSuffix } from "../utils/anniversaryCalculator";
import { Badge } from "./ui/badge";
import { Award } from "lucide-react";

interface CategoryViewProps {
  milestones: AnniversaryMilestone[];
  onPersonClick: (milestone: AnniversaryMilestone) => void;
}

export function CategoryView({ milestones, onPersonClick }: CategoryViewProps) {
  const grouped = groupMilestonesByCategory(milestones);

  if (milestones.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-200">
        <Award className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p>No award milestones this year</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {AWARD_CATEGORIES.map((cat) => {
        const items = grouped.get(cat.key as AwardCategory) || [];
        return (
          <div key={cat.key} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className={`flex items-center gap-3 px-5 py-3 border-b border-gray-100 ${cat.bgColor}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white ${
                cat.key === "builders" ? "bg-green-500"
                  : cat.key === "stewards" ? "bg-blue-500"
                    : cat.key === "anchors" ? "bg-amber-500"
                      : "bg-purple-500"
              }`}>
                {cat.years}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold text-sm ${cat.color}`}>{cat.label}</h3>
                <p className="text-xs text-gray-500">{cat.years}-year milestone</p>
              </div>
              <Badge variant="secondary" className="text-xs">{items.length}</Badge>
            </div>

            {/* List */}
            {items.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {items.map((m) => (
                  <div
                    key={m.employee.id}
                    onClick={() => onPersonClick(m)}
                    className="flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900">{m.employee.name}</p>
                      <p className="text-xs text-gray-500">{m.employee.position} · {m.employee.department}</p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 ml-3">
                      {m.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-gray-400 py-8">
                No {cat.label.toLowerCase()} this year
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
