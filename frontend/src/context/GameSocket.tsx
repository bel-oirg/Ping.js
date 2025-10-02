"use client";

import { useEffect, useState, createContext, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { TokenManager } from "@/lib/api";

const GameSocketContext = createContext<Socket | null>(null);

function GameSocketProvider({ children }: { children: React.ReactNode }) {
	const socketRef = useRef<Socket | null>(null);
	const [connected, setConnected] = useState(false);

	useEffect(() => {
		const token = TokenManager.getToken();
		if (!token) return;

		socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || "https://blackholejs.art/", {
			path: "/game.socket/",
			transports: ["websocket"],
			auth: { token },
			withCredentials: true,
		});
		socketRef.current.on("connect", () => {
			setConnected(true);
		});

		socketRef.current.on("disconnect", () => {
			setConnected(false);
		});

		// Add unload handler for clean disconnect
		const handleUnload = () => {
			if (socketRef.current && socketRef.current.connected) {
				socketRef.current.disconnect();
			}
		};

		window.addEventListener("beforeunload", handleUnload);
		window.addEventListener("unload", handleUnload);

		return () => {
			socketRef.current?.disconnect();
			socketRef.current = null;
			window.removeEventListener("beforeunload", handleUnload);
			window.removeEventListener("unload", handleUnload);
		};
	}, []);

	return (
		<GameSocketContext.Provider value={connected ? socketRef.current : null}>
			{children}
		</GameSocketContext.Provider>
	);
}

export { GameSocketContext, GameSocketProvider };