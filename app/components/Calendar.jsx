'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductionCalendar({ LeaveDays = [], SpecialLeaveDays = [], onDayClick, WorkingDyas=[],Plan=[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayAbbr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const fullDayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
    setSelectedDay(null);
  };

  const handleDayClick = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayName = fullDayNames[date.getDay()]; // full lowercase name

    const isLeaveDay = LeaveDays.includes(dayName);
    const isSpecialLeaveDay = SpecialLeaveDays.includes(day); // direct number check

    if (!isLeaveDay && !isSpecialLeaveDay) {
      setSelectedDay(day);
      onDayClick?.(day, currentDate.getMonth(), currentDate.getFullYear());
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Blank days for alignment
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 w-12"></div>);
    }

    // Calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayName = fullDayNames[date.getDay()];

      const isLeaveDay = LeaveDays.includes(dayName);
      const isSpecialLeaveDay = SpecialLeaveDays.includes(day);
      const isSelected = selectedDay === day;

      const cellClass = `
        h-12 w-12 flex items-center justify-center text-sm font-medium rounded-lg
        ${isLeaveDay || isSpecialLeaveDay ? 'bg-red-500 text-white cursor-not-allowed' :
        'hover:bg-blue-100 hover:text-blue-700 cursor-pointer'}
        ${isSelected ? 'bg-blue-500 text-white' : ''}
        ${!isLeaveDay && !isSpecialLeaveDay && !isSelected ? 'text-gray-800' : ''}
      `;

      days.push(
        <div
          key={day}
          onClick={() => handleDayClick(day)}
          className={cellClass}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigateMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-lg">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigateMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayAbbr.map(day => (
              <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendarDays()}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-gray-600">Leave Days</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-gray-600">Selected</span>
            </div>
          </div>

          {/* Day details box */}
          {selectedDay && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">
                {monthNames[currentDate.getMonth()]} {selectedDay}, {currentDate.getFullYear()}
              </h4>
              <div className="mt-2 text-sm text-gray-600">
                <p>Production schedule details will be shown here...</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
