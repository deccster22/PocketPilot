# PocketPilot Product Compass

- Title: PocketPilot Product Compass
- Version: Not specified in source
- Source file: `docs/source/PocketPilot Product Compass.pdf`
- Last updated: 2026-03-20

**Recommended location:** `/docs/doctrine/product-compass.md`

**Purpose:**  
A decision filter for every new feature, system, or idea.  
If something fails the compass, it should not enter the roadmap.

## The PocketPilot Product Compass

Every proposed feature must answer four questions.

- Clarity
- Alignment
- Calm
- Control

If it fails any one of these, the feature should be reconsidered.

## 1. Clarity

Does this help the user understand the market faster?

PocketPilot's primary job is interpretation.

A feature passes Clarity if it:

- compresses information
- reveals strategy meaning
- improves orientation

A feature fails Clarity if it:

- adds dashboards without interpretation
- introduces indicator clutter
- increases cognitive load

**Example:**

**Good**  
"Since Last Checked summary"

**Bad**  
"Add 12 more indicators to the dashboard"

## 2. Alignment

Does this strengthen the strategy-first philosophy?

PocketPilot revolves around strategy alignment, not signal chasing.

A feature passes Alignment if it:

- relates signals to the user's strategy
- improves discipline
- reinforces the chosen framework

A feature fails Alignment if it:

- promotes reactive trading
- prioritises market noise
- bypasses strategy interpretation

**Example:**

**Good**  
"Strategy state transitions"

**Bad**  
"Top movers alert feed"

## 3. Calm

Does this preserve PocketPilot's emotional tone?

Most crypto apps create panic loops.

PocketPilot must remain composed.

A feature passes Calm if it:

- reduces stress
- restores orientation
- avoids urgency language

A feature fails Calm if it:

- creates dopamine loops
- gamifies outcomes
- triggers unnecessary alerts

**Example:**

**Good**  
"30,000 ft market view"

**Bad**  
"Flash alert: BTC breaking out!"

## 4. Control

Does the user remain the pilot?

PocketPilot assists decisions.

It must never replace them.

A feature passes Control if it:

- supports informed decision-making
- keeps execution voluntary
- increases awareness

A feature fails Control if it:

- automates trading decisions
- pressures action
- removes agency

**Example:**

**Good**  
"Strategy alignment notification"

**Bad**  
"Auto-trade when signal triggers"

## The Compass in Practice

Every feature proposal should run through a simple matrix.

| Feature | Clarity | Alignment | Calm | Control | Result |
| --- | --- | --- | --- | --- | --- |
| Since Last Checked | Yes | Yes | Yes | Yes | Build |
| Signal spam alerts | No | No | No | Yes | Reject |
| Auto trading | No | Yes | No | No | Reject |

## The Golden Shortcut

You can actually compress the compass into a single internal question:

Does this help the user trade their strategy instead of their emotions?

If yes, the feature likely belongs.

If no, it probably doesn't.

## The Anti-Compass (Common Traps)

These are feature patterns that almost always fail the compass.

### Indicator Stacking

Adding indicators instead of interpretation.

### Market Noise Feeds

Constant streams of price movement.

### Urgency Mechanics

Flash alerts, countdown timers, panic notifications.

### Signal Authority

Systems claiming high confidence or guaranteed outcomes.

### Hidden Automation

Features that quietly shift control away from the user.

## The Founder Shortcut

When you're exhausted and a feature idea appears at midnight, just ask:

Does this make the user feel smarter, calmer, and more in control?

If the answer is no, the compass just swung south.

## Where the Compass Fits in the Knowledge System

This sits beside the Doctrine as a practical application layer.

```text
Doctrine
v
Product Compass
v
Product Specification
v
Architecture
```

Doctrine explains the philosophy.  
The Compass enforces it during decisions.

## One Quiet Strategic Advantage This Creates

Most crypto products grow like this:

```text
feature
+ feature
+ feature
+ feature
= chaos
```

PocketPilot will grow like this:

```text
doctrine
-> compass
-> coherent features
```

That difference becomes very visible once the product matures.

Users can't always articulate why something feels better designed.

But they feel it immediately.
