import {
	AUTHOR_NAME,
	AUTHOR_TWITTER,
	AUTHOR_URL,
	AUTHOR_WEBSITE,
	SITE_DESCRIPTION,
	SITE_TITLE,
	SITE_URL,
} from '../config';

export type BreadcrumbItem = {
	name: string;
	url: string;
};

export type FaqItem = {
	question: string;
	answer: string;
};

function absoluteUrl(pathOrUrl: string): string {
	if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
		return pathOrUrl;
	}
	return new URL(pathOrUrl, SITE_URL).href;
}

export function breadcrumbListJsonLd(items: BreadcrumbItem[]): Record<string, unknown> {
	return {
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: absoluteUrl(item.url),
		})),
	};
}

export function organizationJsonLd(): Record<string, unknown> {
	return {
		'@type': 'Organization',
		name: SITE_TITLE,
		url: SITE_URL,
		description: SITE_DESCRIPTION,
		sameAs: [AUTHOR_TWITTER],
	};
}

export function websiteJsonLd(): Record<string, unknown> {
	return {
		'@type': 'WebSite',
		name: SITE_TITLE,
		url: SITE_URL,
		description: SITE_DESCRIPTION,
	};
}

export function personJsonLd(): Record<string, unknown> {
	return {
		'@type': 'Person',
		name: AUTHOR_NAME,
		url: AUTHOR_URL,
		jobTitle: 'Pickleball writer',
		description:
			'Rec and tournament pickleball writer based in Scottsdale. Former tennis player covering gear and strategy for 2.5–4.0 rec players.',
		homeLocation: {
			'@type': 'Place',
			name: 'Scottsdale, Arizona',
		},
		sameAs: [AUTHOR_WEBSITE, AUTHOR_TWITTER],
		worksFor: {
			'@type': 'Organization',
			name: SITE_TITLE,
			url: SITE_URL,
		},
	};
}

export function articleJsonLd(opts: {
	title: string;
	description: string;
	image: string;
	canonical: string;
	datePublished?: string;
	dateModified?: string;
}) {
	const data: Record<string, unknown> = {
		'@type': 'Article',
		headline: opts.title,
		description: opts.description,
		image: opts.image,
		author: {
			'@type': 'Person',
			name: AUTHOR_NAME,
			url: AUTHOR_URL,
		},
		publisher: organizationJsonLd(),
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': opts.canonical,
		},
	};
	if (opts.datePublished) data.datePublished = opts.datePublished;
	if (opts.dateModified) data.dateModified = opts.dateModified;
	return data;
}

export function faqPageJsonLd(faqs: FaqItem[]): Record<string, unknown> {
	return {
		'@type': 'FAQPage',
		mainEntity: faqs.map((faq) => ({
			'@type': 'Question',
			name: faq.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: faq.answer,
			},
		})),
	};
}

/**
 * FAQPage JSON-LD only for posts that already have Q-style headings.
 * Answers are the existing article copy — not invented FAQs.
 */
export const ARTICLE_FAQS: Record<string, FaqItem[]> = {
	'what-is-pickleball': [
		{
			question: 'How Big is a Pickleball Court?',
			answer:
				'A pickleball court is 44 feet long and 20 feet wide. It is based on the dimensions of a badminton court since that is what Joel Pritchard had at his home when the game was first invented. The non-volley zone, or kitchen, is 7 feet long and 20 feet wide on each side of the net.',
		},
		{
			question: 'When Was Pickleball Invented?',
			answer:
				"Pickleball was invented by chance in 1965 on Bainbridge Island in Washington State. Congressman Joel Pritchard was with his friend Bill Bell and their families at Pritchard's home trying to find an activity for the entire family.",
		},
		{
			question: 'Where to Play Pickleball?',
			answer:
				'Pickleball is mostly played on public tennis courts that have additional lines and a net specific to pickleball. Indoor courts are also available in some parts of the country, especially where pickleball is very popular.',
		},
	],
	'dupr-rating': [
		{
			question: 'What is a DUPR Rating?',
			answer:
				'A DUPR Rating is an algorithmic rating system for pickleball players. It provides pickleball players with a score between 2.0 and 8.0 to determine their skill level. It is supposed to be more accurate than self-rating and UPTR ratings because it includes more data points to measure from.',
		},
		{
			question: 'How do I get a DUPR Rating?',
			answer:
				'The only way to get a DUPR rating is to play DUPR matches. You can find local players right from within the app. All official tournament matches factor into your score. Recreational DUPR matches can be added right into the mobile app.',
		},
		{
			question: 'How accurate is DUPR?',
			answer:
				'DUPR ratings are very accurate. Pulling in match data from multiple sources, including recreational play and leagues, provides more data to work with. It also increases the size of the player pool to analyze.',
		},
		{
			question: 'How does DUPR work?',
			answer:
				'The DUPR rating system works by applying 3 factors: wins and losses, type of match, and the rating of your opponent. Recreational matches are worth half as much as official tournament matches.',
		},
		{
			question: 'How to use the DUPR rating system?',
			answer:
				'Using DUPR is as easy as downloading the app and entering matches. Download the app, register or claim your profile, find players using DUPR, create a match and upload scores, then wait for opponents to confirm the results.',
		},
	],
	'pickleball-ratings': [
		{
			question: 'What are Pickleball Ratings?',
			answer:
				'Pickleball ratings are a way to measure the skill level of players in pickleball. Ratings typically range from 1.0 (beginner) to 5.0 (professional). Knowing your rating helps you find the right groups to play in.',
		},
		{
			question: 'How to Find My Pickleball Rating?',
			answer:
				'The most common way to figure out your rating is to self-rate. Another way is to participate in a tournament or league that assigns ratings based on performance. Local clubs may also offer assessments, rating clinics, or you can compare your abilities to the USAPA rating descriptions.',
		},
		{
			question: 'Why are Ratings Important?',
			answer:
				'Player ratings are important because they ensure that matches are fair and competitive. When players of similar skill levels compete against each other, the matches are more exciting and challenging. Ratings also help tournament organizers create balanced brackets.',
		},
	],
	'best-pickleball-paddles-2026': [
		{
			question: 'What Is the Best Pickleball Paddle for Beginners?',
			answer:
				'Our pick for 2026 is the 11SIX24 Pegasus Jelly Bean 16mm. The combination of a widebody shape, forgiving sweet spot, 16mm core and unusually long 5.75-inch handle makes it easy to recommend to newer recreational players. At roughly $100, it also leaves you with some money for lessons or court time instead of spending $300 on your first paddle.',
		},
		{
			question: 'What Is the Best Pickleball Paddle for the Money?',
			answer:
				'Around the $100 price point, we like the Vatic Pro V-SOL Pro. It brings modern foam-core construction into a price range that used to be dominated by traditional polymer paddles. The regular direct price is slightly over $100, although discount codes commonly bring it to roughly $100. If you care more about control than foam technology, the Vatic Prism Flash is another paddle we would look at.',
		},
		{
			question: 'What Is the Best Pickleball Paddle for Control?',
			answer:
				'We still like the Selkirk LUXX Control Air for players who specifically prioritize touch, resets and dinks over power. There are newer and cheaper alternatives, but the thick 19mm core gives the LUXX a distinctly control-oriented feel.',
		},
		{
			question: 'What Is the Best Pickleball Paddle for Power?',
			answer:
				'Our current pick is the Holbrook Fuze. The elongated 16mm version combines a full foam core with a swing weight around 117-118 and provides plenty of power on serves and drives. The Selkirk Boomstik remains one of the more powerful premium alternatives if price isn\'t an issue.',
		},
		{
			question: 'What Pickleball Paddle Is Best for a Two-Handed Backhand?',
			answer:
				'Start by looking at handle length. Our favorite is the extended-handle Honolulu J2CR because Honolulu offers it with a full 6-inch grip. The Boomstik at 5.8 inches and Paddletek Honeyfoam TKO-X at 5.75 inches are other options worth considering. For players who regularly hit a two-handed backhand, I generally wouldn\'t want to go much shorter than 5.5 inches.',
		},
		{
			question: 'Is a 14mm or 16mm Pickleball Paddle Better?',
			answer:
				'Neither is automatically better. For most recreational players, I think 16mm is the safer place to start. A 16mm paddle generally offers a little more control and a softer feel, while 14mm paddles tend to feel firmer and provide additional pop. Your playing style matters considerably more than which number is newer or more popular.',
		},
		{
			question: 'Do You Need a Foam Pickleball Paddle in 2026?',
			answer:
				'No. Foam is popular and there are some really good foam paddles available right now. Traditional polymer paddles did not suddenly stop working. If you already like the feel and consistency of a polymer paddle, there is no reason you need to replace it simply because manufacturers have moved on to another technology cycle. If you want more pop, a different feel or simply want to try the newer technology, paddles like the V-SOL make that much more affordable than it was a couple of years ago.',
		},
		{
			question: 'USA Pickleball vs. UPA-A Paddle Approval',
			answer:
				'USA Pickleball and UPA-A maintain separate paddle approval systems. That means you should not automatically assume that a paddle approved by one organization is approved by the other. Different versions of what sounds like the same paddle may also have different approval status. Before buying an expensive paddle for tournament play, search the exact manufacturer, model, thickness and version on the governing body\'s current approved-equipment list. Don\'t rely on an old review, Amazon listing or even this article six months from now. Paddle approval has been changing too quickly.',
		},
	],
};

export function faqsForSlug(slug: string): FaqItem[] | undefined {
	return ARTICLE_FAQS[slug];
}

export function withPageJsonLd(
	jsonLd: Record<string, unknown> | Record<string, unknown>[] | undefined,
	breadcrumbs: BreadcrumbItem[],
) {
	const nodes: Record<string, unknown>[] = [];
	if (Array.isArray(jsonLd)) {
		nodes.push(...jsonLd);
	} else if (jsonLd && Array.isArray(jsonLd['@graph'])) {
		nodes.push(...(jsonLd['@graph'] as Record<string, unknown>[]));
	} else if (jsonLd) {
		nodes.push(jsonLd);
	}

	const withoutContext = nodes.map((node) => {
		const copy = { ...node };
		delete copy['@context'];
		return copy;
	});

	return {
		'@context': 'https://schema.org',
		'@graph': [...withoutContext, breadcrumbListJsonLd(breadcrumbs)],
	};
}
