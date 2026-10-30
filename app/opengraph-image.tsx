import { ImageResponse } from "next/og";
import { siteTagline, siteTitle } from "@/lib/site";

export const alt = siteTitle;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Aperçu de partage. Couleurs reprises de --background, --foreground et
// --muted-foreground (globals.css), converties en hexadécimal
export default function OpenGraphImage() {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				gap: 32,
				background: "#faf8f0",
				color: "#0a0a0a",
			}}
		>
			<div style={{ fontSize: 160 }}>🏛️</div>
			<div style={{ fontSize: 64, fontWeight: 700 }}>{alt}</div>
			<div style={{ fontSize: 32, color: "#4c473f" }}>{siteTagline}</div>
		</div>,
		size,
	);
}
