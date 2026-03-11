import type { AwardCategory } from "../types/employee";

export interface AwardCategoryConfig {
  key: AwardCategory;
  label: string;
  years: number;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeClass: string;
}

export const AWARD_CATEGORIES: AwardCategoryConfig[] = [
  {
    key: "builders",
    label: "Builders",
    years: 3,
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    badgeClass: "bg-green-100 text-green-700",
  },
  {
    key: "stewards",
    label: "Stewards",
    years: 5,
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    badgeClass: "bg-blue-100 text-blue-700",
  },
  {
    key: "anchors",
    label: "Anchors",
    years: 7,
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    badgeClass: "bg-amber-100 text-amber-700",
  },
  {
    key: "legacy",
    label: "Legacy",
    years: 10,
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    badgeClass: "bg-purple-100 text-purple-700",
  },
];

export function getAwardCategory(years: number): AwardCategoryConfig | undefined {
  return AWARD_CATEGORIES.find((c) => c.years === years);
}
