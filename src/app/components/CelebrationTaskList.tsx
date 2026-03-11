import { useState } from "react";
import type { CelebrationTask } from "../types/employee";
import { loadTasks, toggleTask, getCompletionPercent } from "../utils/celebrationStorage";
import { Checkbox } from "./ui/checkbox";
import { Progress } from "./ui/progress";
import { CalendarDays, User } from "lucide-react";

interface CelebrationTaskListProps {
  employeeId: string;
  year: number;
  milestoneDate: Date;
}

export function CelebrationTaskList({
  employeeId,
  year,
  milestoneDate,
}: CelebrationTaskListProps) {
  const [tasks, setTasks] = useState<CelebrationTask[]>(() =>
    loadTasks(employeeId, year)
  );

  const percent = getCompletionPercent(tasks);

  const handleToggle = (taskId: string) => {
    const updated = toggleTask(employeeId, year, taskId);
    setTasks(updated);
  };

  function getDueDate(daysBefore: number): string {
    const d = new Date(milestoneDate);
    d.setDate(d.getDate() - daysBefore);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Preparation Progress
        </span>
        <span className="text-sm font-semibold text-gray-900">{percent}%</span>
      </div>
      <Progress value={percent} className="h-2" />

      <div className="space-y-3 mt-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
              task.completed
                ? "bg-green-50 border-green-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => handleToggle(task.id)}
              className="mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <p
                className={`font-medium text-sm ${
                  task.completed
                    ? "line-through text-gray-400"
                    : "text-gray-900"
                }`}
              >
                {task.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
              <div className="flex items-center gap-4 mt-1.5">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <User className="w-3 h-3" />
                  {task.owner}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <CalendarDays className="w-3 h-3" />
                  Due {getDueDate(task.dueDaysBeforeMilestone)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
