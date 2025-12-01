from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import db, Bucket, Event, init_db
import threading
import time
import datetime
import win32gui
import win32process
import psutil

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB
init_db()

# --- Tracker Logic ---
def get_active_window():
    try:
        hwnd = win32gui.GetForegroundWindow()
        _, pid = win32process.GetWindowThreadProcessId(hwnd)
        process = psutil.Process(pid)
        app_name = process.name()
        title = win32gui.GetWindowText(hwnd)
        return {"app": app_name, "title": title}
    except Exception:
        return None

def tracker_loop():
    bucket_id = "aw-watcher-window_gamify"
    
    # Ensure bucket exists
    try:
        Bucket.get(Bucket.id == bucket_id)
    except Bucket.DoesNotExist:
        Bucket.create(id=bucket_id, type="window", client="gamify-tracker", hostname="local")

    last_window = None
    
    while True:
        window = get_active_active_window = get_active_window()
        timestamp = datetime.datetime.now()
        
        if window:
            # Heartbeat logic
            try:
                last_event = Event.select().where(Event.bucket == bucket_id).order_by(Event.timestamp.desc()).get()
                
                # If same window and close in time (< 5s gap), merge
                time_diff = (timestamp - last_event.timestamp).total_seconds()
                if last_event.data == window and time_diff < (last_event.duration + 5):
                    last_event.duration = time_diff
                    last_event.save()
                else:
                    # New event
                    Event.create(bucket=bucket_id, timestamp=timestamp, duration=0, data=window)
            except Event.DoesNotExist:
                Event.create(bucket=bucket_id, timestamp=timestamp, duration=0, data=window)
        
        time.sleep(1)

# Start tracker in background
threading.Thread(target=tracker_loop, daemon=True).start()

# --- API Endpoints ---

@app.get("/api/0/info")
def get_info():
    return {"hostname": "gamify-local", "version": "1.0.0"}

@app.get("/api/0/buckets/{bucket_id}/events")
def get_events(bucket_id: str, start: str = None, end: str = None):
    query = Event.select().where(Event.bucket == bucket_id)
    
    # Simple date filtering (ISO strings)
    if start:
        query = query.where(Event.timestamp >= start)
    if end:
        query = query.where(Event.timestamp <= end)
        
    events = []
    for e in query.order_by(Event.timestamp.desc()):
        events.append({
            "timestamp": e.timestamp.isoformat(),
            "duration": e.duration,
            "data": e.data
        })
    return events

@app.post("/api/0/query")
def query(query_params: dict):
    # Mock query support for now - just return all events for the window bucket
    # In a real implementation, we'd parse the AW query language
    # But for Gamify, we just need the raw events mostly
    
    bucket_id = "aw-watcher-window_gamify"
    events = get_events(bucket_id)
    return [events] # Return as list of lists to match AW API structure

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5600)
