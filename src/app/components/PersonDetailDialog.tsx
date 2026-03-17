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
import { Separator } from "./ui/separator";
import {
  User,
  Briefcase,
  Building2,
  CalendarDays,
  Award,
  Users,
  ClipboardList,
  Bell,
} from "lucide-react";

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
    onToggleTask(
      employee.id,
      employee.name,
      milestone.year,
      years,
      taskId,
      !task?.completed
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{employee.name}</span>
            {award && (
              <Badge className={award.badgeClass}>
                {award.label} — {getYearSuffix(years)}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {employee.position} · {employee.department}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details" className="flex items-center gap-1.5 text-xs">
              <User className="w-3.5 h-3.5" />
              Details
            </TabsTrigger>
            <TabsTrigger value="preparation" className="flex items-center gap-1.5 text-xs">
              <ClipboardList className="w-3.5 h-3.5" />
              Preparation
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-1.5 text-xs">
              <Bell className="w-3.5 h-3.5" />
              Reminders
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="mt-4">
            <div className="space-y-3">
              <DetailRow icon={User} label="Name" value={employee.name} />
              <DetailRow icon={Briefcase} label="Designation" value={employee.position} />
              <DetailRow icon={Building2} label="Team" value={employee.department} />
              <DetailRow icon={Users} label="Reporting Manager" value={employee.reportingTo || "—"} />
              <DetailRow icon={Users} label="SLT" value={slt} />
              <Separator />
              <DetailRow
                icon={CalendarDays}
                label="Date of Joining"
                value={doj.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              />
              <DetailRow
                icon={CalendarDays}
                label="Milestone Date"
                value={formatDate(date)}
              />
              <DetailRow icon={Award} label="Award" value={award?.label || "—"} />
              <DetailRow icon={Award} label="Years" value={`${years}`} />
            </div>
          </TabsContent>

          {/* Preparation Tab */}
          <TabsContent value="preparation" className="mt-4">
            <CelebrationTaskList
              tasks={tasks}
              onToggle={handleToggle}
              milestoneDate={date}
            />
          </TabsContent>

          {/* Reminders Tab */}
          <TabsContent value="reminders" className="mt-4">
            <BotReminderTimeline
              milestoneDate={date}
              employeeId={employee.id}
              milestoneYears={years}
              sentLog={sentLog}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-gray-400 shrink-0" />
      <span className="text-sm text-gray-500 w-36 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}
