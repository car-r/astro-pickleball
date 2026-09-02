import type { QuizQuestion } from './quiz';

export const QUESTION_IDS = [
	'experience',
	'rally',
	'serve_return',
	'third',
	'dink',
	'backhand',
	'reset',
	'speedup',
	'position',
	'who_you_beat',
] as const;

export type QuestionId = (typeof QUESTION_IDS)[number];
export type SkillValue = 2.0 | 3.0 | 3.5 | 4.0 | 4.5;
export type RatingAnswers = Record<QuestionId, SkillValue>;

export const WEIGHTS: Record<QuestionId, number> = {
	experience: 0.6,
	rally: 1.2,
	serve_return: 1.0,
	third: 1.4,
	dink: 1.3,
	backhand: 1.1,
	reset: 1.4,
	speedup: 1.0,
	position: 0.8,
	who_you_beat: 1.2,
};

const BOTTLENECK_SKILLS = [
	'third',
	'dink',
	'reset',
	'backhand',
	'who_you_beat',
	'experience',
] as const;

type BottleneckSkill = (typeof BOTTLENECK_SKILLS)[number];

const SKILL_VALUES: SkillValue[] = [2.0, 3.0, 3.5, 4.0, 4.5];

export const questions: QuizQuestion[] = [
	{
		id: 'experience',
		prompt: 'How long have you played?',
		options: [
			{ value: 2.0, label: 'Less than 3 months' },
			{ value: 3.0, label: '3–12 months' },
			{ value: 3.5, label: '1–2 years' },
			{ value: 4.0, label: '2–4 years' },
			{ value: 4.5, label: '4+ years, and I play league or tournaments' },
		],
	},
	{
		id: 'rally',
		prompt: 'How long can you keep a rally going against someone your speed?',
		options: [
			{ value: 2.0, label: '2–4 shots, many in the net' },
			{ value: 3.0, label: '5–8 if they keep it friendly' },
			{ value: 3.5, label: 'I can hold medium pace' },
			{ value: 4.0, label: 'Long rallies, and I can reset' },
			{ value: 4.5, label: 'I choose when the rally ends' },
		],
	},
	{
		id: 'serve_return',
		prompt: 'Serve + return depth',
		options: [
			{ value: 2.0, label: 'Just in' },
			{ value: 3.0, label: 'Usually in, but short often' },
			{ value: 3.5, label: 'Depth most times' },
			{ value: 4.0, label: 'I can move them and vary it' },
			{ value: 4.5, label: 'Weapon serve / return' },
		],
	},
	{
		id: 'third',
		prompt: 'Third shot',
		options: [
			{ value: 2.0, label: 'Drive or pop up' },
			{ value: 3.0, label: "I know the drop, I don't trust it" },
			{ value: 3.5, label: 'Drop or drive, inconsistent' },
			{ value: 4.0, label: 'I choose drop vs drive on purpose' },
			{ value: 4.5, label: 'I disguise both' },
		],
	},
	{
		id: 'dink',
		prompt: 'Kitchen dinks',
		options: [
			{ value: 2.0, label: 'Avoid / panic' },
			{ value: 3.0, label: 'A few in a row' },
			{ value: 3.5, label: 'Patient until someone misses' },
			{ value: 4.0, label: 'I attack the high one' },
			{ value: 4.5, label: 'I create the attackable ball' },
		],
	},
	{
		id: 'backhand',
		prompt: 'Backhand',
		options: [
			{ value: 2.0, label: 'I run around it' },
			{ value: 3.0, label: 'Usable, but weak' },
			{ value: 3.5, label: 'I keep it in play' },
			{ value: 4.0, label: 'I can redirect it' },
			{ value: 4.5, label: 'I hurt people with it' },
		],
	},
	{
		id: 'reset',
		prompt: 'Hard ball at you',
		options: [
			{ value: 2.0, label: 'The block goes up or out' },
			{ value: 3.0, label: 'Sometimes I keep it down' },
			{ value: 3.5, label: 'I usually neutralize' },
			{ value: 4.0, label: 'Reset on demand' },
			{ value: 4.5, label: 'Reset, then counter' },
		],
	},
	{
		id: 'speedup',
		prompt: 'Hands at the kitchen',
		options: [
			{ value: 2.0, label: 'I get smoked' },
			{ value: 3.0, label: 'I survive some' },
			{ value: 3.5, label: 'I hold my own' },
			{ value: 4.0, label: 'I speed up first' },
			{ value: 4.5, label: 'I counter and finish' },
		],
	},
	{
		id: 'position',
		prompt: 'Doubles positioning',
		options: [
			{ value: 2.0, label: 'Lost after the serve' },
			{ value: 3.0, label: 'Get to the kitchen eventually' },
			{ value: 3.5, label: "Stacking? I've heard of it" },
			{ value: 4.0, label: 'I stack / switch on purpose' },
			{ value: 4.5, label: 'I run the pattern' },
		],
	},
	{
		id: 'who_you_beat',
		prompt: 'Who do you beat more often?',
		options: [
			{ value: 2.0, label: 'Other true beginners' },
			{ value: 3.0, label: '3.0 rec players' },
			{ value: 3.5, label: '3.5 rec players' },
			{ value: 4.0, label: '4.0 league players' },
			{ value: 4.5, label: '4.5+ tournament players' },
		],
	},
];

const CAPPING_LINES: Record<BottleneckSkill, Partial<Record<SkillValue, string>>> = {
	third: {
		2.0: 'Third shot is still a drive or pop-up → 3.0 ceiling until the drop is in the bag.',
		3.0: 'Third-shot drop still inconsistent → 3.5 ceiling until this is usual.',
		3.5: 'Third shot is drop or drive, but not yet on purpose → choosing it is the next 4.0 skill.',
		4.0: 'You choose drop vs drive; disguising both is the next gear.',
	},
	dink: {
		2.0: 'Kitchen dinks feel like avoid-or-panic → a few in a row is the 3.0 floor.',
		3.0: 'A few dinks in a row is not enough → 3.5 ceiling until you stay patient.',
		3.5: 'Patient dinks until someone misses → attacking the high one is the next 4.0 skill.',
		4.0: 'You attack the high one; creating that ball is 4.5.',
	},
	reset: {
		2.0: 'Hard balls go up or out → keep the block down before you think 3.5.',
		3.0: 'You sometimes keep it down → 3.6 ceiling until you usually neutralize.',
		3.5: 'Reset is the next 4.0 skill.',
		4.0: 'You reset on demand; reset-then-counter is the next gear.',
	},
	backhand: {
		2.0: 'Running around the backhand caps you → a usable backhand is the 3.0 floor.',
		3.0: 'Backhand is usable but weak → 3.7 ceiling until you keep it in play.',
		3.5: 'Backhand stays in play; redirecting it is the next 4.0 skill.',
		4.0: 'You can redirect the backhand; hurting people with it is 4.5.',
	},
	who_you_beat: {
		2.0: 'You beat other true beginners → that is a 2.0 snapshot, not a 3.5.',
		3.0: 'You beat 3.0 rec more often → 3.5 ceiling until 3.5s start losing.',
		3.5: 'You beat 3.5 rec more often → 4.0 league is the stretch.',
		4.0: 'You beat 4.0 league; 4.5 tournament is the next test.',
	},
	experience: {
		2.0: 'Under 3 months of play → 3.2 ceiling until the game has had time to settle.',
		3.0: '3–12 months in → time on court still limits how high this snapshot can go.',
		3.5: '1–2 years in; league and tournament reps are the next jump.',
		4.0: '2–4 years in; tournament volume is the last experience gap.',
	},
};

const PRACTICE_LINES: Record<QuestionId, string> = {
	dink: 'Kitchen dinks: stay patient until someone misses. Do not panic or avoid the kitchen.',
	third: 'Third-shot decision: know the drop, then choose drop vs drive on purpose until it is usual.',
	reset: 'Resets: keep the hard ball down. Reset is the next 4.0 skill — neutralize before you counter.',
	backhand: 'Backhand: stop running around it. Keep it in play, then learn to redirect.',
	speedup: 'Hands at the kitchen: survive first. Hold your own before you speed up.',
	serve_return: 'Serve and return: aim for depth most times, then vary to move them.',
	rally: 'Keep rallies going against people your speed. Hold medium pace and reset instead of ending the point in 2–4 shots.',
	position: 'Doubles positioning: get to the kitchen as a pair, then stack or switch on purpose.',
	who_you_beat: 'Who you beat: play the level you actually beat more often. Stretch one bracket, do not skip two.',
	experience: 'Time on court: league and tournament reps. A quiz cannot replace match volume.',
};

const PRACTICE_PRIORITY: QuestionId[] = ['dink', 'third', 'reset'];

export type AppliedCap = {
	skill: BottleneckSkill;
	value: SkillValue;
	cap: number;
};

export type RatingEstimate = {
	rawBeforeCaps: number;
	raw: number;
	estimate: number;
	display: number;
	rangeLo: number;
	rangeHi: number;
	maxedQuiz: boolean;
	maxQuizMessage: string | null;
	appliedCaps: AppliedCap[];
	cappingLines: string[];
	why: string[];
	playNext: string;
	practice: string[];
};

function isSkillValue(n: number): n is SkillValue {
	return SKILL_VALUES.some((value) => value === n);
}

function clamp(n: number, min: number, max: number) {
	return Math.min(max, Math.max(min, n));
}

function asSkillValue(n: number): SkillValue {
	if (isSkillValue(n)) return n;
	const nearest = SKILL_VALUES.reduce((best, value) =>
		Math.abs(value - n) < Math.abs(best - n) ? value : best,
	);
	return nearest;
}

function bottleneckLine(skill: BottleneckSkill, value: SkillValue): string {
	return CAPPING_LINES[skill][value] ?? `${skill} is still at ${value.toFixed(1)}.`;
}

function playNextLine(display: number): string {
	if (display <= 2.0) {
		return '2.0–2.5 rec and beginner clinics. Skip tournament self-entry until rallies last.';
	}
	if (display <= 2.5) {
		return '2.5–3.0 open play. 3.0 is a stretch. Stay out of 3.5 brackets.';
	}
	if (display <= 3.0) {
		return '3.0–3.5 open play vs 3.5 stretch. Start at the 3.0 tournament bracket.';
	}
	if (display <= 3.5) {
		return '3.5 rec as home, 4.0 as a stretch. Start at the 3.5 tournament bracket.';
	}
	if (display <= 4.0) {
		return '4.0 league as home, 4.5 as a stretch. Start at the 4.0 tournament bracket.';
	}
	return '4.5 rec and tournament play. Get a real DUPR before you self-enter above 4.5.';
}

function pickCappingSkills(
	answers: RatingAnswers,
	applied: AppliedCap[],
): BottleneckSkill[] {
	const uniqueApplied: BottleneckSkill[] = [];
	for (const cap of applied) {
		if (!uniqueApplied.includes(cap.skill)) uniqueApplied.push(cap.skill);
	}

	const byValue = (a: BottleneckSkill, b: BottleneckSkill) =>
		answers[a] - answers[b];

	let pool: BottleneckSkill[];
	if (uniqueApplied.length >= 2) {
		pool = [...uniqueApplied].sort(byValue);
	} else {
		const lowest = [...BOTTLENECK_SKILLS].sort(byValue);
		pool = [...uniqueApplied];
		for (const skill of lowest) {
			if (!pool.includes(skill)) pool.push(skill);
		}
	}

	return pool.slice(0, 3);
}

function pickPractice(answers: RatingAnswers): string[] {
	const picked: QuestionId[] = [];
	for (const id of PRACTICE_PRIORITY) {
		if (answers[id] <= 3.5) picked.push(id);
	}
	const remaining = [...QUESTION_IDS].sort((a, b) => {
		const diff = answers[a] - answers[b];
		if (diff !== 0) return diff;
		return PRACTICE_PRIORITY.indexOf(a) === -1
			? 1
			: PRACTICE_PRIORITY.indexOf(b) === -1
				? -1
				: PRACTICE_PRIORITY.indexOf(a) - PRACTICE_PRIORITY.indexOf(b);
	});
	for (const id of remaining) {
		if (picked.length >= 3) break;
		if (!picked.includes(id)) picked.push(id);
	}
	return picked.slice(0, 3).map((id) => PRACTICE_LINES[id]);
}

function applyCaps(raw: number, answers: RatingAnswers): { raw: number; applied: AppliedCap[] } {
	const rules: { skill: BottleneckSkill; when: boolean; cap: number }[] = [
		{ skill: 'third', when: answers.third <= 3.0, cap: 3.3 },
		{ skill: 'dink', when: answers.dink <= 3.0, cap: 3.4 },
		{ skill: 'reset', when: answers.reset <= 3.0, cap: 3.6 },
		{ skill: 'backhand', when: answers.backhand <= 3.0, cap: 3.7 },
		{ skill: 'who_you_beat', when: answers.who_you_beat <= 3.0, cap: 3.5 },
		{ skill: 'experience', when: answers.experience <= 2.0, cap: 3.2 },
		{ skill: 'reset', when: answers.speedup >= 4.5 && answers.reset <= 3.5, cap: 3.8 },
	];

	const applied: AppliedCap[] = [];
	let next = raw;
	for (const rule of rules) {
		if (!rule.when) continue;
		if (next > rule.cap) {
			applied.push({
				skill: rule.skill,
				value: answers[rule.skill],
				cap: rule.cap,
			});
		}
		next = Math.min(next, rule.cap);
	}
	return { raw: next, applied };
}

export function formatRating(n: number): string {
	const rounded = Math.round(n * 100) / 100;
	return Number.isInteger(rounded * 2) ? rounded.toFixed(1) : rounded.toFixed(2);
}

/**
 * Pure scoring. The page should only call this with the 10 question ids.
 */
export function estimateRating(answers: Record<string, number>): RatingEstimate {
	for (const id of QUESTION_IDS) {
		if (!isSkillValue(answers[id])) {
			throw new Error(`Missing or invalid answer for ${id}`);
		}
	}
	const typed = answers as RatingAnswers;

	let weightSum = 0;
	let weighted = 0;
	for (const id of QUESTION_IDS) {
		const w = WEIGHTS[id];
		weightSum += w;
		weighted += w * typed[id];
	}
	const rawBeforeCaps = weighted / weightSum;
	const capped = applyCaps(rawBeforeCaps, typed);
	const estimate = clamp(capped.raw - 0.15, 2.0, 4.7);
	let display = Math.round(estimate * 2) / 2;
	if (display >= 5) display = 4.5;
	display = clamp(display, 2.0, 4.5);

	const rangeLo = clamp(display - 0.25, 2.0, 4.7);
	const rangeHi = clamp(display + 0.25, 2.0, 4.7);

	const maxedQuiz = QUESTION_IDS.every((id) => typed[id] >= 4.5);
	const maxQuizMessage = maxedQuiz
		? 'If this is really you, get a DUPR. A quiz cannot rate 5.0+ players.'
		: null;

	const cappingSkills = pickCappingSkills(typed, capped.applied);
	const cappingLines = cappingSkills.map((skill) =>
		bottleneckLine(skill, asSkillValue(typed[skill])),
	);

	return {
		rawBeforeCaps,
		raw: capped.raw,
		estimate,
		display,
		rangeLo,
		rangeHi,
		maxedQuiz,
		maxQuizMessage,
		appliedCaps: capped.applied,
		cappingLines,
		why: cappingLines,
		playNext: playNextLine(display),
		practice: pickPractice(typed),
	};
}

/** Build-time / manual sanity. Throws if scoring drifts from the spec. */
export function assertRatingEstimatorSanity(): void {
	const fill = (v: SkillValue): Record<string, number> =>
		Object.fromEntries(QUESTION_IDS.map((id) => [id, v]));

	const low = estimateRating(fill(2.0));
	if (low.display < 2.0 || low.display > 3.0) {
		throw new Error(`All 2.0 answers should display 2.0–3.0, got ${low.display}`);
	}
	if (low.maxedQuiz) throw new Error('All 2.0 should not be maxed');

	const high = estimateRating(fill(4.5));
	if (high.display !== 4.5) {
		throw new Error(`All 4.5 answers should display 4.5, got ${high.display}`);
	}
	if (high.display >= 5) throw new Error('Must never show 5.0+');
	if (!high.maxedQuiz || !high.maxQuizMessage) {
		throw new Error('All 4.5 should set the max-quiz message');
	}

	const mixed: Record<string, number> = {
		experience: 3.5,
		rally: 3.5,
		serve_return: 3.5,
		third: 3.0,
		dink: 3.0,
		backhand: 3.5,
		reset: 3.0,
		speedup: 3.5,
		position: 3.5,
		who_you_beat: 3.5,
	};
	const rec = estimateRating(mixed);
	if (rec.display < 3.0 || rec.display > 4.0) {
		throw new Error(`Mixed rec should cluster 3.0–4.0, got ${rec.display}`);
	}
	if (rec.why.length < 2) {
		throw new Error('Mixed rec should report capping skills');
	}

	const thirdHole = { ...fill(4.5), third: 2.0 };
	const capped = estimateRating(thirdHole);
	if (capped.display > 3.5) {
		throw new Error(`Third-shot bottleneck should cap a maxed card, got ${capped.display}`);
	}
}
