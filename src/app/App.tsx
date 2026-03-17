import { useState, useEffect } from "react";
import { Employee, AnniversaryMilestone, SentLogEntry, TaskRecord } from "./types/employee";
import {
  calculateAnniversaries,
  groupMilestonesByMonth,
} from "./utils/anniversaryCalculator";
import { buildTasks, getCompletionPercent } from "./utils/celebrationStorage";
import { CELEBRATION_TASK_TEMPLATES } from "./config/celebrationTasks";
import { TimelineMilestone } from "./components/TimelineMilestone";
import { MonthlyAccordion } from "./components/MonthlyAccordion";
import { CategoryView } from "./components/CategoryView";
import { CompletedView } from "./components/CompletedView";
import { PersonDetailDialog } from "./components/PersonDetailDialog";
import { LoginPage } from "./components/LoginPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import {
  Calendar,
  List,
  LogOut,
  Loader2,
  RefreshCw,
  Award,
  ClipboardCheck,
  CalendarDays,
  Users,
  PartyPopper,
  CircleCheckBig,
  AlertCircle,
} from "lucide-react";

function formatToday(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function App() {
  const [token, setToken] = useState<string | null>(
    sessionStorage.getItem("auth_token")
  );
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sentLog, setSentLog] = useState<SentLogEntry[]>([]);
  const [taskRecords, setTaskRecords] = useState<TaskRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [selectedMilestone, setSelectedMilestone] =
    useState<AnniversaryMilestone | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handlePersonClick = (milestone: AnniversaryMilestone) => {
    setSelectedMilestone(milestone);
    setDialogOpen(true);
  };

  const handleLogin = (newToken: string) => {
    sessionStorage.setItem("auth_token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("auth_token");
    setToken(null);
    setEmployees([]);
  };

  const [refreshing, setRefreshing] = useState(false);

  const fetchEmployees = (authToken: string, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    const empPromise = fetch("/api/employees", {
      headers: { Authorization: `Bearer ${authToken}` },
    }).then((res) => {
      if (res.status === 401) { handleLogout(); return null; }
      if (!res.ok) throw new Error("Failed to fetch employees");
      return res.json();
    });

    const sentLogPromise = fetch("/api/sentlog", {
      headers: { Authorization: `Bearer ${authToken}` },
    }).then((res) => (res.ok ? res.json() : [])).catch(() => []);

    const tasksPromise = fetch("/api/tasks", {
      headers: { Authorization: `Bearer ${authToken}` },
    }).then((res) => (res.ok ? res.json() : [])).catch(() => []);

    Promise.all([empPromise, sentLogPromise, tasksPromise])
      .then(([empData, logData, tasksData]) => {
        if (empData) setEmployees(empData);
        if (Array.isArray(logData)) setSentLog(logData);
        if (Array.isArray(tasksData)) setTaskRecords(tasksData);
        setLoading(false);
        setRefreshing(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load data");
        setLoading(false);
        setRefreshing(false);
      });
  };

  const handleToggleTask = (
    employeeId: string,
    employeeName: string,
    year: number,
    milestone: number,
    taskId: string,
    completed: boolean
  ) => {
    setTaskRecords((prev) => {
      const idx = prev.findIndex(
        (r) => r.employeeId === employeeId && r.year === year
      );
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          tasks: { ...updated[idx].tasks, [taskId]: completed },
        };
        return updated;
      }
      return [
        ...prev,
        { employeeId, employeeName, year, milestone,
          tasks: { [taskId]: completed }, updatedAt: new Date().toISOString() },
      ];
    });

    const params = new URLSearchParams({
      employeeId, employeeName, year: String(year),
      milestone: String(milestone), taskId, completed: String(completed),
    });
    fetch(`/api/tasks?${params}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  };

  const handleRefresh = () => { if (token) fetchEmployees(token, true); };

  useEffect(() => { if (token) fetchEmployees(token); }, [token]);

  if (!token) return <LoginPage onLogin={handleLogin} />;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Loading employee data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const milestones = calculateAnniversaries(employees, selectedYear);
  const groupedByMonth = groupMilestonesByMonth(milestones);
  const sortedMonths = Array.from(groupedByMonth.keys()).sort((a, b) => a - b);

  // Compute stats
  const totalTasks = CELEBRATION_TASK_TEMPLATES.length;
  let prepComplete = 0;
  let prepInProgress = 0;
  for (const m of milestones) {
    const tasks = buildTasks(m.employee.id, m.year, taskRecords);
    const done = tasks.filter((t) => t.completed).length;
    if (done === totalTasks) prepComplete++;
    else if (done > 0) prepInProgress++;
  }
  const prepNotStarted = milestones.length - prepComplete - prepInProgress;

  // Upcoming within 30 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming30 = milestones.filter((m) => {
    const diff = Math.ceil((m.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 30;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              HV Anniversary Dashboard
            </h1>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
              <CalendarDays className="w-3.5 h-3.5" />
              {formatToday()}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map(
                (year) => (
                  <option key={year} value={year}>{year}</option>
                )
              )}
            </select>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                <PartyPopper className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{milestones.length}</p>
                <p className="text-xs text-gray-500">Milestones</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{upcoming30.length}</p>
                <p className="text-xs text-gray-500">Next 30 Days</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <CircleCheckBig className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{prepComplete}</p>
                <p className="text-xs text-gray-500">Prep Done</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{prepNotStarted + prepInProgress}</p>
                <p className="text-xs text-gray-500">Prep Pending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="inline-flex h-10 bg-white border border-gray-200 rounded-lg p-1 mb-6">
            <TabsTrigger value="timeline" className="flex items-center gap-1.5 text-sm px-4 rounded-md data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <List className="w-4 h-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-1.5 text-sm px-4 rounded-md data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <Calendar className="w-4 h-4" />
              Monthly
            </TabsTrigger>
            <TabsTrigger value="awards" className="flex items-center gap-1.5 text-sm px-4 rounded-md data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <Award className="w-4 h-4" />
              Awards
            </TabsTrigger>
            <TabsTrigger value="preparation" className="flex items-center gap-1.5 text-sm px-4 rounded-md data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <ClipboardCheck className="w-4 h-4" />
              Preparation
            </TabsTrigger>
          </TabsList>

          {/* Timeline View */}
          <TabsContent value="timeline">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    All Milestones
                  </h2>
                  <p className="text-sm text-gray-500">
                    {milestones.length} celebration{milestones.length !== 1 ? "s" : ""} in {selectedYear}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500" /> 3yr</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500" /> 5-7yr</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-500" /> 10yr</span>
                </div>
              </div>

              {milestones.length > 0 ? (
                <div className="overflow-x-auto pb-4">
                  <div className="flex items-start min-w-max px-4 py-6">
                    {milestones.map((milestone, index) => (
                      <TimelineMilestone
                        key={milestone.employee.id}
                        milestone={milestone}
                        isLast={index === milestones.length - 1}
                        onClick={handlePersonClick}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-400">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>No milestone anniversaries in {selectedYear}</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Monthly View */}
          <TabsContent value="monthly">
            <div className="space-y-0">
              {sortedMonths.length > 0 ? (
                sortedMonths.map((month) => (
                  <MonthlyAccordion
                    key={month}
                    month={month}
                    milestones={groupedByMonth.get(month) || []}
                    year={selectedYear}
                    onPersonClick={handlePersonClick}
                  />
                ))
              ) : (
                <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-200">
                  <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>No celebrations scheduled in {selectedYear}</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Awards View */}
          <TabsContent value="awards">
            <CategoryView
              milestones={milestones}
              onPersonClick={handlePersonClick}
            />
          </TabsContent>

          {/* Preparation View */}
          <TabsContent value="preparation">
            <CompletedView
              milestones={milestones}
              taskRecords={taskRecords}
              onPersonClick={handlePersonClick}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Person Detail Dialog */}
      <PersonDetailDialog
        milestone={selectedMilestone}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        sentLog={sentLog}
        taskRecords={taskRecords}
        onToggleTask={handleToggleTask}
      />
    </div>
  );
}
