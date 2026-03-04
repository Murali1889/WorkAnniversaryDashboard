import { AnniversaryMilestone } from "../types/employee";
import { monthNames, getYearSuffix } from "../utils/anniversaryCalculator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Calendar, Users, Cake } from "lucide-react";
import { Badge } from "./ui/badge";

interface MonthlyAccordionProps {
  month: number;
  milestones: AnniversaryMilestone[];
  year: number;
}

export function MonthlyAccordion({
  month,
  milestones,
  year,
}: MonthlyAccordionProps) {
  const monthName = monthNames[month];

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={`month-${month}`} className="border rounded-lg mb-4">
        <AccordionTrigger className="px-4 hover:no-underline hover:bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3 w-full">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900">{monthName} {year}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                <span>{milestones.length} {milestones.length === 1 ? 'celebration' : 'celebrations'}</span>
              </div>
            </div>
            <Badge variant="outline" className="mr-4">
              {milestones.length}
            </Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-3 pt-2">
            {milestones.map((milestone) => (
              <div
                key={milestone.employee.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
                    <Cake className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {milestone.employee.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {milestone.employee.position}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                    {getYearSuffix(milestone.years)}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {milestone.date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
