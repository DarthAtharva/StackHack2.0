import React, { useState, useEffect, useRef } from "react";
import { addDays, format } from "date-fns";

const DateSelector = ({ onSelect }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dates, setDates] = useState([]);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640); // Adjust the breakpoint as needed
  const containerRef = useRef(null);

  useEffect(() => {
    const startDate = new Date();
    const datesArray = Array.from({ length: 30 }, (_, i) => addDays(startDate, i));
    setDates(datesArray);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 640); 
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDateClick = (date) => {
    if (date instanceof Date && !isNaN(date)) {
      setSelectedDate(date);
      if (onSelect) {
        onSelect(date);
      }
    } else {
      console.error("Invalid date selected:", date);
    }
  };

  const scrollLeft = () => {
    containerRef.current.scrollBy({
      left: -200,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    containerRef.current.scrollBy({
      left: 200,
      behavior: "smooth",
    });
  };

  const formatDate = (date) => {
    return format(date, "EEE d MMM").toUpperCase();
  };

  return (
    <div className="flex items-center justify-center">
      {isSmallScreen ? (
        <select
          value={selectedDate.toDateString()}
          onChange={(e) => handleDateClick(new Date(e.target.value))}
          className="p-2 bg-transparent text-primary-950 dark:text-primary-600 font-semibold"
        >
          {dates.map((date, index) => (
            <option key={index} value={date.toDateString()}>
              {formatDate(date)}
            </option>
          ))}
        </select>
      ) : (
        <>
          <button onClick={scrollLeft} className="bg-transparent">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="red"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </button>

          <div
            ref={containerRef}
            className="flex gap-x-4 rounded-lg overflow-x-auto scrollbar-hide"
            style={{ width: "300px", scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {dates.map((date, index) => (
              <div
                key={index}
                className={`flex flex-col items-center cursor-pointer py-1 px-2 rounded-lg duration-150 font-semibold ${
                  date.toDateString() === selectedDate.toDateString()
                    ? "bg-primary-700 text-white"
                    : "bg-transparent hover:text-primary-700 dark:text-primary-50"
                }`}
                onClick={() => handleDateClick(date)}
              >
                <span className="text-sm">{formatDate(date)}</span>
              </div>
            ))}
          </div>

          <button onClick={scrollRight} className="bg-transparent">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="red"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </>
      )}
    </div>
  );
};

export default DateSelector;
