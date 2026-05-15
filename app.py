"""
MemoryVerse - Flask Backend
============================
API routes:
  GET  /api/memories        → list all memories
  POST /api/memories        → add memory (multipart: title, date, description, image)
  DELETE /api/memories/<id> → delete memory
  POST /api/mood            → detect mood + get music recs  { "text": "..." }
"""

import os, json, uuid
from datetime import datetime
from flask import Flask, request, jsonify, render_template, send_from_directory
from werkzeug.utils import secure_filename

# ── App config ────────────────────────────────────────────────────────
app = Flask(__name__)
app.config['UPLOAD_FOLDER']        = os.path.join('static', 'uploads')
app.config['MAX_CONTENT_LENGTH']   = 10 * 1024 * 1024   # 10 MB
app.config['ALLOWED_EXTENSIONS']   = {'png','jpg','jpeg','gif','webp'}
DATA_FILE = 'memories.json'


# ── Helpers ───────────────────────────────────────────────────────────

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def load_memories():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_memories(memories):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(memories, f, indent=2, ensure_ascii=False)


def _detect_mood(text):
    """Keyword-based mood detection. Returns one of 6 mood strings."""
    t = text.lower()
    keywords = {
        'happy':     ['happy','joy','wonderful','great','amazing','love','laugh',
                      'smile','fun','celebrate','fantastic','blessed','grateful','beautiful'],
        'sad':       ['sad','miss','cry','lost','alone','hurt','pain','grieve',
                      'heartbreak','lonely','mourn','tear','sorrow','grief'],
        'excited':   ['excited','thrill','adventure','wow','incredible','epic',
                      'rush','energy','pumped','wild','crazy','insane'],
        'peaceful':  ['peace','calm','serene','quiet','relax','gentle','still',
                      'tranquil','meditat','breath','nature','sunset','sunrise'],
        'nostalgic': ['remember','childhood','old','past','memory','long ago',
                      'used to','back then','miss','years ago','grew up','classic'],
        'anxious':   ['worry','anxious','nervous','stress','afraid','fear',
                      'uncertain','overwhelm','panic','tense','dread'],
    }
    scores = {mood: sum(1 for w in words if w in t) for mood, words in keywords.items()}
    best   = max(scores, key=scores.get)
    return best if scores[best] > 0 else 'peaceful'


def _music_for(mood):
    """Return 4 track dicts for the given mood."""
    db = {
        'happy':     [
            {'title':'Good as Hell',          'artist':'Lizzo',              'genre':'Pop',       'vibe':'🌟 Empowering'},
            {'title':'Happy',                 'artist':'Pharrell Williams',  'genre':'Pop',       'vibe':'☀️ Uplifting'},
            {'title':"Can't Stop the Feeling",'artist':'Justin Timberlake', 'genre':'Pop',       'vibe':'💃 Dance'},
            {'title':'Levitating',            'artist':'Dua Lipa',          'genre':'Pop',       'vibe':'✨ Joyful'},
        ],
        'sad':       [
            {'title':'Someone Like You',  'artist':'Adele',          'genre':'Soul',   'vibe':'💙 Healing'},
            {'title':'The Night We Met',  'artist':'Lord Huron',     'genre':'Indie',  'vibe':'🌙 Melancholic'},
            {'title':'Skinny Love',       'artist':'Bon Iver',       'genre':'Folk',   'vibe':'🍂 Raw'},
            {'title':'Fix You',           'artist':'Coldplay',       'genre':'Rock',   'vibe':'🕊️ Comforting'},
        ],
        'excited':   [
            {'title':'Blinding Lights', 'artist':'The Weeknd',       'genre':'Synth-pop','vibe':'⚡ Electric'},
            {'title':'INDUSTRY BABY',   'artist':'Lil Nas X',        'genre':'Hip-Hop',  'vibe':'🔥 Hype'},
            {'title':'Thunder',         'artist':'Imagine Dragons',  'genre':'Rock',     'vibe':'⛈️ Powerful'},
            {'title':'Dynamite',        'artist':'BTS',              'genre':'K-Pop',    'vibe':'💥 Energetic'},
        ],
        'peaceful':  [
            {'title':'Weightless',   'artist':'Marconi Union',       'genre':'Ambient',   'vibe':'🌊 Zen'},
            {'title':'Experience',   'artist':'Ludovico Einaudi',    'genre':'Classical', 'vibe':'🎹 Serene'},
            {'title':'Holocene',     'artist':'Bon Iver',            'genre':'Indie',     'vibe':'🌿 Calm'},
            {'title':'Re: Stacks',  'artist':'Bon Iver',            'genre':'Folk',      'vibe':'🍃 Gentle'},
        ],
        'nostalgic': [
            {'title':'Vienna',     'artist':'Billy Joel',            'genre':'Classic',   'vibe':'📻 Timeless'},
            {'title':'1979',       'artist':'The Smashing Pumpkins', 'genre':'Alt Rock',  'vibe':'🕰️ Retro'},
            {'title':'Fast Car',   'artist':'Tracy Chapman',         'genre':'Folk',      'vibe':'🚗 Wistful'},
            {'title':'The Chain',  'artist':'Fleetwood Mac',         'genre':'Rock',      'vibe':'🔗 Classic'},
        ],
        'anxious':   [
            {'title':'Breathe (2 AM)',  'artist':'Anna Nalick',           'genre':'Folk',      'vibe':'🫁 Soothing'},
            {'title':'Let It Be',       'artist':'The Beatles',           'genre':'Classic',   'vibe':'☮️ Reassuring'},
            {'title':'The Middle',      'artist':'Zedd ft. Maren Morris', 'genre':'EDM',       'vibe':'🌀 Release'},
            {'title':'Clair de Lune',   'artist':'Debussy',               'genre':'Classical', 'vibe':'🌙 Grounding'},
        ],
    }
    return db.get(mood, db['peaceful'])


# ── Routes ────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/memories', methods=['GET'])
def get_memories():
    memories = sorted(load_memories(), key=lambda m: m.get('created_at',''), reverse=True)
    return jsonify({'success': True, 'memories': memories})


@app.route('/api/memories', methods=['POST'])
def add_memory():
    title       = request.form.get('title','').strip()
    date        = request.form.get('date','').strip()
    description = request.form.get('description','').strip()

    if not title or not date or not description:
        return jsonify({'success': False, 'error': 'Title, date, and description required.'}), 400

    image_url = None
    if 'image' in request.files:
        f = request.files['image']
        if f and f.filename and allowed_file(f.filename):
            fname = secure_filename(f'{uuid.uuid4()}_{f.filename}')
            os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
            f.save(os.path.join(app.config['UPLOAD_FOLDER'], fname))
            image_url = f'/static/uploads/{fname}'

    mood   = _detect_mood(description)
    memory = {
        'id':          str(uuid.uuid4()),
        'title':       title,
        'date':        date,
        'description': description,
        'image_url':   image_url,
        'mood':        mood,
        'created_at':  datetime.utcnow().isoformat(),
    }
    memories = load_memories()
    memories.append(memory)
    save_memories(memories)
    return jsonify({'success': True, 'memory': memory}), 201


@app.route('/api/memories/<memory_id>', methods=['DELETE'])
def delete_memory(memory_id):
    memories = load_memories()
    updated  = [m for m in memories if m['id'] != memory_id]
    if len(updated) == len(memories):
        return jsonify({'success': False, 'error': 'Not found.'}), 404
    save_memories(updated)
    return jsonify({'success': True})


@app.route('/api/mood', methods=['POST'])
def mood_api():
    data = request.get_json(silent=True) or {}
    text = data.get('text','')
    if not text:
        return jsonify({'success': False, 'error': 'text field required'}), 400
    mood  = _detect_mood(text)
    music = _music_for(mood)
    return jsonify({'success': True, 'mood': mood, 'music': music})


@app.route('/static/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


# ── Main ──────────────────────────────────────────────────────────────
if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    print('MemoryVerse -> http://localhost:5000')
    app.run(debug=True, port=5000)
