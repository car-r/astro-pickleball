export type QuizOption = {
	value: number;
	label: string;
};

export type QuizQuestion = {
	id: string;
	prompt: string;
	options: QuizOption[];
};

export type QuizCompleteDetail = {
	answers: Record<string, number>;
};

function $(root: HTMLElement, sel: string) {
	return root.querySelector(sel);
}

/**
 * Shared one-question-per-screen quiz: progress, radios, Back, Next.
 * Future tools (lead-tape, paddle-finder) can reuse QuizFlow + bindQuiz.
 */
export function bindQuiz(root: HTMLElement) {
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

	function selectedValue(screen: HTMLElement): number | null {
		const input = screen.querySelector<HTMLInputElement>('input[type="radio"]:checked');
		if (!input) return null;
		const n = Number(input.value);
		return Number.isFinite(n) ? n : null;
	}

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
		if (nextBtn) nextBtn.textContent = i === total - 1 ? 'See estimate' : 'Next';
		setError(null);
		if (ready) {
			const legend = screens[i]?.querySelector<HTMLElement>('legend');
			legend?.focus();
		}
	}

	function collect(): Record<string, number> | null {
		const answers: Record<string, number> = {};
		for (const screen of screens) {
			const id = screen.dataset.questionId;
			const value = selectedValue(screen);
			if (!id || value === null) return null;
			answers[id] = value;
		}
		return answers;
	}

	function goNext() {
		if (selectedValue(screens[index]) === null) {
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
				new CustomEvent<QuizCompleteDetail>('quizcomplete', {
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
