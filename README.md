# Eeshan Agarwal — Personal Site

Personal portfolio / dev-log site — a "PCB chip rack" where each project renders as an
interactive chip footprint on a 3D circuit board.

**Live:** _add your Vercel URL here after deploying_

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + React 19 + TypeScript
- [three.js](https://threejs.org) for the interactive 3D PCB scene
- Tailwind CSS v4 for base styles, hand-tuned CSS design tokens for everything else
- Gemini API (`gemini-2.5-flash`) powering the "ask me anything" terminal on the About section

## Features

- **Hero — the board.** Every project is a chip footprint on a real-time 3D PCB (three.js),
  with per-component realism (BGA/heatsink SoC, SOIC-8 gull-wing leads, webcam/sensor module,
  THT MCU + LED assembly). Click a chip to eject it and open a case study.
- **About.** A terminal-style Q&A (`/api/ask-eeshan`) that answers questions in Eeshan's own
  voice, backed by Gemini.
- **The Log.** A horizontally-scrolling marquee of self-hosted build-log video clips that
  expand in place (not a modal) when clicked.
- **Case studies.** Each project has a full case study — problem, approach, live demo
  (either an embedded interactive mock or a link out), and source link.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Create a `.env.local` (gitignored, never committed) with:

```
GEMINI_API_KEY=your-key-here
```

Required for the About section's "ask me anything" terminal (`/api/ask-eeshan`). The rest of
the site works without it.

## Project structure

```
src/
  app/                  # Next.js App Router routes (/, /project, API routes)
  components/pcb/       # All site components — Hero, PCB 3D scene, About, Log, Footer, UI kit
  content/              # Project + profile copy/data
public/
  logos/                # School logos
  log/                   # Self-hosted build-log video clips + poster frames
```

## Build

```bash
npm run build
```

## Deploy

Deployed on [Vercel](https://vercel.com). Push to `main` and Vercel handles the rest — set
`GEMINI_API_KEY` in the project's Environment Variables in the Vercel dashboard.
