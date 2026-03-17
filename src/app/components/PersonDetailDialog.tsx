import { useState } from "react";
import type { AnniversaryMilestone, SentLogEntry, TaskRecord } from "../types/employee";
import { getAwardCategory } from "../config/awards";
import { getSltForDepartment } from "../config/sltMapping";
import { formatDate, getYearSuffix } from "../utils/anniversaryCalculator";
import { buildTasks } from "../utils/celebrationStorage";
import { CelebrationTaskList } from "./CelebrationTaskList";
import { BotReminderTimeline } from "./BotReminderTimeline";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";

interface PersonDetailDialogProps {
  milestone: AnniversaryMilestone | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sentLog: SentLogEntry[];
  taskRecords: TaskRecord[];
  onToggleTask: (
    employeeId: string,
    employeeName: string,
    year: number,
    milestone: number,
    taskId: string,
    completed: boolean
  ) => void;
}

export function PersonDetailDialog({
  milestone,
  open,
  onOpenChange,
  sentLog,
  taskRecords,
  onToggleTask,
}: PersonDetailDialogProps) {
  const [activeTab, setActiveTab] = useState("details");

  if (!milestone) return null;

  const { employee, years, date } = milestone;
  const award = getAwardCategory(years);
  const slt = getSltForDepartment(employee.department);
  const doj = new Date(employee.startDate);

  const tasks = buildTasks(employee.id, milestone.year, taskRecords);

  const handleToggle = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    onToggleTask(employee.id, employee.name, milestone.year, years, taskId, !task?.completed);
  };

  const details = [
    { label: "Designation", value: employee.position },
    { label: "Department", value: employee.department },
    { label: "Reporting Manager", value: employee.reportingTo || "—" },
    { label: "SLT", value: slt },
    { label: "Date of Joining", value: doj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) },
    { label: "Milestone Date", value: formatDate(date) },
    { label: "Award Category", value: award?.label || "—" },
    { label: "Years Completed", value: String(years) },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {employee.name}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 mt-1">
              <span>{employee.position} · {employee.department}</span>
              {award && (
                <Badge className={`${award.badgeClass} text-[10px]`}>
                  {award.label} — {getYearSuffix(years)}
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="inline-flex h-9 bg-gray-100 rounded-lg p-0.5 mb-4">
              <TabsTrigger value="details" className="text-xs px-3 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Details
              </TabsTrigger>
              <TabsTrigger value="preparation" className="text-xs px-3 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Preparation
              </TabsTrigger>
              <TabsTrigger value="reminders" className="text-xs px-3 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Bot Reminders
              </TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="mt-0">
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                {details.map((row, i) => (
                  <div
                    key={row.label}
                    className={`flex items-center justify-between px-4 py-2.5 text-sm ${
                      i % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                    }`}
                  >
                    <span className="text-gray-500">{row.label}</span>
                    <span className="font-medium text-gray-900 text-right">{row.value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Preparation Tab */}
            <TabsContent value="preparation" className="mt-0">
              <CelebrationTaskList
                tasks={tasks}
                onToggle={handleToggle}
                milestoneDate={date}
              />
            </TabsContent>

            {/* Reminders Tab */}
            <TabsContent value="reminders" className="mt-0">
              <BotReminderTimeline
                milestoneDate={date}
                employeeId={employee.id}
                milestoneYears={years}
                sentLog={sentLog}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
