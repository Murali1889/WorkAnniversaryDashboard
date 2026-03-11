import { useState, useEffect } from "react";
import { Employee } from "./types/employee";
import {
  calculateAnniversaries,
  groupMilestonesByMonth,
} from "./utils/anniversaryCalculator";
import { TimelineMilestone } from "./components/TimelineMilestone";
import { MonthlyAccordion } from "./components/MonthlyAccordion";
import { LoginPage } from "./components/LoginPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Calendar, List, LogOut, Loader2, RefreshCw } from "lucide-react";

export default function App() {
  const [token, setToken] = useState<string | null>(
    sessionStorage.getItem("auth_token")
  );
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

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
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    fetch("/api/employees", {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((res) => {
        if (res.status === 401) {
          handleLogout();
          return null;
        }
        if (!res.ok) throw new Error("Failed to fetch employees");
        return res.json();
      })
      .then((data) => {
        if (data) setEmployees(data);
        setLoading(false);
        setRefreshing(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load data");
        setLoading(false);
        setRefreshing(false);
      });
  };

  const handleRefresh = () => {
    if (token) fetchEmployees(token, true);
  };

  useEffect(() => {
    if (token) fetchEmployees(token);
  }, [token]);

  if (!token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading employee data from Zoho...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center relative">
          <div className="absolute right-0 top-0 flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Work Anniversary Timeline
          </h1>
          <p className="text-gray-600">
            Celebrating milestones and achievements
          </p>
        </div>

        {/* Year Selector */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <label htmlFor="year-select" className="font-medium text-gray-700">
            Select Year:
          </label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map(
              (year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              )
            )}
          </select>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Timeline View
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Monthly View
            </TabsTrigger>
          </TabsList>

          {/* Timeline View */}
          <TabsContent value="timeline">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                  All Anniversaries ({selectedYear})
                </h2>
                <p className="text-gray-500">
                  {milestones.length} milestone{milestones.length !== 1 ? "s" : ""} this year
                </p>
              </div>

              {milestones.length > 0 ? (
                <div className="overflow-x-auto pb-4">
                  <div className="flex items-start min-w-max px-4 py-8">
                    {milestones.map((milestone, index) => (
                      <TimelineMilestone
                        key={milestone.employee.id}
                        milestone={milestone}
                        isLast={index === milestones.length - 1}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No anniversaries for this year
                </div>
              )}
            </div>
          </TabsContent>

          {/* Monthly View */}
          <TabsContent value="monthly">
            <div className="space-y-0">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                  Monthly Celebrations ({selectedYear})
                </h2>
                <p className="text-gray-500">
                  Organized by month for easy planning
                </p>
              </div>

              {sortedMonths.length > 0 ? (
                sortedMonths.map((month) => (
                  <MonthlyAccordion
                    key={month}
                    month={month}
                    milestones={groupedByMonth.get(month) || []}
                    year={selectedYear}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-gray-500 bg-white rounded-lg border">
                  No celebrations scheduled for this year
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Stats Footer */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {milestones.length}
            </p>
            <p className="text-sm text-gray-600">Total Anniversaries</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {milestones.filter((m) => m.years >= 5).length}
            </p>
            <p className="text-sm text-gray-600">5+ Year Milestones</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <p className="text-2xl font-bold text-green-600">
              {employees.length}
            </p>
            <p className="text-sm text-gray-600">Total Employees</p>
          </div>
        </div>
      </div>
    </div>
  );
}
