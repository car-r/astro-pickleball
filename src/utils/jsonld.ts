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
			question: 'Do I need a foam paddle in 2026?',
			answer:
				'No. Foam is common now, not required. A 16mm polymer widebody (Valkyrie, Pegasus, both JOOLA Pro V models) still plays well at rec. Buy foam if you want that plush pop and have the budget. Buy polymer if you want a known feel for less money, or you want the thicker LUXX control core.',
		},
		{
			question: 'What paddle should I buy as my first upgrade from a kit?',
			answer:
				'SLK Valkyrie Widebody at $80, or the 11SIX24 Pegasus Jelly Bean 16mm at $90. Both are 16mm, wide, USAP, and forgiving. Demo if you can. If you cannot, buy the cheaper one and spend the difference on balls and court time.',
		},
		{
			question: 'Can I use a UPA-A-only paddle at my rec tournament?',
			answer:
				'Usually no, if the event is USAP-sanctioned. Warping Point Neon is the clear example on this list: fine for open play, not fine for most amateur brackets. Check the sanctioning body on the flyer, then check equipment.usapickleball.org.',
		},
		{
			question: 'Is a 14mm foam paddle better than 16mm?',
			answer:
				'It is different. 14mm foam (Black Opal, Barrage) feels denser. 16mm foam gives more cushion on touch shots. Rec default is 16mm. Move to 14mm after you know you leave 16mm drops short, not because a video called 14mm the meta.',
		},
		{
			question: 'Which paddles on this list work for a two-handed backhand?',
			answer:
				'Primary pick: Boomstik Elongated (5.8"). Also workable: J2CR (5.5–6.0"), TKO-X 16mm (5.75"), Barrage longer-handle shapes, Pegasus and Vapor Power 2 (up to 5.75"), Valkyrie and Dauntless (5.6"), Omni (5.6–5.75"). Tight: LUXX, Scorpeus Pro V, Aura Pro, Loco, Prism Flash.',
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
