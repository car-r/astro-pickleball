import type { FinderAnswers } from './types';
import type { FinderCompleteDetail } from './paddleFinder';

function $(root: HTMLElement, sel: string) {
	return root.querySelector(sel);
}

function selectedValue(screen: HTMLElement): string | null {
	const input = screen.querySelector<HTMLInputElement>('input[type="radio"]:checked');
	return input ? input.value : null;
}

const REQUIRED_IDS: (keyof FinderAnswers)[] = [
	'level',
	'style',
	'weakness',
	'handedness',
	'shapePref',
	'budget',
	'legal',
	'arm',
	'priority',
];

/**
 * Paddle-finder quiz: same progress / one-question / Back-Next chrome as QuizFlow,
 * but string radios. Do not reuse bindQuiz (number-only).
 */
export function bindFinderQuiz(root: HTMLElement) {
	const screens = Array.from(root.querySelectorAll<HTMLElement>('[data-quiz-question]'));
	const fill = $(root, '[data-quiz-progress-fill]') as HTMLElement | null;
	const label = $(root, '[data-quiz-progress-label]') as HTMLElement | null;
	const pctLabel = $(root, '[data-quiz-progress-pct]') as HTMLElement | null;
	const bar = $(root, '[data-quiz-progressbar]') as HTMLElement | null;
	const backBtn = $(root, '[data-quiz-back]') as HTMLButtonElement | null;
	const nextBtn = $(root, '[data-quiz-next]') as HTMLButtonElement | null;
	const errorEl = $(root, '[data-quiz-error]') as HTMLElement | null;
	const total = screens.length;
	let index = 0;
	let ready = false;

	function setError(msg: string | null) {
		if (!errorEl) return;
		if (!msg) {
			errorEl.classList.add('hidden');
			errorEl.textContent = '';
			return;
		}
		errorEl.textContent = msg;
		errorEl.classList.remove('hidden');
	}

	function show(i: number) {
		index = i;
		screens.forEach((screen, s) => {
			screen.classList.toggle('hidden', s !== i);
		});
		const current = i + 1;
		const pct = Math.round((current / total) * 100);
		if (fill) fill.style.width = `${pct}%`;
		if (label) label.textContent = `Question ${current} of ${total}`;
		if (pctLabel) pctLabel.textContent = `${pct}%`;
		if (bar) {
			bar.setAttribute('aria-valuenow', String(current));
			bar.setAttribute('aria-valuemax', String(total));
		}
		if (backBtn) backBtn.disabled = i === 0;
		if (nextBtn) nextBtn.textContent = i === total - 1 ? 'See matches' : 'Next';
		setError(null);
		if (ready) {
			const legend = screens[i]?.querySelector<HTMLElement>('legend');
			legend?.focus();
		}
	}

	function collect(): FinderAnswers | null {
		const answers: Partial<FinderAnswers> = {};
		for (const screen of screens) {
			const id = screen.dataset.questionId as keyof FinderAnswers | undefined;
			const value = selectedValue(screen);
			if (!id || value === null) return null;
			(answers as Record<string, string>)[id] = value;
		}
		if (REQUIRED_IDS.some((id) => !answers[id])) return null;
		return answers as FinderAnswers;
	}

	function goNext() {
		const current = screens[index];
		if (!current) return;
		if (selectedValue(current) === null) {
			setError('Pick one to continue.');
			return;
		}
		if (index >= total - 1) {
			const answers = collect();
			if (!answers) {
				setError('Pick one to continue.');
				return;
			}
			root.dispatchEvent(
				new CustomEvent<FinderCompleteDetail>('quizcomplete', {
					detail: { answers },
					bubbles: true,
				}),
			);
			return;
		}
		show(index + 1);
	}

	function goBack() {
		if (index === 0) return;
		show(index - 1);
	}

	function reset() {
		root.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach((input) => {
			input.checked = false;
		});
		show(0);
	}

	backBtn?.addEventListener('click', goBack);
	nextBtn?.addEventListener('click', goNext);
	root.addEventListener('change', (event) => {
		if (event.target instanceof HTMLInputElement && event.target.type === 'radio') {
			setError(null);
		}
	});
	root.addEventListener('quizreset', reset);

	show(0);
	ready = true;
	return { reset, show };
}
