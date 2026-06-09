# AGENTS.md — Lyric App Project Context

## What you are helping build

A **mobile app for music artists** that solves creator's block and streamlines the songwriting process. The app is targeted at the **East African / Kenyan market** where mobile usage dominates over desktop/web. The primary audience is independent music artists who write their own lyrics or collaborate with ghost writers.

---

## Core features

### 1. Lyrics editor
- Artists write and save lyrics inside the app
- Drafts are stored locally on the device first (offline support is critical — connectivity can be patchy)
- Lyrics sync to the cloud when internet is available
- Artists can return to saved songs and continue editing at any time

### 2. AI lyric suggestions (creator's block assistant)
- When an artist is stuck, they can request AI-generated lyric suggestions
- The AI reads the existing lyrics in the editor and suggests the next line, verse, or chorus
- Suggestions must match the tone, genre, rhyme scheme, and mood of what the artist has already written
- The artist accepts, rejects, or edits any suggestion — the AI never overwrites their work

### 3. Key and instrument recommendations
- The artist inputs or the app infers the genre and mood of the song
- The AI suggests a suitable musical key for the song
- The AI recommends instruments that fit the vibe (e.g. acoustic guitar + light percussion for an afro-soul ballad)

### 4. Ghost writer marketplace (future feature — v2 or later)
- Artists can search for and connect with real ghost writers
- Ghost writers create profiles showcasing their style and genre specialties
- Communication, booking, and collaboration tools between artist and ghost writer
- This is the most complex feature and is intentionally scoped out of v1

---

## Tech stack

| Layer | Technology | Notes |
|---|---|---|
| Mobile frontend | React Native + Expo | JavaScript/TypeScript. Expo used for fast dev and testing on real Android device |
| Navigation | React Navigation | Standard screen routing for React Native |
| Backend / API | Node.js + Express | Handles AI API calls securely, business logic |
| Backend hosting | Railway or Render | Free tier hosting for Node.js server |
| Database + auth | Supabase | PostgreSQL, real-time sync, built-in auth. Open source Firebase alternative |
| Offline storage | AsyncStorage | Saves lyric drafts locally on device when offline |
| AI model | Google Gemini API (Gemini 2.0 Flash) | Free tier. Used for lyric suggestions and music recommendations |
| Version control | Git + GitHub | Standard |
| Code editor | VS Code | |

---

## Key decisions already made

- **Mobile only** (Android first, iOS later from same codebase)
- **Online/cloud AI** — Gemini API called from the backend server, not run locally
- **No Firebase** — Supabase chosen over Firebase for its more generous open-source free tier and PostgreSQL
- **No agent framework needed** — AI integration is simple API calls with well-crafted prompts, not autonomous agents
- **Free tier everything** — the developer has no budget; every tool must have a usable free tier
- **Offline-first for lyrics** — AsyncStorage saves drafts locally, syncs to Supabase when online

---

## Developer profile

- Comfortable with **JavaScript / TypeScript** and **Python**
- Building solo on a **laptop** (no dedicated workstation)
- Located in **Kenya (East Africa)**
- New to AI/API integration but experienced enough with code to follow implementation guides
- No budget for paid tools or APIs during development

---

## What has NOT been decided yet

- App name
- UI design / color scheme / branding
- Monetization model (free app? freemium? subscription?)
- Exact database schema
- Authentication method (email/password vs phone number vs Google OAuth)

---

## How the AI integration works (conceptually)

```
Artist writes lyrics in editor
        ↓
Taps "suggest next line" button
        ↓
App sends lyrics to Node.js backend
        ↓
Backend builds a prompt + calls Gemini API
        ↓
Gemini returns suggestion
        ↓
App displays suggestion to artist
        ↓
Artist accepts / edits / rejects
```

The backend prompt sent to Gemini looks roughly like this:

```
You are a creative songwriting assistant helping a music artist.
The artist is writing a song in the [genre] genre with a [mood] mood.
Here are the lyrics so far:

[LYRICS]

Suggest the next [line / verse / chorus]. 
Match the rhyme scheme, tone, and style of the existing lyrics.
Return only the suggested lyrics — no explanation.
```

---

## Priorities for v1 (what to build first)

1. Lyrics editor with save/load (local + Supabase sync)
2. AI lyric suggestion button
3. User authentication (sign up / log in)
4. Key and instrument suggestion screen
5. Basic song library (list of saved songs)

Ghost writer marketplace is explicitly **out of scope for v1**.

---

## Instructions for the AI reading this file

- Always assume **React Native + Expo** for any frontend code
- Always assume **Node.js + Express** for any backend code
- Always assume **Supabase** for database and auth — do not suggest Firebase
- Always assume **Gemini API (free tier)** for AI features — do not suggest OpenAI unless asked
- The developer knows how to code but is new to mobile development and AI APIs — explain new concepts clearly
- Suggest free tools and libraries wherever possible
- Keep Android as the primary target — do not over-engineer for iOS compatibility in v1
- When writing code, use **JavaScript** unless the developer asks for TypeScript
- Offline support for the lyrics editor is non-negotiable — always account for it