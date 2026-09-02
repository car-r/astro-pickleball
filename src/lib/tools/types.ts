export type Level = "new" | "rec" | "league" | "tournament";
export type Style = "soft" | "allcourt" | "power" | "unsure";
export type Weakness = "mishits" | "no_pop" | "slow_hands" | "no_spin" | "unsure";
export type Shape = "wide" | "hybrid" | "elongated";
export type Priority = "forgiveness" | "control" | "power" | "spin";

export type Paddle = {
  id: string;
  name: string;
  brand: string;
  url: string;
  buyUrl: string;
  price: number;
  legal: boolean;
  coreMm: number;
  coreType: "polymer" | "foam";
  shape: Shape;
  handleIn: number;
  weightOz: number;
  swingWeight: number;
  power: number;
  control: number;
  spin: number;
  forgiveness: number;
  handSpeed: number;
  armFriendly: boolean;
  levelMin: Level;
  levelMax: Level;
  tags: string[];
};

export type FinderAnswers = {
  level: Level;
  style: Style;
  weakness: Weakness;
  handedness: "two_hand" | "one_hand" | "either";
  shapePref: Shape | "no_pref";
  budget: "100" | "150" | "200" | "250plus";
  legal: "yes" | "rec_only" | "unsure";
  arm: "yes" | "no";
  priority: Priority;
};

export type FinderProfile = {
  level: Level;
  style: "soft" | "allcourt" | "power";
  weakness: Weakness;
  twoHand: boolean;
  shape: Shape | null;
  budgetMax: number;
  needLegal: boolean;
  armCare: boolean;
  priority: Priority;
};
