import type { AnniversaryMilestone, TaskRecord } from "../types/employee";
import { buildTasks, getCompletionPercent, getCompletedCount } from "../utils/celebrationStorage";
import { CELEBRATION_TASK_TEMPLATES } from "../config/celebrationTasks";
import { getYearSuffix, formatDate } from "../utils/anniversaryCalculator";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Check, X, Cake } from "lucide-react";

interface CompletedViewProps {
  milestones: AnniversaryMilestone[];
  taskRecords: TaskRecord[];
  onPersonClick: (milestone: AnniversaryMilestone) => void;
}

export function CompletedView({
  milestones,
  taskRecords,
  onPersonClick,
}: CompletedViewProps) {
  const totalTasks = CELEBRATION_TASK_TEMPLATES.length;

  const rows = milestones.map((m) => {
    const tasks = buildTasks(m.employee.id, m.year, taskRecords);
    const done = getCompletedCount(tasks);
    const percent = getCompletionPercent(tasks);
    return { milestone: m, tasks, done, percent };
  });

  // Sort: completed first, then by completion % descending, then by date
  rows.sort((a, b) => {
    if (a.done === totalTasks && b.done !== totalTasks) return -1;
    if (b.done === totalTasks && a.done !== totalTasks) return 1;
    if (b.percent !== a.percent) return b.percent - a.percent;
    return a.milestone.date.getTime() - b.milestone.date.getTime();
  });

  const completedCount = rows.filter((r) => r.done === totalTasks).length;
  const pendingCount = rows.length - completedCount;

  if (rows.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-200">
        <Cake className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p>No milestones to prepare for</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="flex items-center gap-6 text-sm">
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-gray-600">{completedCount} completed</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="text-gray-600">{pendingCount} pending</span>
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="text-left font-medium text-gray-500 px-4 py-3">Employee</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Milestone</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Date</th>
                {CELEBRATION_TASK_TEMPLATES.map((t) => (
                  <th key={t.id} className="text-center font-medium text-gray-500 px-3 py-3 whitespace-nowrap">
                    {t.label}
                  </th>
                ))}
                <th className="text-center font-medium text-gray-500 px-4 py-3">Progress</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ milestone: m, tasks, done, percent }) => {
                const allDone = done === totalTasks;
                return (
                  <tr
                    key={m.employee.id}
                    onClick={() => onPersonClick(m)}
                    className={`border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${
                      allDone ? "bg-green-50/40" : ""
                    }`}
                  >
                    {/* Employee */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{m.employee.name}</p>
                      <p className="text-xs text-gray-500">{m.employee.department}</p>
                    </td>
                    {/* Milestone */}
                    <td className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className={
                          m.years >= 10
                            ? "bg-purple-100 text-purple-700"
                            : m.years >= 5
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                        }
                      >
                        {getYearSuffix(m.years)}
                      </Badge>
                    </td>
                    {/* Date */}
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {m.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    {/* Task columns */}
                    {tasks.map((task) => (
                      <td key={task.id} className="px-3 py-3 text-center">
                        {task.completed ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
                            <Check className="w-3.5 h-3.5 text-green-600" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100">
                            <X className="w-3.5 h-3.5 text-gray-400" />
                          </span>
                        )}
                      </td>
                    ))}
                    {/* Progress */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-[80px]">
                        <Progress value={percent} className="h-1.5 flex-1" />
                        <span className={`text-xs font-medium whitespace-nowrap ${
                          allDone ? "text-green-600" : "text-gray-500"
                        }`}>
                          {done}/{totalTasks}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
