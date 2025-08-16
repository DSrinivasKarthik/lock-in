'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Settings } from 'lucide-react';
import { getAccentHex } from '../utils/colors';

interface FocusTimerProps {
  accentColor: string;
  showMessage: (msg: string) => void;
  IconButton: React.FC<{ children: React.ReactNode; onClick: () => void; className?: string }>;
}

const FocusTimer: React.FC<FocusTimerProps> = ({ accentColor, showMessage, IconButton }) => {
  const [focusTime, setFocusTime] = useState<number>(25 * 60); // minutes
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle timer tick
  useEffect(() => {
    if (isTimerRunning && focusTime > 0) {
      timerIntervalRef.current = setInterval(() => {
        setFocusTime((prevTime) => prevTime - 1);
      }, 1000);
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isTimerRunning]);

  // When timer hits zero
  useEffect(() => {
    if (focusTime === 0) {
      setIsTimerRunning(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      showMessage('Focus session complete!');
    }
  }, [focusTime]);

  // Format time (MM:SS)
  const formatTimer = (seconds: number) => {
    const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
    const remainingSeconds = String(seconds % 60).padStart(2, '0');
    return `${minutes}:${remainingSeconds}`;
  };

  // Controls
  const toggleTimer = () => {
    setIsTimerRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setFocusTime(25 * 60); // Reset to 25 minutes
    showMessage('Timer reset to 50 minutes.');
  };

  return (
    <div className="col-span-1 md:col-span-full p-4 sm:p-6 border-2 rounded-xl border-gray-700 flex flex-col justify-between min-h-[150px] sm:min-h-[200px]">
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="text-5xl sm:text-7xl font-bold"
              style={{ color: getAccentHex(accentColor),  }} >
          {formatTimer(focusTime)}
        </div>
        <div className="text-lg sm:text-xl mt-2"
                      style={{ color: getAccentHex(accentColor),  }} >FOCUS</div>
      </div>
      <div className="flex justify-center space-x-2 sm:space-x-4 mt-4">
        <IconButton onClick={() => showMessage('Skip back not implemented for timer.')} className="opacity-50 cursor-not-allowed">
          <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
        </IconButton>
        <IconButton onClick={toggleTimer}>
          {isTimerRunning ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6" />}
        </IconButton>
        <IconButton onClick={() => showMessage('Skip forward not implemented for timer.')} className="opacity-50 cursor-not-allowed">
          <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
        </IconButton>
        <IconButton onClick={() => showMessage('Volume control not implemented.')}>
          <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
        </IconButton>
        <IconButton onClick={() => showMessage('Settings not implemented.')}>
          <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
        </IconButton>
      </div>
      <div className="flex justify-center mt-2">
        <button
          onClick={resetTimer}
          className={`text-xs mt-2 px-3 py-1 border rounded ${accentColor} border-current hover:bg-gray-800`}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default FocusTimer;
