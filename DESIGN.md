# Eesha — Design System
> Personal site: options data, Sentiment Desk, RivalRuns, guitar/tabla, Giants, gym, AI/robotics, faith.

**Theme:** dark, glassmorphic. **Direction chosen:** glassmorphic / liquid glass, base mood shifts per section (cool/technical for the quant+AI work, warm for the personal/creator side) rather than one fixed tone.

**Primary reference:** [dimension.dev](https://www.dimension.dev) — dusk-lit AI workspace, matte-black canvas, frosted-glass panels, pill controls, weight-500 restraint. Encoded here as tokens, not copied verbatim — accent, gradients, and component set below are Eesha's own, not Dimension's.
**Triangulation references (same family, don't copy directly):** linear.app, vercel.com, raycast.com, arc.net — dark canvas + monochrome discipline + single gradient hero + hairline borders + pill controls is the shared grammar across all four.

This file is the ground truth for any UI work on this project. Read it before touching a component. If a decision isn't covered here, it needs to be added here — don't invent new tokens ad hoc in a component file.

## Why glass, and why here
Frosted glass reads as literal display hardware (screens, panels, a HUD) — apt for someone who spends the day looking at options chains and sentiment dashboards. It's also the one style direction from this whole design process that got picked twice: once generically ("glassmorphic / liquid glass") and once as a concrete reference (dimension.dev, an AI workspace — same domain as the 0DTE/Sentiment Desk work). Everything below exists to keep that reading consistent instead of degrading into decoration.

## Tokens — Color

| Name | Value | CSS var | Role |
|---|---|---|---|
| Void | `#0a0a0c` | `--color-void` | Page background, base plane |
| Graphite | `#16161a` | `--color-graphite` | Elevated flat surface — nav, non-glass panels |
| Glass Fill | `rgba(255,255,255,0.06)` | `--color-glass-fill` | Frosted panel background, always paired with `--blur-panel` |
| Glass Fill (hover) | `rgba(255,255,255,0.10)` | `--color-glass-fill-hover` | Frosted panel on hover/focus only |
| Hairline | `rgba(255,255,255,0.12)` | `--color-hairline` | 1px borders on every glass/dark surface. Never heavier. |
| Bone | `#ededef` | `--color-bone` | Primary text on dark — not pure white, reduces glare |
| Ash | `#a8a8b0` | `--color-ash` | Secondary text, captions, metadata |
| Slate | `#6b6b74` | `--color-slate` | Tertiary/disabled text |
| Cool Accent | `#4dd0e1` (cyan) | `--color-accent-cool` | Quant/AI/tech sections — options data, Sentiment Desk, RivalRuns, robotics |
| Warm Accent | `#ff9d5c` (amber) | `--color-accent-warm` | Personal/creator sections — music, football, gym, faith, content |
| Signal White | `#ffffff` | `--color-signal` | The one filled/inverted surface — primary CTA, active state |

**Section tone rule (the "shifts with content" answer, made concrete):** every section picks exactly ONE of Cool Accent or Warm Accent as its local `--color-accent`, never both, never a third color. Void/Graphite/Glass/Hairline/Bone/Ash/Slate stay identical across every section — only the accent shifts. This is how the page stays visually unified while still marking "which half of Eesha" a section is about.

## Tokens — Typography

Reuses fonts already installed in this project (`next/font/google`), not new imports:
- **Display / headings:** Geist, weight 500 only for anything above 24px. Never 700+ on a headline — restraint is the signature, same rule Dimension enforces.
- **Body / UI:** Geist Sans, weight 400, 15–16px.
- **Data / labels / captions:** Geist Mono — for anything that's actually data (ticker values, timestamps, stack tags), not for decoration.

| Role | Size | Weight | Line height | Letter spacing |
|---|---|---|---|---|
| display | 64–96px (clamp) | 500 | 1.0 | -0.03em |
| heading | 32–40px (clamp) | 500 | 1.1 | -0.01em |
| heading-sm | 22px | 500 | 1.2 | 0 |
| body | 16px | 400 | 1.55 | 0 |
| caption/mono | 13px | 500 | 1.4 | 0.04em |

## Tokens — Spacing & Shape

- **Base unit:** 4px. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- **Page max-width:** 1180px.
- **Section gap:** 80–96px between major sections.
- **Card/panel padding:** 24–28px.
- **Radii:** `--radius-ui: 10px` (inputs, small controls) · `--radius-card: 20px` (glass panels) · `--radius-pill: 9999px` (all buttons/nav/tags — the pill is the one recurring silhouette, same as Dimension).
- **Blur:** `--blur-panel: blur(16px)` on every glass surface. Provide a solid `--color-graphite` fallback for browsers without `backdrop-filter` support (`@supports not (backdrop-filter: blur(1px))`).

## Elevation

No `box-shadow` stacks. Elevation comes from translucency + a 1px hairline border, same discipline as the reference:

```css
--elevation-glass: 0 0 0 1px var(--color-hairline);
```

That's the only shadow token that exists. Do not add a second one.

## Components

- **Glass Panel** — `--color-glass-fill` + `--blur-panel` + 1px `--color-hairline` border + `--radius-card`. The base unit for cards, project tiles, the nav bar. Content sits directly inside, no nested cards.
- **Pill CTA** — filled `--color-signal` (white) bg, `--color-void` text, `--radius-pill`, 10px vertical / 20px horizontal padding. The ONE filled/inverted control in the system — reserve for the single most important action per view (e.g. "say hi").
- **Ghost Pill** — transparent bg, `--color-bone` text at 85% opacity, 1px hairline border, `--radius-pill`. Secondary actions, nav links.
- **Floating Glass Nav** — Glass Panel treatment, `--radius-pill` (not `--radius-card`), sits with 16–24px margin from the viewport edge, never flush.
- **Project Glass Tile** — Glass Panel + local `--color-accent` (cool or warm) used ONLY for a thin top border-accent and the status chip text — never as a fill.
- **Accent Gradient (hero only)** — a single linear gradient from `--color-accent-cool` to `--color-accent-warm`, used exactly once, on the hero background, at low opacity over Void. Never on cards, buttons, or text. This is the one place both accents may appear together — it represents the whole person, not a section.

## Do

- Lock one accent (cool or warm) per section; carry it consistently across every element in that section.
- Use the hairline + translucency elevation model everywhere; no drop shadows.
- Keep headline weight at 500; never go bolder.
- Use the pill radius for every interactive control (buttons, nav, tags).
- Provide a non-blur fallback for `backdrop-filter` (`@supports`).
- Respect `prefers-reduced-motion` on every transition/animation already in the codebase (established pattern — keep it).

## Don't

- Don't mix cool and warm accents inside one section (the hero gradient is the sole exception).
- Don't add a second shadow token or reintroduce glow/drop-shadow effects (the previous "fried" feedback earlier in this project came from exactly that).
- Don't use border-radius outside the three named values (10 / 20 / 9999).
- Don't fall back to the hand-drawn illustrated icon style from the previous design direction — this is a clean pivot, not a layer on top of it. Existing hand-drawn SVG components (StrikeKink, GuitarString, IllustratedScene icons) are superseded and should be replaced, not blended in.
- Don't add more than one hero gradient per page.
- Don't invent a new color outside this palette without adding it here first.

## Reference set (for encoding new components, not copying)
- https://www.dimension.dev — primary
- https://linear.app
- https://vercel.com
- https://raycast.com
- https://arc.net
