import { ImageResponse } from "next/og";

// L'emoji du site, rendu en PNG au build pour l'onglet et l'écran d'accueil iOS
export function icone(taille: number) {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				fontSize: taille * 0.85,
			}}
		>
			🏛️
		</div>,
		{ width: taille, height: taille },
	);
}
