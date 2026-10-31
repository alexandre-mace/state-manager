"use client";

import { ArrowUpRight } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

const ESPACEMENTS = {
	sm: "p-4",
	md: "p-4 sm:p-6",
} as const;

/**
 * Carte cliquable : la surface et l'affordance, pas le contenu.
 *
 * Volontairement agnostique de ce qu'elle contient (projet, outil, source…) :
 * les trois usages de l'écosystème n'ont en commun que le fond, la bordure qui
 * vire au primary au survol et la flèche qui se décale. Une carte « à données »
 * générique serait une mauvaise abstraction.
 */
function LinkCard({
	href,
	external = false,
	arrow = true,
	padding = "md",
	className,
	children,
	...props
}: {
	href: string;
	/** Ouvre dans un nouvel onglet. */
	external?: boolean;
	/** Flèche en haut à droite, qui se décale au survol. */
	arrow?: boolean;
	padding?: keyof typeof ESPACEMENTS;
	className?: string;
	children?: React.ReactNode;
} & Omit<React.ComponentProps<"a">, "className" | "children">) {
	return (
		<a
			href={href}
			{...(external
				? { target: "_blank", rel: "noopener noreferrer" }
				: undefined)}
			className={cn(
				"group relative flex flex-col rounded-lg border border-border bg-card transition-colors outline-none hover:border-primary/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
				ESPACEMENTS[padding],
				className,
			)}
			{...props}
		>
			{arrow && (
				<ArrowUpRight
					aria-hidden
					className="absolute top-4 right-4 size-4 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
				/>
			)}
			{children}
		</a>
	);
}

export { LinkCard };
