export type BlogPost = {
	url?: string;
	frontmatter: {
		title: string;
		description: string;
		pubDate: string;
		updatedDate?: string;
		heroImage?: string;
		tags?: string[];
		featured?: boolean;
		trending?: boolean;
		readTime?: string;
		tag?: string;
	};
};

export function getBlogPosts(): BlogPost[] {
	return Object.values(
		import.meta.glob<BlogPost>('../pages/blog/*.{md,mdx}', { eager: true })
	).sort(
		(a, b) =>
			new Date(b.frontmatter.pubDate).valueOf() -
			new Date(a.frontmatter.pubDate).valueOf()
	);
}
