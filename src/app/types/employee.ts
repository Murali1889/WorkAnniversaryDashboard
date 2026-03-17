export interface Employee {
  id: string;
  name: string;
  position: string;
  startDate: string; // Format: YYYY-MM-DD
  department: string;
  reportingTo: string;
}

export interface AnniversaryMilestone {
  employee: Employee;
  years: number;
  date: Date;
  month: number;
  year: number;
}

export interface CelebrationTask {
  id: string;
  label: string;
  description: string;
  owner: string;
  dueDaysBeforeMilestone: number;
  completed: boolean;
}

export interface CelebrationRecord {
  employeeId: string;
  year: number;
  tasks: CelebrationTask[];
}

export interface BotReminder {
  label: string;
  team: string;
  daysBefore: number;
  expectedDate: Date;
  status: "sent" | "pending" | "overdue";
}

export type AwardCategory = "builders" | "stewards" | "anchors" | "legacy";

export interface TaskRecord {
  employeeId: string;
  employeeName: string;
  year: number;
  milestone: number;
  tasks: Record<string, boolean>;
  updatedAt: string;
}

export interface SentLogEntry {
  logKey: string;
  sentAt: string;
  employeeId: string;
  employeeName: string;
  department: string;
  milestone: number;
  team: string;
  alertLabel: string;
  anniversaryDate: string;
  daysUntil: number;
  recipient: string;
  status: string;
}
