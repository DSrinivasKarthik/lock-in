'use client';
import React, { useState } from 'react';
import { Palette } from 'lucide-react';
import './globals.css'; 
import Clock from './components/Clock'; 
import FocusTimer from './components/FocusTimer';
import { colors, getAccentHex } from './utils/colors';
import MusicPanel from './components/MusicPanel';
import TaskPanel from './components/TaskPanel';

const App: React.FC = () => {
  // State for the accent color
  const [accentColor, setAccentColor] = useState<string>('text-green-400'); // Default neon green

  // State for music panel
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');

  // State for displaying temporary messages (replaces alert())
  const [message, setMessage] = useState<string>('');

  // Function to display temporary messages
  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage('');
    }, 3000); // Message disappears after 3 seconds
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
      className={`p-2 rounded-full border-2 hover:bg-gray-800 transition-colors duration-200 ${className}`}
      style={{
        borderColor: getAccentHex(accentColor),
        color: getAccentHex(accentColor),
      }}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-black text-white font-mono p-4 sm:p-8 flex flex-col items-center justify-center overflow-hidden relative custom-scrollbar">
      {/* Header with Logo */}
      <header className="absolute top-4 sm:top-6 left-4 sm:left-8 z-20">
        <div className="flex items-center space-x-3">
          {/* Lock Icon with glow effect */}
          <div 
            className="relative"
            style={{
              filter: `drop-shadow(0 0 8px ${getAccentHex(accentColor)}80)`,
            }}
          >
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10"
              fill="currentColor"
              style={{ color: getAccentHex(accentColor) }}
              viewBox="0 0 24 24"
            >
              <path d="M12 2C13.1 2 14 2.9 14 4V6H16C17.1 6 18 6.9 18 8V20C18 21.1 17.1 22 16 22H8C6.9 22 6 21.1 6 20V8C6 6.9 6.9 6 8 6H10V4C10 2.9 10.9 2 12 2M12 4C11.4 4 11 4.4 11 5V6H13V5C13 4.4 12.6 4 12 4M8 8V20H16V8H8M12 11C13.1 11 14 11.9 14 13C14 13.7 13.6 14.4 13 14.7V17H11V14.7C10.4 14.4 10 13.7 10 13C10 11.9 10.9 11 12 11Z"/>
            </svg>
            {/* Pulsing glow ring */}
            <div 
              className="absolute inset-0 rounded-full animate-ping opacity-30"
              style={{
                backgroundColor: getAccentHex(accentColor),
                filter: 'blur(4px)',
              }}
            />
          </div>
          
          {/* App Name */}
          <div className="flex flex-col">
            <h1 
              className="text-2xl sm:text-3xl font-bold tracking-wider"
              style={{
                color: getAccentHex(accentColor),
                textShadow: `
                  0 0 5px ${getAccentHex(accentColor)}80,
                  0 0 10px ${getAccentHex(accentColor)}60,
                  0 0 15px ${getAccentHex(accentColor)}40
                `,
                fontFamily: '"Orbitron", monospace',
                fontWeight: 900,
              }}
            >
              LOCK-IN
            </h1>
            <div 
              className="text-xs sm:text-sm text-gray-400 tracking-widest"
              style={{ fontFamily: '"Rajdhani", sans-serif', fontWeight: 300 }}
            >
              FOCUS • ACHIEVE • REPEAT
            </div>
          </div>
        </div>
      </header>

      {/* Message Display */}
      {message && (
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 bg-gray-900 px-4 py-2 rounded-lg shadow-lg ${accentColor} border border-current z-50`}>
          {message}
        </div>
      )}
      {/* Cyberpunk Theme Selector */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-8 z-10">
        <div className="relative group/theme">
          {/* Hexagonal Trigger Button */}
          <button
            className="relative w-12 h-12 bg-gray-900 bg-opacity-90 backdrop-blur-sm border-2 transition-all duration-300 group-hover/theme:scale-110 flex items-center justify-center"
            style={{
              clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
              borderColor: getAccentHex(accentColor),
              boxShadow: `
                0 0 12px ${getAccentHex(accentColor)}60,
                inset 0 0 12px ${getAccentHex(accentColor)}30
              `,
            }}
          >
            {/* Neon Glyph Icon */}
            <Palette
              className="w-6 h-6 animate-pulse-slow"
              style={{
                stroke: getAccentHex(accentColor),
                filter: `drop-shadow(0 0 6px ${getAccentHex(accentColor)}) drop-shadow(0 0 12px ${getAccentHex(accentColor)}80)`,
              }}
            />

            {/* Scanning shimmer overlay */}
            <div 
              className="absolute inset-0 opacity-70 mix-blend-screen"
              style={{
                background: `linear-gradient(45deg, transparent 40%, ${getAccentHex(accentColor)}40 50%, transparent 60%)`,
                animation: 'scan-line 2.2s linear infinite',
              }}
            />
          </button>

          {/* Invisible bridge to prevent hover gap */}
          <div className="absolute right-0 top-full h-1 w-full opacity-0 pointer-events-auto" />

          <div className="absolute right-0 top-full opacity-0 invisible group-hover/theme:opacity-100 group-hover/theme:visible transition-all duration-200 pointer-events-none group-hover/theme:pointer-events-auto" style={{ transitionDelay: '0ms' }}>
            <div 
              className="relative bg-gray-900 bg-opacity-95 backdrop-blur-sm rounded-xl border-2 p-4 min-w-[280px] mt-1"
              style={{
                borderColor: getAccentHex(accentColor),
                boxShadow: `0 0 25px ${getAccentHex(accentColor)}30`,
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b" style={{ borderColor: `${getAccentHex(accentColor)}30` }}>
                <div 
                  className="text-sm font-bold tracking-wide"
                  style={{ 
                    color: getAccentHex(accentColor),
                    fontFamily: '"Orbitron", monospace',
                  }}
                >
                  THEME_SELECT
                </div>
                <div 
                  className="text-xs px-2 py-1 rounded border"
                  style={{ 
                    color: getAccentHex(accentColor),
                    borderColor: `${getAccentHex(accentColor)}50`,
                    backgroundColor: `${getAccentHex(accentColor)}10`,
                    fontFamily: '"Rajdhani", sans-serif',
                    fontWeight: 600,
                  }}
                >
                  {colors.find(c => c.class === accentColor)?.name.toUpperCase() || 'ACTIVE'}
                </div>
              </div>

              {/* Color Grid - 4 columns, responsive */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    className="group/color relative w-12 h-12 rounded-lg border-2 transition-all duration-300 hover:scale-110 flex items-center justify-center overflow-hidden"
                    style={{
                      backgroundColor: `${color.hex}20`,
                      borderColor: accentColor === color.class ? '#fff' : `${color.hex}60`,
                      boxShadow: accentColor === color.class 
                        ? `0 0 15px ${color.hex}80, 0 0 25px ${color.hex}40`
                        : `0 0 8px ${color.hex}40`,
                    }}
                    onClick={() => {
                      setAccentColor(color.class);
                      showMessage(`◉ ${color.name.toUpperCase()} MODE ACTIVATED`);
                    }}
                    onMouseEnter={(e) => {
                      // Prevent panel from closing when hovering over colors
                      e.stopPropagation();
                    }}
                    title={`${color.name.toUpperCase()} MODE`}
                  >
                    {/* Color core */}
                    <div 
                      className="w-6 h-6 rounded-full border transition-all duration-200 group-hover/color:scale-110"
                      style={{ 
                        backgroundColor: color.hex,
                        borderColor: accentColor === color.class ? '#fff' : 'transparent',
                        borderWidth: '2px',
                      }}
                    />

                    {/* Selected indicator */}
                    {accentColor === color.class && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-lg" />
                      </div>
                    )}

                    {/* Hover glow */}
                    <div 
                      className="absolute inset-0 rounded-lg opacity-0 group-hover/color:opacity-40 transition-opacity duration-200"
                      style={{
                        backgroundColor: color.hex,
                        filter: 'blur(8px)',
                      }}
                    />

                    {/* Scanning lines on hover */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover/color:opacity-60 transition-opacity duration-200 overflow-hidden rounded-lg"
                      style={{
                        background: `linear-gradient(45deg, transparent 30%, ${color.hex}60 50%, transparent 70%)`,
                        animation: 'scan-line 1.5s linear infinite',
                      }}
                    />
                  </button>
                ))}
              </div>

              {/* Status Footer */}
              <div 
                className="flex items-center justify-between text-xs pt-2 border-t"
                style={{ 
                  borderColor: `${getAccentHex(accentColor)}30`,
                  color: '#9ca3af',
                  fontFamily: '"Rajdhani", sans-serif',
                }}
              >
                <span>Click to activate theme</span>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: getAccentHex(accentColor) }}
                  />
                  <span style={{ color: getAccentHex(accentColor) }}>ONLINE</span>
                </div>
              </div>

              {/* Corner accent lines */}
              <div 
                className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 rounded-tr opacity-60"
                style={{ borderColor: getAccentHex(accentColor) }}
              />
              <div 
                className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 rounded-bl opacity-60"
                style={{ borderColor: getAccentHex(accentColor) }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Extra keyframe for slow pulsing neon effect */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2.5s infinite;
        }
      `}</style>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 gap-4 sm:gap-8 w-full max-w-6xl mt-24 sm:mt-32 md:mt-20">
        {/* Center - Clock and Date */}
        <Clock accentColor={accentColor} />

        {/* Focus Timer Panel */}
        <FocusTimer
          accentColor={accentColor}
          showMessage={showMessage}
          IconButton={IconButton} />

        {/* Music and Tasks Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 col-span-1 md:col-span-full">
          <MusicPanel
            youtubeUrl={youtubeUrl}
            setYoutubeUrl={setYoutubeUrl}
            showMessage={showMessage}
            accentColor={accentColor}
            IconButton={IconButton}
          />

          {/* Tasks Panel */}
          <div className="p-4 sm:p-6 border-2 rounded-xl border-gray-700 flex flex-col justify-between min-h-[150px] sm:min-h-[200px]">
            <TaskPanel accentColor={accentColor} IconButton={IconButton} />
          </div>
        </div>
      </div>

      {/* Enhanced Footer Branding */}
      <footer className="mt-8 sm:mt-12 text-center">
        <div className="flex flex-col items-center space-y-2">
          <div 
            className="flex items-center space-x-2 text-sm text-gray-500"
            style={{ fontFamily: '"Rajdhani", sans-serif', fontWeight: 300 }}
          >
            <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
            <span>Coded for Peak Productivity</span>
            <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
          </div>
          <div 
            className="text-lg sm:text-xl flex items-center space-x-2"
            style={{ color: getAccentHex(accentColor), fontFamily: '"Rajdhani", sans-serif', fontWeight: 400 }}
          >
            <span>Developed by</span>
            <a
              href="https://github.com/DSrinivasKarthik" // Replace with your actual GitHub username
              target="_blank"
              rel="noopener noreferrer"
              className="relative group cursor-pointer"
              onClick={() => showMessage('Redirecting to GitHub...')}
            >
              <div
                className="font-bold tracking-wider transition-all duration-300 group-hover:scale-110 relative overflow-hidden px-3 py-1 rounded-lg border border-transparent group-hover:border-current"
                style={{
                  color: getAccentHex(accentColor),
                  textShadow: `
                    0 0 4px ${getAccentHex(accentColor)},
                    0 0 10px ${getAccentHex(accentColor)}80,
                    0 0 20px ${getAccentHex(accentColor)}60
                  `,
                  fontFamily: '"Orbitron", monospace',
                  fontWeight: 700,
                }}
              >
                {/* Animated background on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(45deg, ${getAccentHex(accentColor)}40, transparent, ${getAccentHex(accentColor)}40)`,
                    backgroundSize: '200% 200%',
                    animation: 'gradient-shift 2s ease infinite',
                  }}
                />
                
                {/* Matrix-style binary rain effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 overflow-hidden">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute text-xs font-mono opacity-60"
                      style={{
                        left: `${i * 12.5}%`,
                        top: '-20px',
                        color: getAccentHex(accentColor),
                        animation: `matrix-rain 1.5s linear infinite ${i * 0.2}s`,
                      }}
                    >
                      {Math.random() > 0.5 ? '1' : '0'}
                    </div>
                  ))}
                </div>

                {/* Glitch effect overlay */}
                <div className="relative z-10 group-hover:animate-pulse">
                  DSK
                </div>

                {/* Hover tooltip */}
                <div 
                  className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-900 rounded-lg border text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap"
                  style={{
                    borderColor: getAccentHex(accentColor),
                    boxShadow: `0 0 10px ${getAccentHex(accentColor)}40`,
                  }}
                >
                  <span className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span>View GitHub</span>
                  </span>
                  {/* Tooltip arrow */}
                  <div 
                    className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"
                    style={{
                      borderTopColor: getAccentHex(accentColor),
                    }}
                  />
                </div>
              </div>
            </a>
          </div>
        </div>
      </footer>

      {/* Subtle background grid pattern */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(${getAccentHex(accentColor)}20 1px, transparent 1px),
            linear-gradient(90deg, ${getAccentHex(accentColor)}20 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes matrix-rain {
          0% {
            transform: translateY(-20px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(40px);
            opacity: 0;
          }
        }

        @keyframes glitch {
          0% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(-2px, -2px);
          }
          60% {
            transform: translate(2px, 2px);
          }
          80% {
            transform: translate(2px, -2px);
          }
          100% {
            transform: translate(0);
          }
        }

        @keyframes scan-line {
          0% {
            transform: translateX(-100%) skewX(-15deg);
          }
          100% {
            transform: translateX(200%) skewX(-15deg);
          }
        }

        @keyframes orbit {
          0% {
            transform: rotate(0deg) translateX(85px) rotate(0deg);
          }
          100% {
            transform: rotate(360deg) translateX(85px) rotate(-360deg);
          }
        }

        /* Additional hover effects */
        .group:hover .relative.z-10 {
          animation: glitch 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default App;