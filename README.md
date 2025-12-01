# 🎮 Gamify - Productivity Tracker

Gamify is a gamified productivity tracking application that turns your work into a RPG. It tracks your active window usage, awards XP for productive time, and helps you stay focused with a Pomodoro timer and a persistent desktop widget.

![Gamify Dashboard](https://raw.githubusercontent.com/placeholder/dashboard.png)

## ✨ Features

- **📊 Live Activity Tracking:** Real-time tracking of apps and websites 
- **🎮 Gamification:**
  - Earn **XP** for every minute of productive work.
  - Level up and unlock new ranks.
  - View your top "Quests" (projects/apps).
- **⏱️ Focus Timer:** Built-in Pomodoro timer with Focus, Short Break, and Long Break modes.
- **🎛️ Desktop Widget:** A floating, always-on-top widget to keep your stats and controls visible without cluttering your screen.
- **📈 Insights:** Visualize your productivity with heatmaps and hourly breakdown charts.
- **🖥️ Desktop Experience:** Wrapped in Electron for a native feel with tray support and custom window behaviors.

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Styling:** Tailwind CSS v4, Framer Motion
- **Charts:** Recharts
- **Icons:** Lucide React
- **Desktop Wrapper:** Electron
- **Data Source:** ActivityWatch (Local API)

## 🚀 Getting Started

### Prerequisites

1.  **Node.js:** Ensure you have Node.js installed (v18+ recommended).
2.  **ActivityWatch:** You **MUST** have [ActivityWatch](https://activitywatch.net/) installed and running in the background. Gamify connects to the local ActivityWatch server (`localhost:5600`) to fetch your data.

### Installation

1.  Clone the repository (if applicable) or navigate to the project folder:
    ```bash
    cd gamify-app
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### 🏃‍♂️ How to Run

#### Option 1: Desktop App (Recommended) 🏆
This launches the application in a dedicated Electron window with the floating widget capability.

```bash
npm run electron:dev
```

#### Option 2: Web App
This runs the application in your default web browser. Note that the "Always on Top" widget feature will not work as intended in a standard browser tab.

```bash
npm run dev
```

## 📂 Project Structure

- `src/components`: Reusable UI components (Sidebar, ControlBar, etc.)
- `src/pages`: Main application pages (Dashboard, Timer, Insights, Widget, etc.)
- `src/lib`: Utilities, gamification logic, and API clients.
- `electron`: Electron main process configuration.

## 🧩 Key Components

- **Dashboard:** The command center showing your daily stats.
- **WidgetPage:** The compact, transparent window designed for the desktop widget.
- **ControlBar:** The persistent bottom bar for timer controls.
- **gamification.ts:** The core logic that calculates XP and levels from your raw activity data.

## 🤝 Contributing

Feel free to open issues or submit pull requests to help improve your productivity game!
