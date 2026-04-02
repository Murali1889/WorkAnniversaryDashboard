export const SLT_MAPPING: Record<string, string> = {
  "Admin": "Kishore Natarajan",
  "Business": "Kedar Kulkarni",
  "Business Development": "Kedar Kulkarni",
  "CLM": "Kedar Kulkarni & Vignesh Krishnakumar",
  "Contribution": "Kedar Kulkarni",
  "DL": "Vignesh Krishnakumar",
  "Delivery": "Vignesh Krishnakumar",
  "Engineering": "Saivenkatesh A",
  "Finance": "Kishore Natarajan",
  "Info Sec": "Saivenkatesh A",
  "KAM": "Kedar Kulkarni",
  "Legal": "Kishore Natarajan",
  "Market Research": "Kedar Kulkarni",
  "Marketing": "Kedar Kulkarni",
  "People & Culture": "Kishore Natarajan",
  "Product": "Vignesh Krishnakumar",
  "Product Design": "Praveen Kumar",
  "Product Partnership": "Vignesh Krishnakumar",
  "Product Support": "Vignesh Krishnakumar",
  "RevOps": "Kedar Kulkarni",
  "Sales": "Kedar Kulkarni",
  "Solutions": "Vignesh Krishnakumar",
  "Strategy": "Kedar Kulkarni",
};

export function getSltForDepartment(department: string): string {
  return SLT_MAPPING[department] || "Unknown";
}
