import { ImageResponse } from "next/og";

// L'emoji du site, rendu en PNG au build pour l'onglet et l'écran d'accueil iOS
export function renderIcon(size: number) {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				fontSize: size * 0.85,
			}}
		>
			🏛️
		</div>,
		{ width: size, height: size },
	);
}
