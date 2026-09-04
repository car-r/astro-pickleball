import catalogJson from "./catalog.json";
import type { FinderAnswers, FinderProfile, Paddle, Shape } from "./types";

type TraitName = "forgiveness" | "control" | "power" | "spin";

const LEVEL_RANK: Record<FinderProfile["level"], number> = {
  new: 0,
  rec: 1,
  league: 2,
  tournament: 3,
};

const BUDGET_MAX: Record<FinderAnswers["budget"], number> = {
  "100": 100,
  "150": 150,
  "200": 200,
  "250plus": 999,
};

export function answersToProfile(a: FinderAnswers): FinderProfile {
  const style = a.style === "unsure" ? "allcourt" : a.style;
  const priority =
    a.level === "new" && a.priority === "power" ? "forgiveness" : a.priority;

  return {
    level: a.level,
    style,
    weakness: a.weakness,
    twoHand: a.handedness === "two_hand",
    shape: a.shapePref === "no_pref" ? null : a.shapePref,
    budgetMax: BUDGET_MAX[a.budget],
    needLegal: a.legal !== "rec_only",
    armCare: a.arm === "yes",
    priority,
  };
}

function shapeClash(wanted: Shape, got: Shape): boolean {
  return (wanted === "wide" && got === "elongated") || (wanted === "elongated" && got === "wide");
}

function passesFilters(p: Paddle, profile: FinderProfile): string | null {
  if (p.price > profile.budgetMax) return "over_budget";
  if (profile.needLegal && !p.legal) return "not_legal";
  if (profile.twoHand && p.handleIn < 5.5) return "handle_short";
  if (profile.armCare && (!p.armFriendly || p.swingWeight >= 120 || p.power >= 9)) {
    return "arm_care";
  }
  if (profile.level === "new" && (p.power >= 8 || p.coreMm <= 13)) return "too_hot_for_beginner";
  return null;
}

function traitScore(p: Paddle, profile: FinderProfile): number {
  const weights: Record<"forgiveness" | "control" | "power" | "spin" | "handSpeed", number> = {
    forgiveness: 1,
    control: 1,
    power: 1,
    spin: 0.8,
    handSpeed: 0.7,
  };

  weights[profile.priority] *= 1.6;

  if (profile.style === "soft") {
    weights.control += 0.4;
    weights.power -= 0.3;
  }
  if (profile.style === "power") {
    weights.power += 0.5;
    weights.control -= 0.2;
  }
  if (profile.weakness === "mishits") weights.forgiveness += 0.5;
  if (profile.weakness === "no_pop") weights.power += 0.5;
  if (profile.weakness === "slow_hands") weights.handSpeed += 0.5;
  if (profile.weakness === "no_spin") weights.spin += 0.5;

  return (
    weights.forgiveness * p.forgiveness +
    weights.control * p.control +
    weights.power * p.power +
    weights.spin * p.spin +
    weights.handSpeed * p.handSpeed
  );
}

function shapeBonus(p: Paddle, profile: FinderProfile): number {
  if (!profile.shape) return 3;
  if (p.shape === profile.shape) return 12;
  if (p.shape === "hybrid" || profile.shape === "hybrid") return 6;
  if (shapeClash(profile.shape, p.shape)) return 0;
  return 3;
}

function levelFit(p: Paddle, profile: FinderProfile): number {
  let n = 0;
  if (profile.level === "new" && p.power > 7) n -= 8;
  if (profile.level === "tournament" && p.price < 80) n -= 6;
  if (LEVEL_RANK[profile.level] < LEVEL_RANK[p.levelMin]) n -= 4;
  if (LEVEL_RANK[profile.level] > LEVEL_RANK[p.levelMax]) n -= 3;
  return n;
}

export type RankedPaddle = {
  paddle: Paddle;
  score: number;
  why: string;
};

function whyLine(p: Paddle, profile: FinderProfile): string {
  const top = (
    [
      ["forgiveness", p.forgiveness],
      ["control", p.control],
      ["power", p.power],
      ["spin", p.spin],
    ] as [TraitName, number][]
  ).sort((a, b) => b[1] - a[1])[0][0];

  const bits = [
    top === "forgiveness" ? "Biggest mishit margin in this set" : null,
    top === "control" ? "Calm face for dinks and resets" : null,
    top === "power" ? "Most plow-through if you drive a lot" : null,
    top === "spin" ? "Grippiest face in this set" : null,
    p.handleIn >= 5.5 && profile.twoHand ? "Handle works for a two-handed backhand" : null,
    p.price <= 120 ? "Stays inside a tight budget" : null,
    p.armFriendly && profile.armCare ? "Lower swing weight, easier on the arm" : null,
  ].filter(Boolean);

  return bits.slice(0, 2).join(". ") + ".";
}

function primaryTrait(p: Paddle): string {
  return (
    [
      ["forgiveness", p.forgiveness],
      ["control", p.control],
      ["power", p.power],
      ["spin", p.spin],
    ] as [TraitName, number][]
  ).sort((a, b) => b[1] - a[1])[0][0];
}

export const FINDER_QUESTIONS: {
  id: keyof FinderAnswers;
  prompt: string;
  options: { label: string; value: FinderAnswers[keyof FinderAnswers] }[];
}[] = [
  {
    id: "level",
    prompt: "Where is your game right now?",
    options: [
      { label: "New — under a year, still learning the kitchen", value: "new" },
      { label: "Rec — regular open play, 3.0–3.5-ish", value: "rec" },
      { label: "League — 3.5–4.0, I keep score", value: "league" },
      { label: "Tournament — 4.0+ or I already have a rating", value: "tournament" },
    ],
  },
  {
    id: "style",
    prompt: "How do you like to play?",
    options: [
      { label: "Soft game — dinks, drops, resets", value: "soft" },
      { label: "All-court — mix of both", value: "allcourt" },
      { label: "Power — drives and put-aways", value: "power" },
      { label: "Not sure yet", value: "unsure" },
    ],
  },
  {
    id: "weakness",
    prompt: "What bothers you most with your current paddle?",
    options: [
      { label: "Mishits / small sweet spot", value: "mishits" },
      { label: "Not enough pop on drives", value: "no_pop" },
      { label: "Slow at the kitchen", value: "slow_hands" },
      { label: "I cannot get the ball to dip", value: "no_spin" },
      { label: "Nothing specific / first paddle", value: "unsure" },
    ],
  },
  {
    id: "handedness",
    prompt: "Two-handed backhand?",
    options: [
      { label: "Yes — I need handle room", value: "two_hand" },
      { label: "One-handed / I slice it", value: "one_hand" },
      { label: "Either is fine", value: "either" },
    ],
  },
  {
    id: "shapePref",
    prompt: "Shape preference?",
    options: [
      { label: "Wide — biggest face, easiest to hit", value: "wide" },
      { label: "Hybrid — middle ground", value: "hybrid" },
      { label: "Elongated — more reach and plow-through", value: "elongated" },
      { label: "No preference", value: "no_pref" },
    ],
  },
  {
    id: "budget",
    prompt: "Budget ceiling?",
    options: [
      { label: "Under $100", value: "100" },
      { label: "Up to $150", value: "150" },
      { label: "Up to $200", value: "200" },
      { label: "$250+ is fine", value: "250plus" },
    ],
  },
  {
    id: "legal",
    prompt: "Do you need a tournament-legal paddle?",
    options: [
      { label: "Yes — USA Pickleball events", value: "yes" },
      { label: "Rec play only", value: "rec_only" },
      { label: "Not sure — default to legal", value: "unsure" },
    ],
  },
  {
    id: "arm",
    prompt: "Elbow or wrist issues?",
    options: [
      { label: "Yes — keep swing weight down", value: "yes" },
      { label: "No", value: "no" },
    ],
  },
  {
    id: "priority",
    prompt: "If you could only pick one trait?",
    options: [
      { label: "Forgiveness — fewer mishits", value: "forgiveness" },
      { label: "Control — drops and dinks", value: "control" },
      { label: "Power — finish points", value: "power" },
      { label: "Spin — dip and kick", value: "spin" },
    ],
  },
];

export function rankPaddles(catalog: Paddle[], answers: FinderAnswers): {
  profile: FinderProfile;
  results: RankedPaddle[];
  dropped: number;
} {
  const profile = answersToProfile(answers);
  const scored = catalog
    .filter((p) => !passesFilters(p, profile))
    .map((p) => {
      const score = traitScore(p, profile) + shapeBonus(p, profile) + levelFit(p, profile);
      return { paddle: p, score, why: whyLine(p, profile) };
    })
    .sort((a, b) => b.score - a.score);

  const picked: RankedPaddle[] = [];
  if (scored[0]) picked.push(scored[0]);

  const alt = scored.slice(1).find((row) => {
    const a = picked[0].paddle;
    const b = row.paddle;
    return b.shape !== a.shape || b.coreType !== a.coreType || primaryTrait(b) !== primaryTrait(a);
  });
  if (alt) picked.push(alt);

  const used = new Set(picked.map((r) => r.paddle.id));
  const cheapest = [...scored]
    .filter((r) => !used.has(r.paddle.id))
    .sort((a, b) => a.paddle.price - b.paddle.price)[0];
  const stepUp = [...scored].filter((r) => !used.has(r.paddle.id)).sort((a, b) => b.paddle.price - a.paddle.price)[0];

  if (picked[0] && picked[0].paddle.price <= 120 && stepUp) picked.push(stepUp);
  else if (cheapest) picked.push(cheapest);

  const unique: RankedPaddle[] = [];
  const seen = new Set<string>();
  for (const row of picked) {
    if (!seen.has(row.paddle.id)) {
      seen.add(row.paddle.id);
      unique.push(row);
    }
  }

  return {
    profile,
    results: unique.slice(0, 3),
    dropped: catalog.length - scored.length,
  };
}


export type FinderCompleteDetail = {
  answers: FinderAnswers;
};

export function assertPaddleFinderSanity(): void {
  const paddles = catalogJson.paddles as Paddle[];
  if (paddles.length !== 13) {
    throw new Error(`catalog.paddles.length should be 13, got ${paddles.length}`);
  }
  const leftover = paddles.filter((p) => /hyperion|halo/i.test(`${p.id} ${p.name} ${p.brand}`));
  if (leftover.length) {
    throw new Error(`2023 leftover names in catalog: ${leftover.map((p) => p.name).join(", ")}`);
  }
  for (const p of paddles) {
    if (p.buyUrl !== "") {
      throw new Error(`${p.id} buyUrl should be empty, got ${JSON.stringify(p.buyUrl)}`);
    }
  }

  const rec: FinderAnswers = {
    level: "rec",
    style: "allcourt",
    weakness: "mishits",
    handedness: "either",
    shapePref: "no_pref",
    budget: "200",
    legal: "unsure",
    arm: "no",
    priority: "forgiveness",
  };
  const recRank = rankPaddles(paddles, rec);
  if (recRank.results.length < 1 || recRank.results.length > 3) {
    throw new Error(`typical rec profile should return 1–3 results, got ${recRank.results.length}`);
  }

  const cheap = rankPaddles(paddles, { ...rec, budget: "100" });
  const over = cheap.results.filter((row) => row.paddle.price > 100);
  if (over.length) {
    throw new Error(`$100 budget returned a $${over[0].paddle.price} paddle (${over[0].paddle.name})`);
  }
}
