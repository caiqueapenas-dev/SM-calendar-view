"use client";

import dayjs, { Dayjs } from "dayjs";
import { useAppStore } from "@/store/appStore";

interface SpecialDatesInCalendarProps {
  date: Dayjs;
  clientId: string;
}

export default function SpecialDatesInCalendar({ date, clientId }: SpecialDatesInCalendarProps) {
  const { specialDates, clients } = useAppStore();

  // Filter special dates for this specific day and client
  const daySpecialDates = specialDates.filter(sd => {
    if (sd.client_id !== clientId) return false;
    
    const specialDate = dayjs(sd.date);
    if (sd.is_recurring) {
      if (sd.recurrence_type === "yearly") {
        return specialDate.month() === date.month() && specialDate.date() === date.date();
      } else if (sd.recurrence_type === "monthly") {
        return specialDate.date() === date.date();
      }
    }
    return specialDate.isSame(date, "day");
  });

  if (daySpecialDates.length === 0) return null;

  return (
    <div className="mt-1 space-y-1">
      {daySpecialDates.slice(0, 2).map((specialDate) => (
        <div
          key={specialDate.id}
          className="px-2 py-1 bg-green-600/80 text-white text-xs rounded-full truncate flex items-center gap-1"
          title={`${specialDate.title}${specialDate.description ? ` - ${specialDate.description}` : ''}`}
        >
          <span>🎉</span>
          <span className="truncate">{specialDate.title}</span>
        </div>
      ))}
      {daySpecialDates.length > 2 && (
        <div className="px-2 py-1 bg-green-700/80 text-white text-xs rounded-full text-center">
          +{daySpecialDates.length - 2} eventos
        </div>
      )}
    </div>
  );
}

