# 🎮 Gamify - RPG-Style Productivity Tracker

Transform your work into an epic adventure. **Gamify** is a desktop productivity tracker that gamifies your daily tasks by monitoring active window usage, awarding experience points (XP), and helping you level up through focus sessions and Pomodoro-style timers.

## ✨ Key Features

### 🎮 Gamification Engine
- **XP System**: Earn 10 XP per minute of productive work
- **Leveling**: Progress through levels using the formula: `Level = Floor(√(XP / 100))`
- **Real-time Tracking**: Monitor which apps you use and how long you spend on each
- **Daily Stats**: Track your productive time and see your daily achievements

### ⏱️ Smart Timer
- **Focus Mode**: Deep work sessions with persistent tracking
- **Session Memory**: Timer state persists across windows and application restarts
- **Cross-window Sync**: Stay synchronized between the main app and floating widget

### 📊 Analytics & Insights
- **Timeline View**: Hourly breakdown of your productivity (9 AM - 9 PM)
- **App Categories**: See your top 3 apps by time spent with color-coded visualization
- **Trends Page**: Track productivity patterns over time
- **Heatmaps**: Visual representation of your work patterns
- **Activity Breakdown**: Detailed view of all applications and websites

### 🎛️ Floating Desktop Widget
- **Always-on-Top**: Persistent overlay widget that stays visible while you work
- **Compact Display**: Minimal footprint showing current stats and timer controls
- **Quick Access**: Control your timer without switching windows
- **Transparent Design**: Sleek overlay that doesn't distract from your work

### 🎯 Goal Setting & Management
- **Personal Goals**: Set productivity targets for the day/week/month
- **Progress Tracking**: Visual progress bars for each goal
- **Goal Analytics**: See how close you are to achieving your targets

### ⚙️ Customization
- **Settings Page**: Adjust your notification preferences
- **XP Multipliers**: Modify XP earning rates (future feature)
- **Theme Support**: Dark-mode optimized interface

## 🏗️ Architecture

### Frontend Stack
```
React 19 + TypeScript
├── Vite (build tool)
├── Tailwind CSS v4 (styling)
├── Framer Motion (animations)
├── Recharts (data visualization)
├── React Router v7 (navigation)
└── Lucide React (icons)
```

### Desktop Integration
```
Electron 39
├── Native window tracking
├── Always-on-top widget support
├── System tray integration
└── IPC communication with Python backend
```

### Backend Stack
```
Python 3.x
├── FastAPI (REST API)
├── Peewee ORM (database)
├── PyWin32 (Windows process tracking)
└── SQLite (local database)
```

### Data Flow
```
Application Window
    ↓
Python Backend (tracker_loop)
    ↓
SQLite Database (Buckets & Events)
    ↓
FastAPI Endpoints
    ↓
React Frontend (Activity Fetch)
    ↓
Gamification Calculations
    ↓
UI Visualization
```

## 📁 Project Structure

```
gamify-app/
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx          # Collapsible navigation
│   │   ├── Dashboard.tsx        # Main timeline view
│   │   ├── DailySummary.tsx     # Stats summary card
│   │   └── ControlBar.tsx       # Bottom timer controls
│   ├── pages/
│   │   ├── TimerPage.tsx        # Dedicated timer interface
│   │   ├── ActivityPage.tsx     # Detailed activity log
│   │   ├── TrendsPage.tsx       # Productivity trends
│   │   ├── GoalsPage.tsx        # Goal management
│   │   ├── InsightsPage.tsx     # Advanced analytics
│   │   ├── SettingsPage.tsx     # User preferences
│   │   └── WidgetPage.tsx       # Floating widget view
│   ├── lib/
│   │   ├── gamification.ts      # XP & level calculations
│   │   ├── timer.ts             # Shared timer state logic
│   │   └── utils.ts             # Utility functions
│   └── App.tsx                  # Main router setup
├── electron/
│   ├── main.js                  # Electron main process
│   ├── preload.js              # IPC bridge
│   └── main.py                 # Python backend launcher
├── backend/
│   ├── main.py                 # FastAPI server
│   ├── models.py               # Database models
│   └── requirements.txt        # Python dependencies
└── package.json                # Node dependencies & scripts
```

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v18+)
   - [Download Node.js](https://nodejs.org/)

2. **Python** (v3.8+)
   - [Download Python](https://www.python.org/)
   - Ensure Python is added to your PATH

3. **Windows OS** (currently Windows-only due to native window tracking)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/py-kalki/gamify.git
   cd gamify
   ```

2. **Install Node dependencies**
   ```bash
   npm install
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r backend/requirements.txt
   ```

4. **Verify Python installation**
   ```bash
   python --version
   ```

## 🎮 Running the Application

### Option 1: Desktop App (Recommended) 🏆
Launch in a dedicated Electron window with full features including the floating widget.

```bash
npm run electron:dev
```

This will:
- Start the Vite dev server on `http://localhost:5173`
- Start the Python FastAPI backend on `http://localhost:8000`
- Launch the Electron wrapper
- Display the main window with sidebar and dashboard

### Option 2: Web Browser
Run in your default browser without the floating widget feature.

```bash
npm run dev
```

The app will open at `http://localhost:5173`.

### Building for Production

```bash
npm run build
```

This will:
- Compile TypeScript
- Build the React app with Vite
- Generate optimized bundles

## 📊 How It Works

### Activity Tracking
The Python backend continuously monitors your active window:
1. Every second, it captures the foreground window
2. Extracts the process name and window title
3. Creates/updates database entries for activity events
4. Groups events with < 5 second gaps (heartbeat logic)

### XP Calculation
Based on your activity duration:
- **Formula**: XP = Floor(Total Minutes × 10)
- Example: 50 minutes → 500 XP → Level 2 (√(500/100) = 2.2 → 2)

### Data Flow
1. **Windows Hook** → Python tracks foreground window
2. **SQLite Database** → Events stored with timestamp & duration
3. **FastAPI API** → Frontend queries activity data
4. **React Frontend** → Fetches & visualizes data
5. **Gamification Engine** → Calculates XP & level progression

## 🎯 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/0/info` | GET | Server info & version |
| `/api/0/buckets/{bucket_id}/events` | GET | Fetch events for a time period |
| `/api/0/query` | POST | Custom activity queries |

## 🔧 Development

### Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start web dev server |
| `npm run electron:dev` | Start Electron + backend |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint checks |
| `npm run preview` | Preview production build |

### Key Technologies

- **Build**: Vite (lightning-fast HMR)
- **Styling**: Tailwind CSS with custom theme
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Database**: SQLite with Peewee ORM
- **Framework**: FastAPI for backend API

## 🎨 UI/UX Features

- **Collapsible Sidebar**: Expands on hover to show navigation labels
- **Dark Theme**: Eye-friendly dark interface for extended work sessions
- **Real-time Updates**: Data refreshes every 60 seconds
- **Smooth Animations**: Motion-enhanced transitions for all interactions
- **Responsive Design**: Adapts to different window sizes
- **Timeline Grid**: Visual hourly breakdown of activities

## 🐛 Troubleshooting

### Python Backend Won't Start
- Ensure Python is installed and in your PATH
- Run `python --version` to verify installation
- Check that all packages are installed: `pip install -r backend/requirements.txt`

### Activity Not Being Tracked
- Make sure the backend is running (check terminal output)
- The tracker creates events for the foreground window every second
- Check the SQLite database: `gamify.db` in the project root

### Widget Not Appearing
- The floating widget is Electron-only feature
- Use `npm run electron:dev` instead of `npm run dev`
- Check that Electron launched successfully

### Vite Dev Server Connection Issues
- Ensure port 5173 is available
- If port is in use, Vite will auto-select the next available port
- Check terminal output for the actual port

## 📈 Future Enhancements

- [ ] Cross-platform support (Linux, macOS)
- [ ] Cloud synchronization
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] Habit tracking
- [ ] Achievement system with badges
- [ ] Custom XP multipliers per app
- [ ] Weekly/monthly reports

## 📝 License

This project is open source. Check the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs by opening an issue
- Suggest features via discussions
- Submit pull requests with improvements

## 👨‍💻 Author

**Kalki** (py-kalki)
- GitHub: [@py-kalki](https://github.com/py-kalki)
- Project: [Gamify](https://github.com/py-kalki/gamify)

## 📞 Support

Have questions or need help? 
- Open an issue on GitHub
- Check existing documentation in the README
- Review the code comments for implementation details

---

**Start your productivity quest today! Transform your work into an RPG adventure with Gamify. 🚀**
