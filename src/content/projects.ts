export type ProjectStatus = "live" | "built" | "building" | "archived";

export type Project = {
  title: string;
  status: ProjectStatus;
  tags: string[];
  color: string;
  frame: "browser" | "none";
  demoUrl?: string;
  demoHref?: string;
  description: string;
  problem: string;
  approach: string;
  codeUrl: string;
};

export const PROJECT_DATA: Record<string, Project> = {
  rivalruns: {
    title: "rival-runs",
    status: "built",
    tags: ["Python", "OpenCV", "WebRTC"],
    color: "var(--signal-cyan)",
    frame: "browser",
    demoUrl: "rivalruns.local",
    description:
      "Two-player, controller-free endless runner: Player A dodges obstacles with lean/jump/duck/block, Player B places them in real time via webcam hand-tracking on a second laptop.",
    problem:
      "Local multiplayer games almost always need a controller each. I wanted a physical, controller-free game two people could play with just laptops and webcams — one person’s body is the input, the other’s hands are the level editor.",
    approach:
      "Player A’s webcam feed runs pose estimation to detect lean/jump/duck/block gestures, driving an endless-runner loop. Player B’s webcam runs hand-tracking on a second laptop, streamed over WebRTC, to place obstacles into Player A’s lane in real time.",
    codeUrl: "https://github.com/eesh4n/rivalruns",
  },
  "sentiment-desk": {
    title: "sentiment-desk",
    status: "live",
    tags: ["LLM", "Reddit API", "Sentiment"],
    color: "var(--signal-green)",
    frame: "browser",
    demoUrl: "reddit-thesis-dashboard.vercel.app",
    demoHref: "https://reddit-thesis-dashboard.vercel.app/",
    description:
      "An LLM reads daily posts across 11 finance subreddits and extracts structured investment theses — ticker, reasoning, sentiment, confidence — filtering out trade diaries and noise.",
    problem:
      "Finance subreddits bury real investment theses under trade-diary noise and meme posts. Reading all of it by hand doesn’t scale.",
    approach:
      "A daily job pulls posts across 11 finance subreddits, an LLM extracts structured fields (ticker, reasoning, sentiment, confidence) from anything that reads like a thesis, and a dashboard (Sentiment Desk) surfaces the aggregated signal per ticker.",
    codeUrl: "https://github.com/eesh4n/reddit-thesis-dashboard",
  },
  "cc-optimizer": {
    title: "credit-card-optimizer",
    status: "live",
    tags: ["TypeScript", "Finance"],
    color: "var(--signal-amber)",
    frame: "browser",
    demoUrl: "cardiq.fly.dev",
    demoHref: "https://cardiq.fly.dev/",
    description:
      "Find the best Canadian credit card for your spending profile — personalized monthly savings estimates across cashback, points, perks, and fees.",
    problem:
      "Canadian credit-card comparison sites are mostly affiliate-driven and don’t model your actual spending.",
    approach:
      "You enter your monthly spend by category; the tool models cashback/points value, perks, and annual fees across a card database to estimate real monthly savings per card, ranked for your profile.",
    codeUrl: "https://github.com/eesh4n/cc_optimizer",
  },
  "reaction-game": {
    title: "arduino-reaction-game",
    status: "archived",
    tags: ["Arduino", "C++", "Hardware"],
    color: "var(--signal-magenta)",
    frame: "none",
    description:
      "An Arduino-based reaction timer game using an LED, button, and LCD to measure and display reaction times with penalties for early presses.",
    problem: "Wanted a first hardware project that was tactile and testable in an afternoon.",
    approach:
      "An LED fires at a randomized delay; a button press stops a timer on an LCD readout; pressing before the LED fires adds a penalty. Simple state machine on an Arduino Uno.",
    codeUrl: "https://github.com/eesh4n/arduino-reaction-game",
  },
  "quant-options-pipeline": {
    title: "options-strategy",
    status: "building",
    tags: ["Confidential"],
    color: "var(--signal-magenta)",
    frame: "browser",
    demoUrl: "classified",
    description: "a 0DTE options strategy in active development, collaborating with a $200K AUM fund.",
    problem: "🤫",
    approach: "🤫",
    codeUrl: "https://github.com/eesh4n/options-strategy",
  },
};

export const PROJECT_IDS = Object.keys(PROJECT_DATA);

export const LEGEND = PROJECT_IDS.map((id) => ({
  id,
  color: PROJECT_DATA[id].color,
  label: PROJECT_DATA[id].title,
}));
