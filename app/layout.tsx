import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "./globals.css";
import { MadeWithLove } from "@/components/made-with-love";
import { siteDescription, siteTitle } from "@/lib/site";

// Le build échoue si un composant dynamique se glisse dans une page
export const ensureStatic = "navigation";

export const metadata: Metadata = {
	metadataBase: new URL("https://state.alexandremace.fr"),
	title: siteTitle,
	description: siteDescription,
	openGraph: {
		title: siteTitle,
		description: siteDescription,
		url: "/",
		siteName: siteTitle,
		locale: "fr_FR",
		type: "website",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="fr" className={`${GeistSans.variable} ${GeistMono.variable}`}>
			<body className="font-sans antialiased">
				{children}
				<MadeWithLove className="pb-8" />
			</body>
		</html>
	);
}
