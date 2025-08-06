// src/utils/colors.ts

export const colors = [
  { name: 'Green', class: 'text-green-400', bg: 'bg-green-400' },
  { name: 'Red', class: 'text-red-400', bg: 'bg-red-400' },
  { name: 'Blue', class: 'text-blue-400', bg: 'bg-blue-400' },
  { name: 'Yellow', class: 'text-yellow-400', bg: 'bg-yellow-400' },
  { name: 'Cyan', class: 'text-cyan-400', bg: 'bg-cyan-400' },
  { name: 'Magenta', class: 'text-fuchsia-400', bg: 'bg-fuchsia-400' },
  { name: 'White', class: 'text-white', bg: 'bg-white' },
];

export const accentColorMap: Record<string, string> = {
  'text-green-400': '#4ade80',
  'text-red-400': '#f87171',
  'text-blue-400': '#60a5fa',
  'text-yellow-400': '#facc15',
  'text-cyan-400': '#22d3ee',
  'text-fuchsia-400': '#e879f9',
  'text-white': '#ffffff',
};

// Helper function to get HEX from class name safely
export const getAccentHex = (className: string): string => {
  return accentColorMap[className] || '#4ade80'; // Default to green if missing
};
