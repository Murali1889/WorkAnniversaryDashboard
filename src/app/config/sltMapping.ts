export const SLT_MAPPING: Record<string, string> = {
  "Admin": "Murali",
  "Business": "Satish",
  "Business Development": "Satish",
  "CLM": "Murali",
  "Contribution": "Satish",
  "DL": "Murali",
  "Delivery": "Murali",
  "Engineering": "Murali",
  "Finance": "Satish",
  "Info Sec": "Murali",
  "KAM": "Satish",
  "Legal": "Satish",
  "Market Research": "Satish",
  "Marketing": "Satish",
  "People & Culture": "Satish",
  "Product": "Murali",
  "Product Design": "Murali",
  "Product Partnership": "Murali",
  "Product Support": "Satish",
  "RevOps": "Satish",
  "Sales": "Satish",
  "Solutions": "Murali",
  "Strategy": "Satish",
};

export function getSltForDepartment(department: string): string {
  return SLT_MAPPING[department] || "Unknown";
}
