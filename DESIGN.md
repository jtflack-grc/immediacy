---
name: IMMEDIACY visual system
status: active
inherits: IMPACT / INQUISITION three-rail language
font_sans: IBM Plex Sans
font_mono: IBM Plex Mono
background: "#07090b"
surface: "#0d1115"
border: "#20262d"
text: "#f2f5f7"
muted: "#8b949e"
info: "#7ea4bf"
good: "#73a987"
warning: "#c89a55"
risk: "#d96f6f"
---

# Character

IMMEDIACY is the live incident-disclosure war room in the three-rail family. It shares the restrained institutional language established by IMPACT and INQUISITION, but its personality is temporal and operational: incomplete facts, competing clocks, disclosure debt, and the consequences of acting or waiting.

It should feel like a decision room, not a cyber-themed game UI.

# Shared family language

- Near-black charcoal surfaces with subtle rail separation.
- IBM Plex Sans for interface copy.
- IBM Plex Mono for incident time, percentages, identifiers, and quantitative outputs.
- Flat one-pixel dividers; small 4–6px radii.
- Semantic color only when it communicates state.
- Hierarchy comes from typography, spacing, rules, and position before cards or effects.
- No ambient neon, decorative gradients, glass panels, glowing pills, or ornamental animation.

# Three rails

1. **Decision rail**: current facts, choice framing, owner, rationale, assumptions, and action.
2. **War-room rail**: clock, metrics, evidence, disclosure debt, decision log, and dispatch feed.
3. **Live jurisdiction map**: geographic disclosure posture, debt, enforcement pressure, active flows, hubs, and event rings.

All three rails represent the same simulation state. A visual refresh must not change the decision engine, clock, metrics, or state transitions.

# Live map contract

The map is not decoration. Preserve these behaviors:

- Country state for jurisdictions in play.
- Three switchable views: disclosure posture, disclosure debt, and regulatory exposure.
- Hover jurisdiction detail including notification state, clock guidance, confidence, regulatory pressure, context, and sources.
- Click-through jurisdiction trajectory when audit history exists.
- Active flow arcs.
- Active hubs.
- Time-bounded event rings.
- Non-WebGL fallback behavior.

Cesium terrain/imagery is the base geography. Simulation layers remain the authority.

# Map styling

Real terrain carries the geographic realism, but the simulation must visibly react when state changes. Restraint must not erase game feedback.

- Country fills are translucent, continuously graded to the underlying value, and briefly intensify when a decision changes that jurisdiction.
- Good / warning / adverse states use desaturated green, amber, and red.
- Active flow arcs use narrow geodesic lines with type-based semantic color plus a moving flow marker so an activated relationship reads as activity rather than decoration.
- Active hubs use compact steel-blue points and labels with a restrained pulse while the hub is active.
- Event rings propagate from the event location and include a visible center marker. A newly spawned event may briefly pull the camera toward it so consequential activity cannot occur unseen on the far side of the globe.
- Motion is semantic: it is allowed when it communicates an active flow, hub, event, or recent state transition. Do not add ambient motion simply to make the map look alive.
- Avoid decorative starfields, excessive atmospheric glow, pulsing inactive countries, or continuously animated chrome.

# Density

IMMEDIACY is intentionally dense. Density is acceptable when it preserves decision context. The hierarchy should remain obvious:

1. What decision is required now?
2. What time/fact pressure matters?
3. What changed because of prior decisions?
4. What does the map say about jurisdictional exposure?
5. What supporting detail can wait until the reader asks for it?

# Controls

- Ordinary controls are compact rectangles, not pills.
- Map-mode controls should read as a small analytical switch, not a game selector.
- Use explicit labels rather than decorative icons when space permits.
- Menus are flat dark surfaces with one-pixel borders and no glow.

# Avoid

- Giant centered product-logo headers.
- Cyber-blue as a page-wide default accent.
- Card-on-card nesting.
- Glass blur and neon border effects.
- Pulsing status dots that do not communicate actual activity.
- Decorative 3D effects that compete with the map data.
- Removing or visually suppressing flows, hubs, rings, jurisdiction state, or trajectory behavior merely to simplify the interface.
