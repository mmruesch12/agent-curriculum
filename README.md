# Agent Architect Academy

Interactive client-side web app for the **Production Enterprise AI Agents** interview-prep curriculum.

## Quick start

```bash
# Run unit tests
npm test

# Serve locally
npx serve web -l 3456
# Open http://localhost:3456

# Full verification (tests + launch + static inspection)
npm test && node scripts/verify-static.js && node scripts/verify-sim-export.js && npm run verify:launch
```

## Features

- **Dashboard** — timeline, progress rings, streaks, spaced-review nudges
- **Modules** — all 9 curriculum modules with checkpoint quizzes
- **Pattern Lab** — ReAct stepper, topology switcher, LangGraph viewer, RAG cascade, checkpoint timeline, trace/failure explorer, HITL placement, integration diff
- **Architect Workspace** — SVG canvas, 7-step wizard, 3 capstone templates, compare + export
- **Resources** — written links + podcast audio stubs with concept bookmarks
- **Review Mode** — Day 3/7/14 resurfacing

Zero backend. Zero API keys. Progress stored in `localStorage`.