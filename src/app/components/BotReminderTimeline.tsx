import type { BotReminder } from "../types/employee";
import { computeReminders } from "../utils/reminderCalculator";
import { Badge } from "./ui/badge";

interface BotReminderTimelineProps {
  milestoneDate: Date;
}

export function BotReminderTimeline({ milestoneDate }: BotReminderTimelineProps) {
  const reminders = computeReminders(milestoneDate);

  function formatDate(d: Date): string {
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-1">
      <p className="text-sm text-gray-500 mb-4">
        Bot reminder schedule based on milestone date. Status is computed from
        today's date.
      </p>
      <div className="relative">
        {reminders.map((r: BotReminder, i: number) => (
          <div key={i} className="flex items-start gap-4 relative pb-6 last:pb-0">
            {/* Vertical line */}
            {i < reminders.length - 1 && (
              <div
                className="absolute left-[9px] top-5 w-0.5 h-full bg-gray-200"
                aria-hidden
              />
            )}
            {/* Dot */}
            <div
              className={`w-[18px] h-[18px] rounded-full border-2 shrink-0 mt-0.5 ${
                r.status === "sent"
                  ? "bg-green-500 border-green-600"
                  : "bg-gray-200 border-gray-300"
              }`}
            />
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm text-gray-900">
                  {r.label}
                </span>
                <Badge
                  variant="outline"
                  className={
                    r.status === "sent"
                      ? "bg-green-100 text-green-700 border-green-300"
                      : "bg-gray-100 text-gray-500 border-gray-300"
                  }
                >
                  {r.status === "sent" ? "Sent" : "Pending"}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Expected: {formatDate(r.expectedDate)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
