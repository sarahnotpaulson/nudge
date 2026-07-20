# Nudge — Behavioral Design Pattern Library

A research-backed, AI-powered reference tool that helps designers and product managers apply behavioral psychology to real product challenges.

Built by **Sarah Kim** (product, research, engineering) and **Priscilla Kim** (industrial design, visual system, Figma).

---

## What It Does

Nudge is a searchable library of 18 behavioral design patterns — drawn from cognitive psychology, behavioral economics, and HCI research — with an AI recommender that takes your specific product problem and returns the most relevant patterns and how to apply them.

**Core features:**
- Browse and search 18 behavioral patterns across categories including cognitive biases, social influence, framing effects, and defaults
- Interactive before/after demos showing each pattern applied to a real UI
- AI-powered recommender: describe your product challenge, get specific pattern recommendations and application guidance
- Conversational follow-up — ask clarifying questions and the AI responds in context
- Animated scene transitions and a fully custom visual design system

---

## Patterns Included

| Pattern | Category |
|--------|----------|
| Jakob's Law | Familiarity |
| Fitts's Law | Motor Efficiency |
| Hick's Law | Decision Making |
| Feedback Loops | Engagement |
| Gestalt Principles | Visual Perception |
| Temporal Discounting | Motivation |
| Peak-End Rule | Memory |
| Framing Effect | Framing |
| Zeigarnik Effect | Engagement |
| Reciprocity Principle | Social Influence |
| Personalization | Relevance |
| Emotional Design | Connection |
| Habit Formation | Retention |
| Anchoring Bias | Decision Making |
| Loss Aversion | Motivation |
| Social Proof | Social Influence |
| Decision Fatigue | Cognitive Load |
| Cognitive Load | Usability |

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Frontend | React + TypeScript (Vite) |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| AI | Anthropic API (Claude claude-sonnet-4-5) |
| Design | Figma |
| Hosting | Vercel |
| Version Control | GitHub |

---

## How to Run Locally

**Prerequisites:** Node.js (v18+)

```bash
# Clone the repo
git clone https://github.com/sarahnotpaulson/nudge.git
cd nudge

# Install dependencies
npm install

# Add your Anthropic API key
# Create a .env file in the root and add:
# VITE_ANTHROPIC_KEY=your-key-here

# Start the dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_ANTHROPIC_KEY` | Your Anthropic API key from console.anthropic.com |

Never commit your `.env` file. It is listed in `.gitignore`.

---

## Project Structure

```
src/
├── app/
│   └── App.tsx          # Main application — all components, data, and AI logic
└── ...
public/                  # Static assets
```

---

## How the AI Recommender Works

When a user describes a product challenge, the app:

1. Scores all 18 patterns against the query using keyword matching
2. Selects the top 3 most relevant patterns
3. Sends the query, conversation history, and pattern details to the Anthropic API
4. Streams back a contextual explanation of how each pattern applies to the specific challenge
5. Maintains full conversation context for follow-up questions

---

## Background

This project started as a question: why do designers learn behavioral psychology in school but rarely apply it systematically in their work? Nudge is an attempt to close that gap — making behavioral design principles fast to find, easy to understand, and directly actionable for a specific product problem.

The research layer draws on foundational work from Kahneman & Tversky (prospect theory, framing effects, anchoring), Cialdini (social influence), Nielsen (usability heuristics), Norman (emotional design), and Duhigg (habit formation), among others.

---

## Collaboration

This project was a cross-disciplinary collaboration:

- **Sarah Kim** — product scope, behavioral research, React/TypeScript engineering, Anthropic API integration, deployment
- **[Friend's Name]** — visual identity, Figma design system, component library, interactive demo design, animation direction

---

## Live Demo

[nudge.vercel.app](https://nudge.vercel.app) ← update with your actual Vercel URL once deployed