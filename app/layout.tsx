import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "./globals.css";
import { MadeWithLove } from "@/components/made-with-love";

// Le build échoue si un composant dynamique se glisse dans une page
export const ensureStatic = "navigation";

const title = "Finances Publiques Françaises 2026";
const description =
	"Comprendre les finances de l'État, de la Sécurité Sociale et des collectivités locales en France";

export const metadata: Metadata = {
	metadataBase: new URL("https://state.alexandremace.fr"),
	title,
	description,
	openGraph: {
		title,
		description,
		url: "/",
		siteName: title,
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
