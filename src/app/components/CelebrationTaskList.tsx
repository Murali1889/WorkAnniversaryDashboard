import type { CelebrationTask } from "../types/employee";
import { getCompletionPercent } from "../utils/celebrationStorage";
import { Checkbox } from "./ui/checkbox";
import { Progress } from "./ui/progress";

interface CelebrationTaskListProps {
  tasks: CelebrationTask[];
  onToggle: (taskId: string) => void;
  milestoneDate: Date;
}

export function CelebrationTaskList({
  tasks,
  onToggle,
  milestoneDate,
}: CelebrationTaskListProps) {
  const percent = getCompletionPercent(tasks);
  const done = tasks.filter((t) => t.completed).length;

  function getDueDate(daysBefore: number): string {
    const d = new Date(milestoneDate);
    d.setDate(d.getDate() - daysBefore);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center gap-3 mb-4">
        <Progress value={percent} className="h-2 flex-1" />
        <span className={`text-xs font-semibold ${percent === 100 ? "text-green-600" : "text-gray-500"}`}>
          {done}/{tasks.length}
        </span>
      </div>

      {/* Tasks */}
      <div className="rounded-lg border border-gray-200 overflow-hidden divide-y divide-gray-100">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-3 px-4 py-3 transition-colors ${
              task.completed ? "bg-green-50/40" : ""
            }`}
          >
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => onToggle(task.id)}
            />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${task.completed ? "line-through text-gray-400" : "text-gray-900"}`}>
                {task.label}
              </p>
              <p className="text-xs text-gray-500">{task.owner} · Due {getDueDate(task.dueDaysBeforeMilestone)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
