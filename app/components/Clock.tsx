'use client';
import React, { useState, useEffect } from 'react';

interface ClockProps {
  accentColor: string; // We'll pass accent color from parent
}

const Clock: React.FC<ClockProps> = ({ accentColor }) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Update clock every second
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Format time for display (HH:MM:SS)
  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // Format date for display
  const formatDate = (date: Date) => {
    const formatter = new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
    return formatter.format(date);
  };

  return (
    <div className="col-span-1 md:col-span-full flex flex-col items-center justify-center py-4 sm:py-8">
      <div className={`text-7xl sm:text-9xl font-bold ${accentColor}`}>
        {formatTime(currentTime)}
      </div>
      <div className={`text-xl sm:text-2xl mt-2 sm:mt-4 ${accentColor}`}>
        {formatDate(currentTime)}
      </div>
    </div>
  );
};

export default Clock;
