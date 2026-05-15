# MemoryVerse 🌌

A cinematic memory journal with mood detection, animated timeline, and music recommendations.

## Quick Start

```bash
pip install -r requirements.txt
python app.py
```

Then open: http://localhost:5000

## Project Structure

```
memoryverse/
├── app.py                  # Flask backend + API routes
├── requirements.txt        # Python dependencies
├── data/
│   └── memories.json       # JSON "database" (auto-created)
├── templates/
│   └── index.html          # Main HTML (Jinja2)
└── static/
    ├── css/
    │   └── style.css       # All styles + mood themes
    └── js/
        └── app.js          # Frontend logic
```

## Features
- Animated glassmorphism landing page
- Add memories with title, date, description, image
- Auto mood detection from text (7 moods)
- Dynamic color themes per mood
- Animated timeline with filter
- Floating particle system
- Music recommendations per mood
- Modal detail view
- JSON data storage
