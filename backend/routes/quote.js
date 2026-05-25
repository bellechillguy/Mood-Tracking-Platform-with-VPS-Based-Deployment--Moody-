// routes/quote.js — Proxy for ZenQuotes public API (external API integration)
const express = require('express');
const fetch   = require('node-fetch');

const router  = express.Router();

const FALLBACK = [
  { q: "You don't have to control your thoughts. You just have to stop letting them control you.", a: "Dan Millman" },
  { q: "Self-care is not self-indulgence, it is self-preservation.", a: "Audre Lorde" },
  { q: "Vulnerability is not winning or losing; it's having the courage to show up.", a: "Brené Brown" },
  { q: "You are not your illness. You have an individual story to tell.", a: "Julian Seifter" },
  { q: "Mental health is not a destination, but a process. It's about how you drive, not where you're going.", a: "Noam Shpancer" },
  { q: "It's okay to not be okay — as long as you are not giving up.", a: "Karen Salmansohn" },
];

// GET /api/quote — returns a random motivational quote
router.get('/', async (req, res) => {
  try {
    // ZenQuotes.io public API (no auth required)
    const response = await fetch('https://zenquotes.io/api/random', { timeout: 4000 });
    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    if (Array.isArray(data) && data[0]?.q) {
      return res.json({ quote: data[0].q, author: data[0].a, source: 'zenquotes.io' });
    }
    throw new Error('Unexpected format');
  } catch {
    // Fallback to curated local quotes
    const pick = FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
    res.json({ quote: pick.q, author: pick.a, source: 'local' });
  }
});

module.exports = router;