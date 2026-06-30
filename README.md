# Roswell: The Morning After

[![Support me on Patreon](https://img.shields.io/badge/Patreon-Support%20my%20work-FF424D?style=flat&logo=patreon&logoColor=white)](https://www.patreon.com/AndersBjarby)

An interactive web-based investigation game set on the morning after the 1947 Roswell UFO incident. The Roswell Army Air Field has just announced it recovered a "flying disc" — you arrive to interview witnesses, gather evidence, and uncover what really crashed on the Foster Ranch before the cover-up is complete. Witnesses are AI-powered and you investigate by talking to them via chat.

## Features

- **AI witnesses** — characters respond in-character through an LLM proxied server-side.
- **Dual-call AI architecture** — every player message triggers two parallel calls: one for the in-character reply, one hidden "analysis" call that decides which clues the answer revealed.
- **Clue-driven progression** — revealing clues unlocks new map locations; locations hold characters; characters reveal more clues. The game data spans 24 locations, 34 characters, and 113 clues.
- **Noir map** — Leaflet with CartoDB dark tiles for the period investigation feel.
- Game data (locations, characters, clues) seeded into SQLite from `data/roswell_game_data.json`.

## Setup

```bash
npm install && cd client && npm install   # install all dependencies
cd ..
npm run db:seed                            # seed database from JSON
npm run dev                                # start server (3001) + client (5173)
```

Other commands:

```bash
npm run db:reset   # drop and re-seed the database
npm run build      # production build (client)
npm start          # production server (serves the built client)
```

Set up your environment from `.env.example` — an `OPENROUTER_API_KEY` is required (the chat backend calls OpenRouter, model `anthropic/claude-haiku-4.5`).

## Tech

Node.js + Express + better-sqlite3 (backend), React 18 + Vite + Tailwind CSS + Leaflet (frontend), SQLite database, OpenRouter API for the AI chat.
