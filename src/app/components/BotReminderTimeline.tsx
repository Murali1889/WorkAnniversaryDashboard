import type { BotReminder, SentLogEntry } from "../types/employee";
import { computeReminders } from "../utils/reminderCalculator";
import { Check, X, Clock } from "lucide-react";

interface BotReminderTimelineProps {
  milestoneDate: Date;
  employeeId: string;
  milestoneYears: number;
  sentLog: SentLogEntry[];
}

export function BotReminderTimeline({
  milestoneDate,
  employeeId,
  milestoneYears,
  sentLog,
}: BotReminderTimelineProps) {
  const reminders = computeReminders(milestoneDate, employeeId, milestoneYears, sentLog);

  const sent = reminders.filter((r) => r.status === "sent").length;
  const overdue = reminders.filter((r) => r.status === "overdue").length;

  return (
    <div>
      {/* Summary */}
      <div className="flex items-center gap-4 text-xs mb-4">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          {sent} sent
        </span>
        {overdue > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            {overdue} not sent
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gray-300" />
          {reminders.length - sent - overdue} pending
        </span>
      </div>

      {/* List */}
      <div className="rounded-lg border border-gray-200 overflow-hidden divide-y divide-gray-100">
        {reminders.map((r: BotReminder, i: number) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-4 py-2.5 ${
              r.status === "sent" ? "bg-green-50/40" : r.status === "overdue" ? "bg-red-50/40" : ""
            }`}
          >
            {/* Status icon */}
            {r.status === "sent" ? (
              <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-green-600" />
              </span>
            ) : r.status === "overdue" ? (
              <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <X className="w-3.5 h-3.5 text-red-500" />
              </span>
            ) : (
              <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
              </span>
            )}
            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{r.label}</p>
            </div>
            {/* Date + Status */}
            <div className="text-right shrink-0">
              <p className={`text-[10px] font-medium uppercase tracking-wide ${
                r.status === "sent" ? "text-green-600" : r.status === "overdue" ? "text-red-500" : "text-gray-400"
              }`}>
                {r.status === "sent" ? "Sent" : r.status === "overdue" ? "Not Sent" : "Pending"}
              </p>
              <p className="text-[10px] text-gray-400">
                {r.expectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
