/**
 * Every piece of personal content lives here.
 *
 * This is the only file you need to touch to update the site's copy, links, or
 * projects. Nothing else hardcodes personal data.
 *
 * TODO(eesha): the values marked PLACEHOLDER below are the only things
 * standing between this and being publishable.
 */

export const profile = {
  name: "Eesha",
  // Shown directly under the hero statement — one plain sentence, no gimmick.
  tagline: "Options data by day, guitar and tabla most nights, Giants on Sundays.",

  links: {
    instagram: "https://instagram.com/eeshan.agarwal",
    github: "https://github.com/eesh4n",
    linkedin: "https://www.linkedin.com/in/eeshan-agarwal-7b7b85376/",
    // Split so naive scrapers don't lift it straight out of the HTML.
    emailUser: "eeshan2agarwal",
    emailDomain: "gmail.com",
  },
} as const;

export function emailAddress(): string {
  return `${profile.links.emailUser}@${profile.links.emailDomain}`;
}

/**
 * A pre-filled mailto — direct inspiration from bryantcodes.art's own
 * pre-filled contact link, adapted into Eesha's actual voice rather than
 * copied wording. Small, low-risk, and it's the kind of detail that makes a
 * page feel authored instead of templated.
 */
export function mailtoHref(): string {
  const subject = "hey";
  const body =
    "you made it to the bottom of the page, which already puts you ahead of most recruiters. what's up?";
  return `mailto:${emailAddress()}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * The hero's "what I'm doing / what I've done" timeline — plain statements,
 * not a clock-driven mechanic. Each line is either an ongoing thing or a
 * completed one; `kind` controls which of the two groups it renders under.
 *
 * TODO(eesha): "starting Western Engineering / Ivy in September" moves from
 * `doing` to `done` once that's actually true.
 */
export type TimelineEntry = {
  kind: "doing" | "done";
  text: string;
  href?: string;
};

export const timeline: TimelineEntry[] = [
  { kind: "doing", text: "collecting same-day QQQ options data, every trading day" },
  { kind: "doing", text: "running Sentiment Desk's Reddit thesis pipeline" },
  { kind: "doing", text: "starting Western Engineering / Ivy in September 2026" },
  { kind: "doing", text: "guitar and tabla practice, most nights — different traditions, same discipline" },
  { kind: "done", text: "built RivalRuns, a two-player game where neither player touches a keyboard", href: "#projects" },
  { kind: "done", text: "shipped Sentiment Desk's extraction pipeline", href: "https://github.com/eesh4n/reddit-thesis-dashboard" },
  { kind: "done", text: "ten trading days of clean options data captured, backtesting next" },
];

/**
 * Personal facts, structured for the interactive interests explorer
 * (InterestsExplorer.tsx) instead of a flat bullet list — each one is a
 * clickable hand-drawn icon that reveals its blurb, not a paragraph dumped
 * on the page. AI/robotics isn't in this set on purpose: it's the site's
 * running theme (the circuit board, the tech framing throughout), not one
 * more line in a list — repeating it here would undercut that.
 */
export type Interest = {
  id: "football" | "gym" | "faith";
  label: string;
  blurb: string;
};

export const interests: Interest[] = [
  {
    id: "football",
    label: "Giants football",
    blurb: "Every Sunday, no exceptions. Been a long few years to be a fan.",
  },
  {
    id: "gym",
    label: "the gym",
    blurb: "Trying to get a little better at it each week. Slow, unglamorous, same category as the data collector.",
  },
  {
    id: "faith",
    label: "faith",
    blurb: "Still figuring most of it out. Not something I have a clean answer for, and that's fine.",
  },
];

export type Project = {
  id: string;
  name: string;
  /** One line. Shows on the card face. */
  blurb: string;
  /** Two or three sentences. Shows on hover/expand. */
  detail: string;
  /** Honest current state — rendered as a small chip, never as a claim of success. */
  status: string;
  stack: string[];
  href?: string;
};

export const projects: Project[] = [
  {
    id: "zero-dte",
    name: "0DTE options data pipeline",
    blurb: "A same-day QQQ options chain, captured end to end, every trading day.",
    detail:
      "A collector streaming the full same-day QQQ chain off the IBKR Client Portal gateway — roughly 180k rows a day, ~99.8% mark/IV/Greek completeness, self-recovering across gateway drops. Ten trading days captured so far. Backtesting is Ankit's half of this — a real two-person split, not a hired hand — and hasn't started. No live capital, no results, no edge claimed: this is the unglamorous data-plumbing phase, which is most of the work that actually matters.",
    status: "Collecting — backtesting not started",
    stack: ["Python", "IBKR API", "WebSockets"],
    // Deliberately no `href` — this repo is shared with a partner and isn't
    // solely Eesha's call to publish.
  },
  {
    id: "sentiment-desk",
    name: "Sentiment Desk",
    blurb: "LLM-extracted investment theses from Reddit, priced at the moment they were posted.",
    detail:
      "Pulls stock discussion from Reddit, runs it through an LLM extraction pipeline to pull out structured theses — ticker, reasoning, confidence — and stamps each one with the price at the moment it was posted, specifically so the theses can be backtested later: did the reasoning hold up? The ticker on this page is its (delayed, cached) output.",
    status: "Live — extraction pipeline running",
    stack: ["Next.js", "Prisma", "Supabase", "Gemini"],
    href: "https://github.com/eesh4n/reddit-thesis-dashboard",
  },
  {
    id: "rivalruns",
    name: "RivalRuns",
    blurb: "A two-player endless runner where neither player touches a keyboard.",
    detail:
      "Built at a hackathon. One player dodges an obstacle course with their whole body — lean, jump, duck, block — tracked live off their webcam. The second player, on their own laptop and webcam, actively places those obstacles in real time by grabbing and dropping them into lane zones. Adversarial, not co-op. Rendered as a real 3D scene with a chase cam, a coin economy, and a shield mechanic — not a flat sprite game.",
    status: "Shipped at hackathon",
    stack: ["Python", "Ursina/Panda3D", "MediaPipe", "WebSockets"],
    // TODO(eesha): a short screen capture would sell this far better than a
    // static screenshot — it's a live-camera game, stills don't convey it.
  },
];
