import type { LeadTapeCompleteDetail, LeadTapeInput } from './leadTape';

function $(root: HTMLElement, sel: string) {
	return root.querySelector(sel);
}

function isWeightScreen(screen: HTMLElement): boolean {
	return screen.dataset.questionKind === 'weight';
}

function selectedValue(screen: HTMLElement): string | number | null {
	if (isWeightScreen(screen)) {
		const input = screen.querySelector<HTMLInputElement>('input[type="range"]');
		if (!input) return null;
		const n = Number(input.value);
		return Number.isFinite(n) ? n : null;
	}
	const input = screen.querySelector<HTMLInputElement>('input[type="radio"]:checked');
	return input ? input.value : null;
}

function formatOz(n: number): string {
	return `${n.toFixed(1)} oz`;
}

/**
 * Lead-tape quiz: same progress / one-question / Back-Next chrome as QuizFlow,
 * but mixed types (weight slider + string radios). Do not reuse bindQuiz.
 */
export function bindLeadTapeQuiz(root: HTMLElement) {
	const screens = Array.from(root.querySelectorAll<HTMLElement>('[data-quiz-question]'));
	const fill = $(root, '[data-quiz-progress-fill]') as HTMLElement | null;
	const label = $(root, '[data-quiz-progress-label]') as HTMLElement | null;
	const pctLabel = $(root, '[data-quiz-progress-pct]') as HTMLElement | null;
	const bar = $(root, '[data-quiz-progressbar]') as HTMLElement | null;
	const backBtn = $(root, '[data-quiz-back]') as HTMLButtonElement | null;
	const nextBtn = $(root, '[data-quiz-next]') as HTMLButtonElement | null;
	const errorEl = $(root, '[data-quiz-error]') as HTMLElement | null;
	const slider = $(root, '[data-weight-slider]') as HTMLInputElement | null;
	const readout = $(root, '[data-weight-readout]') as HTMLElement | null;
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

	function syncWeightReadout() {
		if (!slider) return;
		const n = Number(slider.value);
		if (!Number.isFinite(n)) return;
		if (readout) readout.textContent = formatOz(n);
		slider.setAttribute('aria-valuenow', n.toFixed(1));
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
		if (nextBtn) nextBtn.textContent = i === total - 1 ? 'See recipe' : 'Next';
		setError(null);
		if (ready) {
			const legend = screens[i]?.querySelector<HTMLElement>('legend');
			legend?.focus();
		}
	}

	function collect(): LeadTapeInput | null {
		const answers: Partial<LeadTapeInput> = {};
		for (const screen of screens) {
			const id = screen.dataset.questionId;
			const value = selectedValue(screen);
			if (!id || value === null) return null;
			if (id === 'weightOz') {
				answers.weightOz = Number(value);
			} else {
				(answers as Record<string, string | number>)[id] = value;
			}
		}
		if (
			answers.weightOz === undefined ||
			!answers.coreMm ||
			!answers.edge ||
			!answers.goal ||
			!answers.style ||
			!answers.arm ||
			!answers.sessions
		) {
			return null;
		}
		return answers as LeadTapeInput;
	}

	function goNext() {
		const current = screens[index];
		if (!current) return;
		if (!isWeightScreen(current) && selectedValue(current) === null) {
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
				new CustomEvent<LeadTapeCompleteDetail>('quizcomplete', {
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
		if (slider) {
			slider.value = '8.0';
			syncWeightReadout();
		}
		show(0);
	}

	backBtn?.addEventListener('click', goBack);
	nextBtn?.addEventListener('click', goNext);
	root.addEventListener('change', (event) => {
		if (event.target instanceof HTMLInputElement && event.target.type === 'radio') {
			setError(null);
		}
	});
	slider?.addEventListener('input', syncWeightReadout);
	root.addEventListener('quizreset', reset);

	syncWeightReadout();
	show(0);
	ready = true;
	return { reset, show };
}
