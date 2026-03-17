import { AnniversaryMilestone } from "../types/employee";
import { monthNames, getYearSuffix } from "../utils/anniversaryCalculator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Badge } from "./ui/badge";

interface MonthlyAccordionProps {
  month: number;
  milestones: AnniversaryMilestone[];
  year: number;
  onPersonClick?: (milestone: AnniversaryMilestone) => void;
}

export function MonthlyAccordion({
  month,
  milestones,
  year,
  onPersonClick,
}: MonthlyAccordionProps) {
  const monthName = monthNames[month];
  const now = new Date();
  const isCurrentMonth = now.getMonth() === month && now.getFullYear() === year;
  const isPast = new Date(year, month + 1, 0) < now;

  return (
    <Accordion type="single" collapsible defaultValue={isCurrentMonth ? `month-${month}` : undefined} className="w-full">
      <AccordionItem value={`month-${month}`} className="bg-white border border-gray-200 rounded-xl mb-3 overflow-hidden">
        <AccordionTrigger className="px-5 py-3.5 hover:no-underline hover:bg-gray-50/50">
          <div className="flex items-center gap-3 w-full">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
              isCurrentMonth
                ? "bg-indigo-600 text-white"
                : isPast
                  ? "bg-gray-100 text-gray-400"
                  : "bg-gray-100 text-gray-600"
            }`}>
              {monthName.slice(0, 3)}
            </div>
            <div className="flex-1 text-left">
              <h3 className={`font-semibold text-sm ${isPast && !isCurrentMonth ? "text-gray-400" : "text-gray-900"}`}>
                {monthName} {year}
                {isCurrentMonth && (
                  <span className="ml-2 text-xs font-normal text-indigo-600">Current</span>
                )}
              </h3>
              <p className="text-xs text-gray-500">
                {milestones.length} {milestones.length === 1 ? "celebration" : "celebrations"}
              </p>
            </div>
            <Badge variant="secondary" className="mr-3 text-xs">
              {milestones.length}
            </Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-5 pb-4">
          <div className="space-y-2 pt-1">
            {milestones.map((milestone) => {
              const isPastDate = milestone.date < now;
              return (
                <div
                  key={milestone.employee.id}
                  onClick={() => onPersonClick?.(milestone)}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                      milestone.years >= 10 ? "bg-purple-500" : milestone.years >= 5 ? "bg-blue-500" : "bg-green-500"
                    }`}>
                      {milestone.years}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {milestone.employee.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {milestone.employee.position} · {milestone.employee.department}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-xs text-gray-400">
                      {milestone.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    {isPastDate && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400">Done</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
