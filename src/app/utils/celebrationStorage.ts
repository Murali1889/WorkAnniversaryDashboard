import type { CelebrationTask } from "../types/employee";
import { CELEBRATION_TASK_TEMPLATES } from "../config/celebrationTasks";

const STORAGE_KEY = "anniversary-celebrations";

interface StorageData {
  [key: string]: CelebrationTask[]; // key = "{employeeId}|{year}"
}

function storageKey(employeeId: string, year: number): string {
  return `${employeeId}|${year}`;
}

function readAll(): StorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(data: StorageData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadTasks(employeeId: string, year: number): CelebrationTask[] {
  const data = readAll();
  const key = storageKey(employeeId, year);
  if (data[key]) return data[key];

  // Auto-generate from templates on first access
  const tasks: CelebrationTask[] = CELEBRATION_TASK_TEMPLATES.map((t) => ({
    id: t.id,
    label: t.label,
    description: t.description,
    owner: t.owner,
    dueDaysBeforeMilestone: t.dueDaysBeforeMilestone,
    completed: false,
  }));

  data[key] = tasks;
  writeAll(data);
  return tasks;
}

export function toggleTask(
  employeeId: string,
  year: number,
  taskId: string
): CelebrationTask[] {
  const data = readAll();
  const key = storageKey(employeeId, year);
  const tasks = data[key] || loadTasks(employeeId, year);

  const updated = tasks.map((t) =>
    t.id === taskId ? { ...t, completed: !t.completed } : t
  );
  data[key] = updated;
  writeAll(data);
  return updated;
}

export function getCompletionPercent(tasks: CelebrationTask[]): number {
  if (tasks.length === 0) return 0;
  return Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100);
}
