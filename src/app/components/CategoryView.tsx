import type { AnniversaryMilestone, AwardCategory } from "../types/employee";
import { AWARD_CATEGORIES } from "../config/awards";
import { groupMilestonesByCategory, getYearSuffix } from "../utils/anniversaryCalculator";
import { Badge } from "./ui/badge";
import { Cake, Briefcase, Users } from "lucide-react";

interface CategoryViewProps {
  milestones: AnniversaryMilestone[];
  onPersonClick: (milestone: AnniversaryMilestone) => void;
}

export function CategoryView({ milestones, onPersonClick }: CategoryViewProps) {
  const grouped = groupMilestonesByCategory(milestones);

  return (
    <div className="space-y-8">
      {AWARD_CATEGORIES.map((cat) => {
        const items = grouped.get(cat.key as AwardCategory) || [];
        return (
          <div key={cat.key}>
            {/* Category Header */}
            <div
              className={`flex items-center gap-3 p-4 rounded-t-xl border ${cat.borderColor} ${cat.bgColor}`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${cat.badgeClass} font-bold text-lg`}
              >
                {cat.years}
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${cat.color}`}>
                  {cat.label}
                </h3>
                <p className="text-sm text-gray-500">
                  {cat.years}-year milestone
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                {items.length}
              </div>
            </div>

            {/* Employee Cards */}
            <div
              className={`border border-t-0 ${cat.borderColor} rounded-b-xl p-4`}
            >
              {items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((m) => (
                    <div
                      key={m.employee.id}
                      onClick={() => onPersonClick(m)}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-white hover:shadow-md hover:border-gray-200 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-center w-9 h-9 bg-orange-100 rounded-full shrink-0">
                        <Cake className="w-4 h-4 text-orange-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {m.employee.name}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Briefcase className="w-3 h-3 shrink-0" />
                          <span className="truncate">{m.employee.position}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {m.date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <Badge className={`${cat.badgeClass} shrink-0`}>
                        {getYearSuffix(m.years)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-gray-400 py-6">
                  No {cat.label.toLowerCase()} this year
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
