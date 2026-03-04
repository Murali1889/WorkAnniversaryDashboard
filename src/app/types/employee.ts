export interface Employee {
  id: string;
  name: string;
  position: string;
  startDate: string; // Format: YYYY-MM-DD
  department: string;
}

export interface AnniversaryMilestone {
  employee: Employee;
  years: number;
  date: Date;
  month: number;
  year: number;
}
