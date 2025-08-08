## Getting Started

### Prerequisites
- **Node.js** v20 or higher
- **npm** v10

### Install dependencies
```bash
npm install
```

### Run all packages in development
```bash
npm run dev
```
This will start every package via [Turborepo](https://turbo.build/).

### Start individual packages
```bash
# Horizon (Next.js frontend)
npm run dev --workspace=packages/thehorizon

# Grid (backend engine)
npm run dev --workspace=packages/thegrid

# Core
npm start --workspace=packages/thecore

```

## Principles of HQ

> _HQ is not just an app. HQ is a system for life control._  
> _Designed to reduce noise. Built to amplify clarity._

---

### 1. The Horizon → _What You See_

The Horizon is your daily cockpit.

It exists to show only what matters _right now_.  
No distractions. No noise. No unnecessary complexity.

> If it’s not on The Horizon — it doesn’t exist today.

---

### 2. The Grid → _How It Works_

The Grid is the engine beneath everything.  
Silent. Relentless. Always on.

Rules live here. Data flows here. Automations execute here.

> The Grid doesn’t need to look good — it needs to _work_ perfectly.

---

### 3. The Core → _Who You Are_

The Core holds your constants.  
Your values. Your personal truths.

It's small. Sacred. Untouchable unless intentionally changed.

> Protect The Core. Build around it — never against it.

---

### 4. HQ → _The Command Center_

HQ connects it all.

A single source of truth.  
A place to regain control.  
A place to reset.  
A place to plan and execute without chaos.

> HQ is built for one user only: _you._

---

### 5. Systems Over Motivation

HQ is designed to _remove_ willpower from the equation.  
Habits tracked. Tasks scheduled. Reflections automated.  
The system works — even when you don't feel like it.

> Motivation fades. Systems stay.

---

### 6. Daily Inputs. Automated Outputs.

Your job is simple:

- Show up.
- Mark your progress.
- Reflect.

HQ will handle the rest:

- Reminders.
- Reflections.
- Summaries.
- Trends.
- AI Feedback.

> Small daily inputs → Big life outputs.

---

### Final Thought:

> _The Horizon gives you clarity._  
> _The Grid gives you power._
> _The Core gives you direction._
> _HQ gives you control._

---

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and fill in your values.
