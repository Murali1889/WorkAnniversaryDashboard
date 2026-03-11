export interface ReminderTemplate {
  label: string;
  team: string;
  daysBefore: number;
}

export const BOT_REMINDER_TEMPLATES: ReminderTemplate[] = [
  { label: "PnC — 1 Month Before", team: "PnC", daysBefore: 30 },
  { label: "PnC — Weekly", team: "PnC", daysBefore: 7 },
  { label: "Admin — 2 Weeks Before", team: "Admin", daysBefore: 14 },
  { label: "Admin — 1 Week Before", team: "Admin", daysBefore: 7 },
  { label: "RM — 10 Days Before", team: "RM", daysBefore: 10 },
  { label: "RM — 1 Week Before", team: "RM", daysBefore: 7 },
  { label: "SLT — 1 Week Before", team: "SLT", daysBefore: 7 },
];
