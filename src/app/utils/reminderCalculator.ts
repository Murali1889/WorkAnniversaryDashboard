import type { BotReminder, SentLogEntry } from "../types/employee";
import { BOT_REMINDER_TEMPLATES } from "../config/botReminders";

export function computeReminders(
  milestoneDate: Date,
  employeeId: string,
  milestoneYears: number,
  sentLog: SentLogEntry[]
): BotReminder[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter sent log entries for this employee + milestone
  const relevant = sentLog.filter(
    (entry) =>
      entry.employeeId === employeeId &&
      entry.milestone === milestoneYears
  );

  return BOT_REMINDER_TEMPLATES.map((tpl) => {
    const expectedDate = new Date(milestoneDate);
    expectedDate.setDate(expectedDate.getDate() - tpl.daysBefore);
    expectedDate.setHours(0, 0, 0, 0);

    // Check if there's a matching Sent Log entry (Delivered) for this team + alert label
    const match = relevant.find(
      (entry) =>
        entry.team === tpl.team &&
        entry.alertLabel === tpl.alertLabel &&
        entry.status === "Delivered"
    );

    let status: "sent" | "pending" | "overdue";
    if (match) {
      status = "sent";
    } else if (today > expectedDate) {
      status = "overdue";
    } else {
      status = "pending";
    }

    return {
      label: tpl.label,
      team: tpl.team,
      daysBefore: tpl.daysBefore,
      expectedDate,
      status,
    };
  });
}
