import { icone } from "@/lib/icone";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
	return icone(size.width);
}
