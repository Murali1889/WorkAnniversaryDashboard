export interface TaskTemplate {
  id: string;
  label: string;
  description: string;
  owner: string;
  dueDaysBeforeMilestone: number;
}

export const CELEBRATION_TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: "cake",
    label: "Cake",
    description: "Order celebration cake for the milestone",
    owner: "Admin Team",
    dueDaysBeforeMilestone: 3,
  },
  {
    id: "greeting-card",
    label: "Greeting Card",
    description: "Prepare and sign greeting card",
    owner: "Admin Team",
    dueDaysBeforeMilestone: 5,
  },
  {
    id: "laptop-sticker-pouch",
    label: "Laptop Sticker + Pouch",
    description: "Prepare branded laptop sticker and pouch",
    owner: "Admin Team",
    dueDaysBeforeMilestone: 7,
  },
  {
    id: "lsa-award",
    label: "LSA Award",
    description: "Arrange Long Service Award",
    owner: "Admin Team",
    dueDaysBeforeMilestone: 14,
  },
];
