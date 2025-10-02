
'use client';

import { GameSocketProvider, GameSocketContext } from "@/context/GameSocket"
import Home from "@/components/dashboard/game/gameLobby";



export default function Lobby() {

	return (
		<GameSocketProvider>
			<Home />
		</GameSocketProvider>
	)
}