const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// GET all entries
app.get('/api/entries', (req, res) => {
    db.all('SELECT * FROM entries ORDER BY date DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// POST new entry (or update existing for the same day)
app.post('/api/entries', (req, res) => {
    const { date, mood, journal } = req.body;
    
    if (!date || !mood) {
        res.status(400).json({ error: 'Date and mood are required' });
        return;
    }

    const sql = `INSERT INTO entries (date, mood, journal) 
                 VALUES (?, ?, ?) 
                 ON CONFLICT(date) DO UPDATE SET 
                 mood=excluded.mood, journal=excluded.journal`;
    
    db.run(sql, [date, mood, journal], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Success', id: this.lastID });
    });
});

// Proxy for ZenQuotes to avoid CORS issues
app.get('/api/quote', (req, res) => {
    https.get('https://zenquotes.io/api/random', (proxyRes) => {
        let data = '';
        proxyRes.on('data', (chunk) => { data += chunk; });
        proxyRes.on('end', () => {
            res.send(data);
        });
    }).on('error', (err) => {
        res.status(500).json({ error: 'Failed to fetch quote' });
    });
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Moody Backend running at http://localhost:${PORT}`);
});
