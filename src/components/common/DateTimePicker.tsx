"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

interface DateTimePickerProps {
  value: string; // ISO datetime string
  onChange: (value: string) => void;
  label?: string;
}

export default function DateTimePicker({ value, onChange, label }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value ? dayjs(value) : dayjs());
  const [selectedTime, setSelectedTime] = useState(
    value ? dayjs(value).format("HH:mm") : "12:00"
  );
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  const handleDateSelect = (date: dayjs.Dayjs) => {
    const [hours, minutes] = selectedTime.split(":");
    const newDateTime = date.hour(parseInt(hours)).minute(parseInt(minutes));
    setSelectedDate(newDateTime);
    onChange(newDateTime.toISOString());
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    const [hours, minutes] = time.split(":");
    const newDateTime = selectedDate.hour(parseInt(hours)).minute(parseInt(minutes));
    setSelectedDate(newDateTime);
    onChange(newDateTime.toISOString());
  };

  const getDaysInMonth = () => {
    const firstDay = currentMonth.startOf("month");
    const lastDay = currentMonth.endOf("month");
    const daysInMonth = lastDay.date();
    const startWeekday = firstDay.day();

    const days = [];
    
    // Previous month days
    for (let i = 0; i < startWeekday; i++) {
      days.push(null);
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(currentMonth.date(i));
    }

    return days;
  };

  const days = getDaysInMonth();
  const isToday = (date: dayjs.Dayjs | null) => date && date.isSame(dayjs(), "day");
  const isSelected = (date: dayjs.Dayjs | null) => date && date.isSame(selectedDate, "day");

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}

      {/* Display Input */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-left hover:bg-gray-600 transition-colors"
      >
        {selectedDate.format("DD/MM/YYYY [às] HH:mm")}
      </button>

      {/* Picker Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 z-50 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-4 w-full min-w-[320px] animate-scale-in">
          {/* Calendar */}
          <div className="mb-4">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <h3 className="text-sm font-semibold capitalize">
                {currentMonth.format("MMMM YYYY")}
              </h3>
              <button
                type="button"
                onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Week days */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                <div key={day} className="text-center text-xs text-gray-500 font-medium">
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => day && handleDateSelect(day)}
                  disabled={!day}
                  className={`
                    aspect-square flex items-center justify-center text-sm rounded-lg transition-all
                    ${!day ? "invisible" : ""}
                    ${isToday(day) ? "font-bold ring-2 ring-indigo-500" : ""}
                    ${isSelected(day) ? "bg-indigo-600 text-white" : "hover:bg-gray-700"}
                    ${!isSelected(day) && !isToday(day) ? "text-gray-300" : ""}
                  `}
                >
                  {day?.date()}
                </button>
              ))}
            </div>
          </div>

          {/* Time Picker */}
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-gray-400" />
              <label className="text-sm font-medium text-gray-300">
                Horário
              </label>
            </div>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          {/* Quick times */}
          <div className="mt-3 flex gap-2 flex-wrap">
            {["09:00", "12:00", "15:00", "18:00", "21:00"].map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => handleTimeChange(time)}
                className="px-3 py-1 bg-gray-700 hover:bg-indigo-600 text-white text-xs rounded-md transition-colors"
              >
                {time}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-4 pt-4 border-t border-gray-700 flex gap-2">
            <button
              type="button"
              onClick={() => {
                handleDateSelect(dayjs());
                handleTimeChange(dayjs().format("HH:mm"));
              }}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
            >
              Agora
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

