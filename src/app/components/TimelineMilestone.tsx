import { AnniversaryMilestone } from "../types/employee";
import { getYearSuffix } from "../utils/anniversaryCalculator";
import { Briefcase } from "lucide-react";

interface TimelineMilestoneProps {
  milestone: AnniversaryMilestone;
  isLast?: boolean;
  onClick?: (milestone: AnniversaryMilestone) => void;
}

export function TimelineMilestone({ milestone, isLast = false, onClick }: TimelineMilestoneProps) {
  const { employee, years, date } = milestone;

  const color =
    years >= 10 ? "bg-purple-500" : years >= 5 ? "bg-blue-500" : "bg-green-500";
  const lightBg =
    years >= 10 ? "bg-purple-50" : years >= 5 ? "bg-blue-50" : "bg-green-50";
  const textColor =
    years >= 10 ? "text-purple-700" : years >= 5 ? "text-blue-700" : "text-green-700";

  return (
    <div className="relative flex flex-col items-center min-w-[240px]">
      {/* Card */}
      <div
        onClick={() => onClick?.(milestone)}
        className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-gray-300 transition-all mb-4 w-full cursor-pointer"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{employee.name}</h3>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
              <Briefcase className="w-3 h-3 shrink-0" />
              <span className="truncate">{employee.position}</span>
            </div>
          </div>
          <div className={`w-9 h-9 rounded-lg ${color} text-white font-bold text-sm flex items-center justify-center shrink-0 ml-2`}>
            {years}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${lightBg} ${textColor}`}>
            {getYearSuffix(years)} Anniversary
          </span>
          <span className="text-xs text-gray-400">
            {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
      </div>

      {/* Dot + Line */}
      <div className="relative flex items-center">
        <div className={`w-3.5 h-3.5 rounded-full border-[3px] border-white ${color} z-10 shadow-sm`} />
        {!isLast && (
          <div className="w-[240px] h-[2px] bg-gray-200 absolute left-3.5" />
        )}
      </div>
    </div>
  );
}
