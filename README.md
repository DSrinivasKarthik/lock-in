# Lock-In

Lock-In is a modern productivity dashboard built with Next.js and React, featuring a focus timer, music panel, and task management. The UI is styled with Tailwind CSS and includes dynamic accent color selection for a personalized experience.

## Features

- **Clock & Date**: Real-time display of current time and date.
- **Focus Timer**: Adjustable 50-minute timer with start/pause/reset controls and session completion notification.
- **Music Panel**: Add YouTube music tracks (URL only, playback not implemented yet), with placeholder controls for play/pause, skip, and volume.
- **Task Panel**: Add and remove tasks, with instant feedback and a clean list view.
- **Accent Color Selector**: Choose from several neon accent colors to customize the interface.
- **Responsive Design**: Optimized for both desktop and mobile screens.

## Technologies Used

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

## Project Structure

```
lock-in/
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── package.json
├── tailwind.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── tsconfig.json
├── next.config.ts
└── README.md
```

## Customization
- **Accent Colors**: Change the accent color using the selector in the top-right corner.
- **Focus Timer**: Adjust timer duration in `page.tsx` if needed.

## Limitations & Roadmap
- Music playback is not implemented; only track info is stored.
- Timer skip and music controls are placeholders.
- No persistent storage for tasks or tracks.
- Planned features: YouTube playback integration, persistent storage, advanced settings.

## License
MIT

## Author
DSK
