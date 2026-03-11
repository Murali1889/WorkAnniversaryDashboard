import { AnniversaryMilestone } from "../types/employee";
import { formatDate, getYearSuffix } from "../utils/anniversaryCalculator";
import { Cake, Briefcase } from "lucide-react";
import { Badge } from "./ui/badge";

interface TimelineMilestoneProps {
  milestone: AnniversaryMilestone;
  isLast?: boolean;
  onClick?: (milestone: AnniversaryMilestone) => void;
}

export function TimelineMilestone({ milestone, isLast = false, onClick }: TimelineMilestoneProps) {
  const { employee, years, date } = milestone;

  const getMilestoneColor = (years: number) => {
    if (years >= 10) return "bg-purple-500";
    if (years >= 5) return "bg-blue-500";
    return "bg-green-500";
  };

  return (
    <div className="relative flex flex-col items-center min-w-[280px]">
      {/* Content Card - positioned above the timeline */}
      <div
        onClick={() => onClick?.(milestone)}
        className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow mb-4 w-full cursor-pointer"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cake className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-gray-900">{employee.name}</h3>
            </div>
            <div
              className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${getMilestoneColor(
                years
              )} text-white font-bold text-sm`}
            >
              {years}
            </div>
          </div>
          <Badge variant="secondary" className="w-fit">
            {getYearSuffix(years)} Anniversary
          </Badge>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Briefcase className="w-4 h-4" />
            <span className="truncate">{employee.position}</span>
          </div>
          <div className="text-xs text-gray-500">{employee.department}</div>
          <p className="text-sm text-gray-500 font-medium">{formatDate(date)}</p>
        </div>
      </div>

      {/* Timeline dot and line */}
      <div className="relative flex items-center">
        <div
          className={`w-4 h-4 rounded-full border-4 border-white ${getMilestoneColor(
            years
          )} z-10 shadow-md`}
        />
        {!isLast && (
          <div className="w-[280px] h-0.5 bg-gray-300 absolute left-4" />
        )}
      </div>
    </div>
  );
}