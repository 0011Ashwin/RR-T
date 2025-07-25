import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
} from "lucide-react";

interface CalendarEvent {
  time?: string;
  subject: string;
  type: string;
  title?: string;
  description?: string;
  className?: string;
}

interface CalendarDay {
  date: number;
  events: CalendarEvent[];
  isCurrentMonth: boolean;
}

interface CalendarProps {
  events?: Array<{
    title: string;
    date: string;
    type: string;
    description: string;
    className?: string;
  }>;
}

export default function Calendar({ events = [] }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(4); // May = 4 (0-indexed)
  const [currentYear, setCurrentYear] = useState(2025);

  const months = [
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

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Sample schedule data similar to the image
  const getScheduleData = (): CalendarDay[] => {
    const schedule: CalendarDay[] = [];
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    // Add empty days for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      schedule.push({
        date: 0,
        events: [],
        isCurrentMonth: false,
      });
    }

    // Add days of current month with events from props
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents: CalendarEvent[] = [];

      // Check if any events fall on this day
      events.forEach((event) => {
        const eventDate = new Date(event.date);
        if (
          eventDate.getDate() === day &&
          eventDate.getMonth() === currentMonth &&
          eventDate.getFullYear() === currentYear
        ) {
          dayEvents.push({
            subject: event.title,
            type: event.type,
            title: event.title,
            description: event.description,
            className: event.className || "",
          });
        }
      });

      schedule.push({
        date: day,
        events: dayEvents,
        isCurrentMonth: true,
      });
    }

    return schedule;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const scheduleData = getScheduleData();

  return (
    <div className="w-full">
      <Card>
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle className="flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            My Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Calendar Header */}
          <div className="p-4 border-b bg-slate-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth("next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </div>

              <h2 className="text-xl font-semibold text-slate-900">
                {months[currentMonth]} {currentYear}
              </h2>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <CalendarIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  📊
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-blue-500 text-white"
                >
                  <List className="h-4 w-4 mr-1" />
                  list
                </Button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="p-3 text-center font-semibold text-slate-700 bg-slate-100"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {scheduleData.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border border-slate-200 ${
                    !day.isCurrentMonth ? "bg-slate-50" : "bg-white"
                  }`}
                >
                  {day.date > 0 && (
                    <>
                      <div className="font-semibold text-slate-900 mb-1">
                        {day.date}
                      </div>
                      <div className="space-y-1">
                        {day.events.map((event, eventIndex) => (
                          <div
                            key={eventIndex}
                            className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate"
                          >
                            <div className="font-medium">{event.time}</div>
                            <div>{event.subject}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
