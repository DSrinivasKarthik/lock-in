'use client'; // This directive marks the component as a Client Component, allowing client-side hooks

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Settings, Plus, Check, VolumeX, Volume1 } from 'lucide-react';
import './globals.css'; 
import Clock from './components/Clock'; 
import FocusTimer from './components/FocusTimer';
import { colors, accentColorMap, getAccentHex } from './utils/colors';
import MusicPanel from './components/MusicPanel';

// Define the props for the MusicPanel component

const App: React.FC = () => {
  // State for the accent color
  const [accentColor, setAccentColor] = useState<string>('text-green-400'); // Default neon green

  // State for music panel
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [trackInfo, setTrackInfo] = useState<string>('No track selected');

  // State for tasks panel
  const [tasks, setTasks] = useState<string[]>([]);
  const [newTask, setNewTask] = useState<string>('');

  // State for displaying temporary messages (replaces alert())
  const [message, setMessage] = useState<string>('');

  // Function to display temporary messages
  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage('');
    }, 3000); // Message disappears after 3 seconds
  };

  // Music controls (placeholder functions)
  const handleAddTrack = () => {
    if (youtubeUrl.trim()) {
      setTrackInfo(`a YouTube [${youtubeUrl.substring(0, 20)}...]`);
      setYoutubeUrl('');
      showMessage('Track added!');
    } else {
      showMessage('Please enter a YouTube URL.');
    }
  };

  // Task controls
  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, newTask.trim()]);
      setNewTask('');
      showMessage('Task added!');
    } else {
      showMessage('Please enter a task.');
    }
  };

  const handleRemoveTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
    showMessage('Task removed.');
  };

  // Reusable Button component for consistency
  interface IconButtonProps {
    children: React.ReactNode;
    onClick: () => void;
    className?: string;
  }
  const IconButton: React.FC<IconButtonProps> = ({ children, onClick, className = '' }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-full border-2 border-current ${accentColor} hover:bg-gray-800 transition-colors duration-200 ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-black text-white font-mono p-4 sm:p-8 flex flex-col items-center justify-center overflow-hidden relative">
      {/* Message Display */}
      {message && (
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 bg-gray-900 px-4 py-2 rounded-lg shadow-lg ${accentColor} border border-current z-50`}>
          {message}
        </div>
      )}

      {/* Accent Color Selector */}
      <div className="absolute top-4 sm:top-8 right-4 sm:right-8 flex space-x-2 z-10">
        {colors.map((color) => (
          <button
            key={color.name}
            type="button"
            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full ${color.bg} border-2 border-gray-700 flex items-center justify-center transition-all duration-200 hover:scale-110`}
            onClick={() => {
              setAccentColor(color.class);
              showMessage(`Accent color set to ${color.name}!`);
            }}
            title={`Set accent to ${color.name}`}
          >
            {accentColor === color.class && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-black" />}
          </button>
        ))}
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 gap-4 sm:gap-8 w-full max-w-6xl mt-16 md:mt-0">
        {/* Center - Clock and Date (now top-center) */}
        <Clock accentColor={accentColor} />

        {/* Focus Timer Panel (below clock) */}
        <FocusTimer
          accentColor={accentColor}
          showMessage={showMessage}
          IconButton={IconButton} />

        {/* Music and Tasks Panels (side-by-side on md+, stacked on mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 col-span-1 md:col-span-full">
          <MusicPanel
            youtubeUrl={youtubeUrl}
            setYoutubeUrl={setYoutubeUrl}
            trackInfo={trackInfo}
            handleAddTrack={handleAddTrack}
            showMessage={showMessage}
            accentColor={accentColor}
            IconButton={IconButton}
          />


          {/* Bottom Right - Tasks Panel */}
          <div className="p-4 sm:p-6 border-2 rounded-xl border-gray-700 flex flex-col justify-between min-h-[150px] sm:min-h-[200px]">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="text"
                  placeholder="Add task..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                  className="flex-grow bg-transparent border-b-2 border-gray-600 focus:outline-none focus:border-current py-1 px-2 text-sm sm:text-base"
                />
                <IconButton onClick={handleAddTask} className="p-1">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                </IconButton>
              </div>
              {tasks.length === 0 ? (
                <div className={`text-xs sm:text-sm text-gray-400 ${accentColor}`}>No tasks</div>
              ) : (
                <ul className="list-none p-0 m-0">
                  {tasks.map((task, index) => (
                    <li key={index} className="flex items-center justify-between py-1 text-sm sm:text-base">
                      <span className={`${accentColor}`}>{task}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTask(index)}
                        className={`text-gray-600 hover:${accentColor} text-xs sm:text-sm`}
                      >
                        [x]
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

    {/* Footer Branding */}
    <div className={`mt-8 sm:mt-12 text-center text-lg sm:text-xl ${accentColor}`}>
      Developed by <div
  className="bitcount-single-title"
  style={{
    color: getAccentHex(accentColor),
    textShadow: `
      0 0 4px ${getAccentHex(accentColor)},
      0 0 10px ${getAccentHex(accentColor)}80,
      0 0 20px ${getAccentHex(accentColor)}60
    `,
  }}
>
  DSK
</div>

    </div>
    </div>
  );
};

export default App;
