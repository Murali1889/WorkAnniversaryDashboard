export interface ReminderTemplate {
  label: string;
  team: string;
  daysBefore: number;
  alertLabel: string; // matches Sent Log "Alert Label" column
}

export const BOT_REMINDER_TEMPLATES: ReminderTemplate[] = [
  { label: "PnC — 1 Month Before", team: "PnC", daysBefore: 30, alertLabel: "1 month" },
  { label: "PnC — Weekly", team: "PnC", daysBefore: 7, alertLabel: "Weekly" },
  { label: "Admin — 2 Weeks Before", team: "Admin", daysBefore: 14, alertLabel: "2 weeks" },
  { label: "Admin — 1 Week Before", team: "Admin", daysBefore: 7, alertLabel: "1 week" },
  { label: "RM — 10 Days Before", team: "RM", daysBefore: 10, alertLabel: "10 days" },
  { label: "RM — 1 Week Before", team: "RM", daysBefore: 7, alertLabel: "1 week" },
  { label: "SLT — 1 Week Before", team: "SLT", daysBefore: 7, alertLabel: "1 week" },
];
