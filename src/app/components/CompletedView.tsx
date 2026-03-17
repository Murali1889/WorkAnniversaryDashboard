import type { AnniversaryMilestone, TaskRecord } from "../types/employee";
import { buildTasks, getCompletionPercent, getCompletedCount } from "../utils/celebrationStorage";
import { CELEBRATION_TASK_TEMPLATES } from "../config/celebrationTasks";
import { getYearSuffix } from "../utils/anniversaryCalculator";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Cake, Briefcase, CheckCircle2, Clock, Circle } from "lucide-react";

interface CompletedViewProps {
  milestones: AnniversaryMilestone[];
  taskRecords: TaskRecord[];
  onPersonClick: (milestone: AnniversaryMilestone) => void;
}

type StatusGroup = "completed" | "in-progress" | "not-started";

export function CompletedView({
  milestones,
  taskRecords,
  onPersonClick,
}: CompletedViewProps) {
  const totalTasks = CELEBRATION_TASK_TEMPLATES.length;

  const grouped: Record<StatusGroup, { milestone: AnniversaryMilestone; percent: number; done: number }[]> = {
    completed: [],
    "in-progress": [],
    "not-started": [],
  };

  for (const m of milestones) {
    const tasks = buildTasks(m.employee.id, m.year, taskRecords);
    const done = getCompletedCount(tasks);
    const percent = getCompletionPercent(tasks);

    const entry = { milestone: m, percent, done };
    if (done === totalTasks) grouped.completed.push(entry);
    else if (done > 0) grouped["in-progress"].push(entry);
    else grouped["not-started"].push(entry);
  }

  const sections: {
    key: StatusGroup;
    label: string;
    icon: typeof CheckCircle2;
    color: string;
    badgeClass: string;
    borderColor: string;
    bgColor: string;
  }[] = [
    {
      key: "completed",
      label: "Completed",
      icon: CheckCircle2,
      color: "text-green-700",
      badgeClass: "bg-green-100 text-green-700",
      borderColor: "border-green-200",
      bgColor: "bg-green-50",
    },
    {
      key: "in-progress",
      label: "In Progress",
      icon: Clock,
      color: "text-amber-700",
      badgeClass: "bg-amber-100 text-amber-700",
      borderColor: "border-amber-200",
      bgColor: "bg-amber-50",
    },
    {
      key: "not-started",
      label: "Not Started",
      icon: Circle,
      color: "text-gray-500",
      badgeClass: "bg-gray-100 text-gray-500",
      borderColor: "border-gray-200",
      bgColor: "bg-gray-50",
    },
  ];

  return (
    <div className="space-y-8">
      {sections.map((sec) => {
        const items = grouped[sec.key];
        const Icon = sec.icon;
        return (
          <div key={sec.key}>
            {/* Section Header */}
            <div
              className={`flex items-center gap-3 p-4 rounded-t-xl border ${sec.borderColor} ${sec.bgColor}`}
            >
              <Icon className={`w-6 h-6 ${sec.color}`} />
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${sec.color}`}>
                  {sec.label}
                </h3>
                <p className="text-sm text-gray-500">
                  {items.length} {items.length === 1 ? "employee" : "employees"}
                </p>
              </div>
              <Badge className={sec.badgeClass}>{items.length}</Badge>
            </div>

            {/* Cards */}
            <div className={`border border-t-0 ${sec.borderColor} rounded-b-xl p-4`}>
              {items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map(({ milestone: m, percent, done }) => (
                    <div
                      key={m.employee.id}
                      onClick={() => onPersonClick(m)}
                      className="p-3 rounded-lg border border-gray-100 bg-white hover:shadow-md hover:border-gray-200 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-9 h-9 bg-orange-100 rounded-full shrink-0">
                          <Cake className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {m.employee.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Briefcase className="w-3 h-3 shrink-0" />
                            <span className="truncate">{m.employee.department}</span>
                          </div>
                        </div>
                        <Badge className={sec.badgeClass}>
                          {getYearSuffix(m.years)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={percent} className="h-1.5 flex-1" />
                        <span className="text-xs text-gray-500 shrink-0">
                          {done}/{totalTasks}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-gray-400 py-6">
                  No employees in this category
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
