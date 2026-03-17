import type { CelebrationTask, TaskRecord } from "../types/employee";
import { CELEBRATION_TASK_TEMPLATES } from "../config/celebrationTasks";

export function buildTasks(
  employeeId: string,
  year: number,
  taskRecords: TaskRecord[]
): CelebrationTask[] {
  const record = taskRecords.find(
    (r) => r.employeeId === employeeId && r.year === year
  );

  return CELEBRATION_TASK_TEMPLATES.map((t) => ({
    id: t.id,
    label: t.label,
    description: t.description,
    owner: t.owner,
    dueDaysBeforeMilestone: t.dueDaysBeforeMilestone,
    completed: record?.tasks[t.id] ?? false,
  }));
}

export function getCompletionPercent(tasks: CelebrationTask[]): number {
  if (tasks.length === 0) return 0;
  return Math.round(
    (tasks.filter((t) => t.completed).length / tasks.length) * 100
  );
}

export function getCompletedCount(tasks: CelebrationTask[]): number {
  return tasks.filter((t) => t.completed).length;
}
