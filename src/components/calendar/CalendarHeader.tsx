import dayjs, { Dayjs } from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarHeaderProps {
  currentDate: Dayjs;
  setCurrentDate: (date: Dayjs) => void;
  viewMode: "month" | "week";
  setViewMode: (mode: "month" | "week") => void;
}

export default function CalendarHeader({
  currentDate,
  setCurrentDate,
  viewMode,
  setViewMode,
}: CalendarHeaderProps) {
  const changeDate = (amount: number) => {
    setCurrentDate(currentDate.add(amount, viewMode));
  };

  const handleToday = () => {
    setCurrentDate(dayjs());
  };

  const getHeaderText = () => {
    if (viewMode === "month") {
      // Use only first 3 letters of month name
      const monthName = currentDate.format("MMMM").substring(0, 3);
      return `${monthName} ${currentDate.format("YYYY")}`;
    }
    const startOfWeek = currentDate.startOf("week");
    const endOfWeek = currentDate.endOf("week");
    if (startOfWeek.month() !== endOfWeek.month()) {
      return `${startOfWeek.format("MMM")} / ${endOfWeek.format("MMM YYYY")}`;
    }
    const monthName = currentDate.format("MMMM").substring(0, 3);
    return `${monthName} ${currentDate.format("YYYY")}`;
  };

  return (
    <>
      {/* Mobile-First Design */}
      <div className="md:hidden space-y-3 mb-4">
        {/* Navigation Row */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => changeDate(-1)}
            className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-semibold capitalize">
            {getHeaderText()}
          </h2>
          <button
            onClick={() => changeDate(1)}
            className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        
        {/* View Mode and Today Button Row */}
        <div className="flex gap-2">
          <div className="flex bg-gray-900 rounded-lg p-1 flex-1">
            <button
              onClick={() => setViewMode("month")}
              className={`flex-1 py-2 text-sm font-medium rounded-md ${
                viewMode === "month"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300"
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`flex-1 py-2 text-sm font-medium rounded-md ${
                viewMode === "week"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300"
              }`}
            >
              Semana
            </button>
          </div>
          <button
            onClick={handleToday}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg text-sm"
          >
            Hoje
          </button>
        </div>
      </div>

      {/* Desktop Design */}
      <div className="hidden md:flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeDate(-1)}
              className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-semibold w-48 text-center capitalize">
              {getHeaderText()}
            </h2>
            <button
              onClick={() => changeDate(1)}
              className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="flex bg-gray-900 rounded-lg p-1 space-x-1">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                viewMode === "month"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                viewMode === "week"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              Semana
            </button>
          </div>
        </div>
        <button
          onClick={handleToday}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg text-sm"
        >
          Hoje
        </button>
      </div>
    </>
  );
}
