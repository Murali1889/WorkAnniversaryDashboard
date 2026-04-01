import { Employee, AnniversaryMilestone } from "../types/employee";
import { calculateAnniversaries, monthNames } from "../utils/anniversaryCalculator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Badge } from "./ui/badge";

interface YearlyViewProps {
  employees: Employee[];
  onPersonClick?: (milestone: AnniversaryMilestone) => void;
  searchQuery?: string;
  filterDept?: string;
  filterRole?: string;
  filterMonth?: string;
}

export function YearlyView({
  employees,
  onPersonClick,
  searchQuery,
  filterDept,
  filterRole,
  filterMonth,
}: YearlyViewProps) {
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3];
  const now = new Date();

  return (
    <div className="space-y-4">
      {years.map((year) => {
        let milestones = calculateAnniversaries(employees, year);

        // Apply filters
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          milestones = milestones.filter((m) => m.employee.name.toLowerCase().includes(q));
        }
        if (filterDept) {
          milestones = milestones.filter((m) => m.employee.department === filterDept);
        }
        if (filterRole) {
          milestones = milestones.filter((m) => m.employee.position === filterRole);
        }
        if (filterMonth) {
          const monthNum = parseInt(filterMonth, 10);
          milestones = milestones.filter((m) => m.month === monthNum);
        }

        const isCurrentYear = year === currentYear;

        // Group by month
        const byMonth = new Map<number, AnniversaryMilestone[]>();
        for (const m of milestones) {
          if (!byMonth.has(m.month)) byMonth.set(m.month, []);
          byMonth.get(m.month)!.push(m);
        }
        const sortedMonths = Array.from(byMonth.keys()).sort((a, b) => a - b);

        return (
          <Accordion
            key={year}
            type="single"
            collapsible
            defaultValue={isCurrentYear ? `year-${year}` : undefined}
            className="w-full"
          >
            <AccordionItem
              value={`year-${year}`}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden"
            >
              <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-gray-50/50">
                <div className="flex items-center gap-3 w-full">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-base font-bold ${
                      isCurrentYear
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {year}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-900">
                      {year}
                      {isCurrentYear && (
                        <span className="ml-2 text-xs font-normal text-indigo-600">
                          Current Year
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {milestones.length}{" "}
                      {milestones.length === 1 ? "milestone" : "milestones"}{" "}
                      across {sortedMonths.length}{" "}
                      {sortedMonths.length === 1 ? "month" : "months"}
                    </p>
                  </div>
                  <Badge variant="secondary" className="mr-3 text-sm">
                    {milestones.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-4">
                {milestones.length === 0 ? (
                  <p className="text-sm text-gray-400 italic py-3">
                    No milestone anniversaries in {year}
                  </p>
                ) : (
                  <div className="space-y-4 pt-1">
                    {sortedMonths.map((month) => {
                      const monthMilestones = byMonth.get(month)!;
                      const isPastMonth =
                        year < currentYear ||
                        (year === currentYear && month < now.getMonth());

                      return (
                        <div key={month}>
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`text-xs font-semibold uppercase tracking-wide ${
                                isPastMonth ? "text-gray-300" : "text-gray-500"
                              }`}
                            >
                              {monthNames[month]}
                            </span>
                            <span className="text-xs text-gray-300">
                              ({monthMilestones.length})
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {monthMilestones.map((milestone) => {
                              const isPastDate = milestone.date < now;
                              return (
                                <div
                                  key={`${milestone.employee.id}-${milestone.years}`}
                                  onClick={() => onPersonClick?.(milestone)}
                                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                                        milestone.years >= 10
                                          ? "bg-purple-500"
                                          : milestone.years >= 5
                                          ? "bg-blue-500"
                                          : "bg-green-500"
                                      }`}
                                    >
                                      {milestone.years}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-medium text-sm text-gray-900 truncate">
                                        {milestone.employee.name}
                                      </p>
                                      <p className="text-xs text-gray-500 truncate">
                                        {milestone.employee.position} ·{" "}
                                        {milestone.employee.department}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0 ml-3">
                                    <span className="text-xs text-gray-400">
                                      {milestone.date.toLocaleDateString(
                                        "en-US",
                                        { month: "short", day: "numeric" }
                                      )}
                                    </span>
                                    {isPastDate && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400">
                                        Done
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      })}
    </div>
  );
}
