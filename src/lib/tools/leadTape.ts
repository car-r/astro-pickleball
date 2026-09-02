/**
 * Pickleballr lead tape calculator.
 * Recipe, not a physics sim. Clock model: 12 / 11+1 / 3+9 / 4+8 / throat.
 * Drop into src/lib/tools/leadTape.ts when shipping /tools/lead-tape.
 */

export type CoreMm = "13_or_less" | "14" | "16_plus" | "unsure";
export type Edge = "edgeguard" | "edgeless" | "unsure";
export type Goal = "power" | "sweetspot" | "hands" | "balanced";
export type Style = "baseline" | "kitchen" | "both";
export type YesNo = "yes" | "no";
export type Sessions = "short" | "long";

export type LeadTapeInput = {
  weightOz: number;
  coreMm: CoreMm;
  edge: Edge;
  goal: Goal;
  style: Style;
  arm: YesNo;
  sessions: Sessions;
};

export type Clock = "12" | "11" | "1" | "3" | "9" | "4" | "8" | "throat";

export type Zone = {
  clock: Clock;
  grams: number;
};

export type LeadTapeRecipe = {
  zones: Zone[];
  totalGrams: number;
  newWeightOz: number;
  tapeWidth: "1/4 inch" | "1/2 inch";
  startRule: string;
  avoid: string;
  why: string;
  effectiveGoal: Goal;
  overrideNote?: string;
  maxTotalG: number;
};

export const GRAMS_PER_OZ = 28.3495;

const DEFAULT_INPUT: LeadTapeInput = {
  weightOz: 8.0,
  coreMm: "unsure",
  edge: "unsure",
  goal: "sweetspot",
  style: "both",
  arm: "no",
  sessions: "short",
};

const PAIRED: [Clock, Clock][] = [
  ["3", "9"],
  ["4", "8"],
  ["11", "1"],
];

const DROP_ORDER: Clock[] = ["12", "11", "1", "throat", "4", "8", "3", "9"];

export function clampWeightOz(n: number): number {
  const stepped = Math.round(n * 10) / 10;
  return Math.min(9.0, Math.max(7.0, stepped));
}

export function maxTotalG(
  input: Pick<LeadTapeInput, "weightOz" | "coreMm" | "goal" | "arm">,
): number {
  let max = 8;
  if (input.arm === "yes") max = Math.min(max, 4);
  if (input.weightOz >= 8.4) max = Math.min(max, 4);
  if (input.weightOz >= 8.7) max = Math.min(max, 2);
  if (input.coreMm === "13_or_less" && input.goal === "power") max = Math.min(max, 4);
  return max;
}

export function tapeWidthFor(
  input: Pick<LeadTapeInput, "edge" | "coreMm">,
): "1/4 inch" | "1/2 inch" {
  if (input.edge === "edgeless" || input.coreMm === "13_or_less") return "1/4 inch";
  return "1/2 inch";
}

function mergeZones(zones: Zone[]): Zone[] {
  const map = new Map<Clock, number>();
  for (const z of zones) {
    if (z.grams <= 0) continue;
    map.set(z.clock, (map.get(z.clock) ?? 0) + z.grams);
  }
  const order: Clock[] = ["12", "11", "1", "3", "9", "4", "8", "throat"];
  return order
    .filter((c) => (map.get(c) ?? 0) > 0)
    .map((c) => ({ clock: c, grams: map.get(c)! }));
}

function totalOf(zones: Zone[]): number {
  return zones.reduce((sum, z) => sum + z.grams, 0);
}

function assertSymmetric(zones: Zone[]): void {
  for (const [a, b] of PAIRED) {
    const ga = zones.find((z) => z.clock === a)?.grams ?? 0;
    const gb = zones.find((z) => z.clock === b)?.grams ?? 0;
    if (ga !== gb) {
      throw new Error(`Asymmetric tape: ${a}=${ga}g vs ${b}=${gb}g`);
    }
  }
}

function gramsAt(zones: Zone[], clock: Clock): number {
  return zones.find((z) => z.clock === clock)?.grams ?? 0;
}

function setGrams(zones: Zone[], clock: Clock, grams: number): Zone[] {
  const rest = zones.filter((z) => z.clock !== clock);
  if (grams <= 0) return mergeZones(rest);
  return mergeZones([...rest, { clock, grams }]);
}

function reduceToMax(zones: Zone[], maxG: number): Zone[] {
  let next = mergeZones(zones);
  let guard = 0;
  while (totalOf(next) > maxG && guard < 40) {
    guard += 1;
    let dropped = false;
    for (const clock of DROP_ORDER) {
      if (totalOf(next) <= maxG) break;
      const g = gramsAt(next, clock);
      if (g <= 0) continue;
      const pair = PAIRED.find((p) => p[0] === clock || p[1] === clock);
      if (pair) {
        const [a, b] = pair;
        next = setGrams(next, a, gramsAt(next, a) - 1);
        next = setGrams(next, b, gramsAt(next, b) - 1);
        dropped = true;
        break;
      }
      next = setGrams(next, clock, g - 1);
      dropped = true;
      break;
    }
    if (!dropped) break;
  }
  return mergeZones(next);
}

type Layout = { base: Zone[]; addOn: Zone[]; why: string; startRule: string };

function layoutFor(goal: Goal, style: Style, arm: YesNo): Layout {
  const startRule = "Add this, play 3 sessions, then add 1g per side max.";

  if (goal === "sweetspot") {
    return {
      base: [
        { clock: "3", grams: 2 },
        { clock: "9", grams: 2 },
      ],
      addOn: [
        { clock: "3", grams: 1 },
        { clock: "9", grams: 1 },
      ],
      why: "3 & 9 raises twist weight (stability on mishits) without making the head feel dead.",
      startRule,
    };
  }

  if (goal === "power" && style === "baseline") {
    return {
      base: [{ clock: "12", grams: 3 }],
      addOn: [
        { clock: "3", grams: 1 },
        { clock: "9", grams: 1 },
      ],
      why: "Tape at 12 o'clock raises swing weight and plow-through. Start tiny; more tip is what makes hands late.",
      startRule,
    };
  }

  if (goal === "power") {
    return {
      base: [
        { clock: "11", grams: 1 },
        { clock: "1", grams: 1 },
        { clock: "3", grams: 1 },
        { clock: "9", grams: 1 },
      ],
      addOn: [
        { clock: "3", grams: 1 },
        { clock: "9", grams: 1 },
      ],
      why: "A little tip plus 3 & 9 adds pop without parking all the mass at 12, so kitchen hands stay quicker.",
      startRule,
    };
  }

  if (goal === "hands" && style === "baseline") {
    return {
      base: [
        { clock: "4", grams: 2 },
        { clock: "8", grams: 2 },
      ],
      addOn: [
        { clock: "3", grams: 1 },
        { clock: "9", grams: 1 },
      ],
      why: "4 & 8 adds mass without slowing hands as much as tip tape. Extra at 3 & 9 only if sessions run long.",
      startRule,
    };
  }

  if (goal === "hands") {
    return {
      base: [
        { clock: "4", grams: 2 },
        { clock: "8", grams: 2 },
      ],
      addOn: [{ clock: "throat", grams: 1 }],
      why: "4 & 8 (or throat) adds mass without slowing hands as much as tip tape.",
      startRule,
    };
  }

  if (arm === "yes") {
    return {
      base: [
        { clock: "3", grams: 2 },
        { clock: "9", grams: 2 },
      ],
      addOn: [],
      why: "Sides only: 3 & 9 for a bigger sweet spot. We skipped the tip because arm issues and 12 o'clock do not mix.",
      startRule,
    };
  }

  return {
    base: [
      { clock: "3", grams: 2 },
      { clock: "9", grams: 2 },
      { clock: "12", grams: 2 },
    ],
    addOn: [],
    why: "Sides plus a little tip: stability and a touch of power, still in the rec 2-8g range.",
    startRule,
  };
}

export function recommendLeadTape(raw: Partial<LeadTapeInput> = {}): LeadTapeRecipe {
  const input: LeadTapeInput = {
    ...DEFAULT_INPUT,
    ...raw,
    weightOz: clampWeightOz(raw.weightOz ?? DEFAULT_INPUT.weightOz),
  };

  const cap = maxTotalG(input);
  let effectiveGoal: Goal = input.goal;
  let overrideNote: string | undefined;
  if (input.arm === "yes" && input.goal === "power") {
    effectiveGoal = "sweetspot";
    overrideNote =
      "Power tape at the tip is the first thing that aggravates an elbow. We routed you to 3 & 9.";
  }

  const layout = layoutFor(effectiveGoal, input.style, input.arm);
  let zones = mergeZones(layout.base);
  if (input.sessions === "long" && layout.addOn.length) {
    const withAdd = mergeZones([...zones, ...layout.addOn]);
    if (totalOf(withAdd) <= cap) {
      zones = withAdd;
    }
  }
  if (effectiveGoal === "sweetspot") {
    zones = reduceToMax(zones, Math.min(cap, 6));
  }
  if (effectiveGoal === "power" && input.style !== "baseline") {
    zones = reduceToMax(zones, Math.min(cap, 6));
  }
  zones = reduceToMax(zones, cap);
  assertSymmetric(zones);

  const totalGrams = totalOf(zones);
  const newWeightOz =
    Math.round((input.weightOz + totalGrams / GRAMS_PER_OZ) * 100) / 100;

  let startRule = layout.startRule;
  if (totalGrams >= cap) {
    startRule = `This is the cap for your paddle (${cap}g). Add this, play 3 sessions, then stop unless it still feels light.`;
  }

  return {
    zones,
    totalGrams,
    newWeightOz,
    tapeWidth: tapeWidthFor(input),
    startRule,
    avoid: "Do not stack 8g at 12 o'clock on a first try.",
    why: layout.why,
    effectiveGoal,
    overrideNote,
    maxTotalG: cap,
  };
}

export const CLOCK_LABELS: Record<Clock, string> = {
  "12": "12 o'clock (tip)",
  "11": "11 o'clock",
  "1": "1 o'clock",
  "3": "3 o'clock",
  "9": "9 o'clock",
  "4": "4 o'clock",
  "8": "8 o'clock",
  throat: "Throat",
};

export type LeadTapeChoiceOption = {
  value: string;
  label: string;
};

export type LeadTapeWeightQuestion = {
  id: "weightOz";
  prompt: string;
  note: string;
  kind: "weight";
  min: number;
  max: number;
  step: number;
  defaultValue: number;
};

export type LeadTapeChoiceQuestion = {
  id: Exclude<keyof LeadTapeInput, "weightOz">;
  prompt: string;
  note?: string;
  kind: "choice";
  options: LeadTapeChoiceOption[];
};

export type LeadTapeQuestion = LeadTapeWeightQuestion | LeadTapeChoiceQuestion;

export type LeadTapeCompleteDetail = {
  answers: LeadTapeInput;
};

export const questions: LeadTapeQuestion[] = [
  {
    id: "weightOz",
    kind: "weight",
    prompt: "What does your paddle weigh right now?",
    note: "If you already have tape on it, weigh the paddle and use that number.",
    min: 7.0,
    max: 9.0,
    step: 0.1,
    defaultValue: 8.0,
  },
  {
    id: "coreMm",
    kind: "choice",
    prompt: "How thick is the core?",
    options: [
      { value: "13_or_less", label: "13mm or less" },
      { value: "14", label: "14mm" },
      { value: "16_plus", label: "16mm+" },
      { value: "unsure", label: "Not sure" },
    ],
  },
  {
    id: "edge",
    kind: "choice",
    prompt: "Edge guard?",
    options: [
      { value: "edgeguard", label: "Edgeguard" },
      { value: "edgeless", label: "Edgeless" },
      { value: "unsure", label: "Not sure" },
    ],
  },
  {
    id: "goal",
    kind: "choice",
    prompt: "What do you want?",
    options: [
      { value: "power", label: "More power" },
      { value: "sweetspot", label: "Bigger sweet spot" },
      { value: "hands", label: "Quicker hands" },
      { value: "balanced", label: "Balanced" },
    ],
  },
  {
    id: "style",
    kind: "choice",
    prompt: "Where do you live on the court?",
    options: [
      { value: "baseline", label: "Baseline" },
      { value: "kitchen", label: "Kitchen" },
      { value: "both", label: "Both" },
    ],
  },
  {
    id: "arm",
    kind: "choice",
    prompt: "Elbow or wrist issues?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: "sessions",
    kind: "choice",
    prompt: "How long do you usually play?",
    options: [
      { value: "short", label: "Short (under 90 min)" },
      { value: "long", label: "Long" },
    ],
  },
];

/** Build-time / manual sanity. Throws if the recipe drifts from the spec. */
export function assertLeadTapeSanity(): void {
  const clocksOf = (r: LeadTapeRecipe) =>
    Object.fromEntries(r.zones.map((z) => [z.clock, z.grams]));

  const def = recommendLeadTape();
  const defClocks = clocksOf(def);
  if (defClocks["3"] !== 2 || defClocks["9"] !== 2 || Object.keys(defClocks).length !== 2) {
    throw new Error(`Default should be 2g at 3 and 9, got ${JSON.stringify(defClocks)}`);
  }
  if (def.totalGrams !== 4) {
    throw new Error(`Default totalGrams should be 4, got ${def.totalGrams}`);
  }
  if (def.tapeWidth !== "1/2 inch") {
    throw new Error(`Default tapeWidth should be 1/2 inch, got ${def.tapeWidth}`);
  }
  const expectedOz = Math.round((8 + 4 / GRAMS_PER_OZ) * 100) / 100;
  if (def.newWeightOz !== expectedOz) {
    throw new Error(`Default newWeightOz should be ${expectedOz}, got ${def.newWeightOz}`);
  }
  if (Math.abs(def.newWeightOz - 8.14) > 0.001) {
    throw new Error(`Default newWeightOz should be ~8.14, got ${def.newWeightOz}`);
  }

  const armPower = recommendLeadTape({ arm: "yes", goal: "power", style: "baseline" });
  if (armPower.effectiveGoal !== "sweetspot") {
    throw new Error(`arm+power should route to sweetspot, got ${armPower.effectiveGoal}`);
  }
  if (!(armPower.overrideNote ?? "").toLowerCase().includes("elbow")) {
    throw new Error("arm+power should mention elbow in overrideNote");
  }
  const apc = clocksOf(armPower);
  if (apc["3"] !== 2 || apc["9"] !== 2 || apc["12"]) {
    throw new Error(`arm+power should be 3&9 not 12, got ${JSON.stringify(apc)}`);
  }

  const heavy = recommendLeadTape({ weightOz: 8.7, goal: "sweetspot" });
  if (heavy.maxTotalG !== 2 || heavy.totalGrams !== 2) {
    throw new Error(`8.7oz should cap at 2g, got max=${heavy.maxTotalG} total=${heavy.totalGrams}`);
  }
  const hc = clocksOf(heavy);
  if (hc["3"] !== hc["9"]) {
    throw new Error(`8.7oz should stay symmetric, got ${JSON.stringify(hc)}`);
  }

  const thin = recommendLeadTape({ coreMm: "13_or_less" });
  if (thin.tapeWidth !== "1/4 inch") {
    throw new Error(`13_or_less should use 1/4 inch tape, got ${thin.tapeWidth}`);
  }

  const goals: Goal[] = ["power", "sweetspot", "hands", "balanced"];
  const styles: Style[] = ["baseline", "kitchen", "both"];
  const arms: YesNo[] = ["yes", "no"];
  const sessionLens: Sessions[] = ["short", "long"];
  const weights = [7.0, 8.0, 8.4, 8.7, 9.0];
  for (const goal of goals) {
    for (const style of styles) {
      for (const arm of arms) {
        for (const sess of sessionLens) {
          for (const weightOz of weights) {
            const combo = { goal, style, arm, sessions: sess, weightOz };
            const r = recommendLeadTape(combo);
            const g3 = r.zones.find((z) => z.clock === "3")?.grams ?? 0;
            const g9 = r.zones.find((z) => z.clock === "9")?.grams ?? 0;
            const g4 = r.zones.find((z) => z.clock === "4")?.grams ?? 0;
            const g8 = r.zones.find((z) => z.clock === "8")?.grams ?? 0;
            const g11 = r.zones.find((z) => z.clock === "11")?.grams ?? 0;
            const g1 = r.zones.find((z) => z.clock === "1")?.grams ?? 0;
            if (g3 !== g9 || g4 !== g8 || g11 !== g1) {
              throw new Error(`Asymmetric recipe for ${JSON.stringify(combo)}`);
            }
            if (r.totalGrams > r.maxTotalG) {
              throw new Error(`Over cap for ${JSON.stringify(combo)}`);
            }
          }
        }
      }
    }
  }
}
