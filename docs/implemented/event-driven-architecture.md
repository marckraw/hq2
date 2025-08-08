# Event-Driven Architecture — HQ Design Manifesto

> _Everything that happens in life is a signal.  
> In HQ — every signal flows through The Grid._

---

## What is Event-Driven Architecture?

Event-Driven Architecture (EDA) is a design pattern where:

- Something happens → Event is emitted
- Multiple independent parts of the system can react
- Decoupled, clean, reactive design

It's the bloodstream of HQ.

---

## Core Flow of Events in HQ

```
[Life Happens]
↓
[Signal Created] → Stored in DB
↓
[Event Emitted] (via EventBus)
↓
[Listeners React] (agents, logic, side effects)
↓
[Notifications / State Changes / SSE / Logs]
↓
[Visible in The Horizon]
```

---

## Benefits for HQ

| Benefit            | Why it Matters                                |
| ------------------ | --------------------------------------------- |
| Modular            | Add/remove logic without breaking other parts |
| Traceable          | Everything logged and observable              |
| Clean              | API logic stays simple                        |
| Real-Time Friendly | Easy to push updates via SSE/WebSocket        |
| Future Proof       | Easy to scale to new features                 |
| Fun to Work With   | No callback hell, pure elegance               |

---

## Golden Rules for Events in HQ

1. Event names follow:
   `<domain>.<action>`

### Examples:

```
habit.completed
habit.missed
task.completed
system.daily_reset
agent.scribe.reflection_created
```

2. All events are declared & typed in `EventType.ts`

3. All signals are stored in `signals` table for history & future AI analysis.

4. All events are logged in `event_logs` table for full traceability.

5. Listeners are small, isolated & safe:

- Always try/catch errors.
- Never chain complex async logic inside listeners.
- Emit new events for new state changes.

6. Notifications are one possible output of an event — not mandatory.

---

## Folder Structure Example

```
/signals → raw incoming life data /events /habit → habit event handlers /task → task event handlers /system → system event handlers /agent → agent output handlers /lib/notifications.ts → notification utils /eventBus.ts → core EventBus logic /eventTypes.ts → enum of all event names /logs → future frontend event log page
```

---

## Example Listener Template

```typescript
eventBus.on(EventType.HABIT_COMPLETED, async (payload) => {
  try {
    await updateHabitStats(payload);
    await notifyUser(payload.userId, {
      type: "info",
      agent: "Scribe",
      message: `Habit completed: ${payload.habitName}`,
      action: "/habits",
    });
  } catch (error) {
    await logListenerFailure("HABIT_COMPLETED", error);
  }
});
```

# Final Thought

Event-Driven Architecture is how The Grid stays alive, reactive, and scalable.
Signals tell the story of your life. Events move the system. Logs tell the truth.

This is how HQ operates.
Clean. Resilient. Modular. Future-proof.
