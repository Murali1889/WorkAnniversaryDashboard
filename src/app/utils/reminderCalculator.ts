import type { BotReminder } from "../types/employee";
import { BOT_REMINDER_TEMPLATES } from "../config/botReminders";

export function computeReminders(milestoneDate: Date): BotReminder[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return BOT_REMINDER_TEMPLATES.map((tpl) => {
    const expectedDate = new Date(milestoneDate);
    expectedDate.setDate(expectedDate.getDate() - tpl.daysBefore);
    expectedDate.setHours(0, 0, 0, 0);

    const status: "sent" | "pending" = today >= expectedDate ? "sent" : "pending";

    return {
      label: tpl.label,
      team: tpl.team,
      daysBefore: tpl.daysBefore,
      expectedDate,
      status,
    };
  });
}
