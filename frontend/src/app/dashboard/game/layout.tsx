import { ViewProvider } from "@/context/GameView";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<ViewProvider>{children}</ViewProvider>
	);
}