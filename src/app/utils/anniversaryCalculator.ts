import { Employee, AnniversaryMilestone } from "../types/employee";

export const calculateAnniversaries = (
  employees: Employee[],
  currentYear: number
): AnniversaryMilestone[] => {
  const milestones: AnniversaryMilestone[] = [];

  employees.forEach((employee) => {
    const startDate = new Date(employee.startDate);
    const startYear = startDate.getFullYear();
    const years = currentYear - startYear;

    if (years > 0) {
      const anniversaryDate = new Date(
        currentYear,
        startDate.getMonth(),
        startDate.getDate()
      );

      milestones.push({
        employee,
        years,
        date: anniversaryDate,
        month: startDate.getMonth(),
        year: currentYear,
      });
    }
  });

  // Sort by date
  return milestones.sort((a, b) => a.date.getTime() - b.date.getTime());
};

export const groupMilestonesByMonth = (
  milestones: AnniversaryMilestone[]
): Map<number, AnniversaryMilestone[]> => {
  const grouped = new Map<number, AnniversaryMilestone[]>();

  milestones.forEach((milestone) => {
    const month = milestone.month;
    if (!grouped.has(month)) {
      grouped.set(month, []);
    }
    grouped.get(month)!.push(milestone);
  });

  return grouped;
};

export const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export const getYearSuffix = (years: number): string => {
  if (years === 1) return "1st";
  if (years === 2) return "2nd";
  if (years === 3) return "3rd";
  return `${years}th`;
};
