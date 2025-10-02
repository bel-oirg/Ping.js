"use client";
import React, { useEffect, useContext, useState } from "react";
import { Merge, Trophy, Swords } from "lucide-react";
import { useView } from '@/context/GameView';
import { useBarContext } from '@/context/BarContext';
import { GameSocketContext } from "@/context/GameSocket";
import { GameModeCard } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import Tournament from "@/components/dashboard/game/Tournament";
import Game from "@/components/dashboard/game/onlineGame";
import OneVsOne from "@/components/dashboard/game/oneVsOne";
import { useLang } from '@/context/langContext'
import en from '@/i18n/en'
import fr from '@/i18n/fr'
import { toast } from 'sonner'

export default function Home() {
	const socket = useContext(GameSocketContext);
	const { view, setView } = useView();
	const [isQueueDisabled, setIsQueueDisabled] = useState(false);
	const [canCancelQueue, setCanCancelQueue] = useState(false);
	const [tournButtonDisabled, setTournButtonDisabled] = useState(false);
	const [showSocketError, setShowSocketError] = useState(false);
	const { setShowSidebar } = useBarContext();
	const gameModes = ['tournament', '1vs1', 'game'];

	const { lang } = useLang()
	const t = lang === 'en' ? en.game : fr.game

	function cancelQueueHandler() {
		if (!socket) return;
		socket.emit('queue:cancel');
	}

	function quickStartHandler() {
		if (!socket) return;
		socket.emit('queue:join');
	}

	useEffect(() => {
		const timeout = setTimeout(() => {
			if (!socket) setShowSocketError(true);
		}, 1000);
		return () => clearTimeout(timeout);
	}, [socket]);

	useEffect(() => {
		if (!socket) return;

		socket.on("welcome", () => { });
		socket.on("room:reconnect", (event) => {
			toast.info(t.reconnecting, event);
		});
		socket.on("room:id", (event) => {
			sessionStorage.setItem("roomId", event.roomid);
			setIsQueueDisabled(false);
			setCanCancelQueue(true);
			setShowSidebar(false);
			setTournButtonDisabled(false);
			setView("game");
		});
		socket.on("queue:joined", () => {
			setCanCancelQueue(true);
		});
	}, [socket, setShowSidebar, setView]);

	return (
		<>
			{!gameModes.includes(view) && (
				<section className="py-16 text-center">
					<h2 className="text-5xl font-bold mb-4">{t.welcome}</h2>
					<p className="text-xl max-w-2xl mx-auto text-slate-700 dark:text-slate-300">
						{t.description}
					</p>
				</section>
			)}

			{view === "game" && (
				<div className="py-10">
					<Game />
				</div>
			)}

			{view === "menu" && (
				<section className="my-6">
					<h2 className="text-2xl font-bold mb-10 text-center">{t.selectOption}</h2>
					<div className="flex flex-wrap justify-center gap-8">
						<GameModeCard
							title={
								<div className="flex items-center justify-center space-x-2">
									<Merge className="text-green-400" />
									<span>{t.quickStart}</span>
								</div>
							}
							description={t.quickDesc}
							footer={
								showSocketError && !socket ? (
									<h2 className="text-2xl text-red-500">
										{t.apiError}
									</h2>
								) : isQueueDisabled && canCancelQueue ? (
									<Button
										onClick={() => {
											setIsQueueDisabled(false);
											cancelQueueHandler();
											setTournButtonDisabled(false);
										}}
										className="text-red-500 font-bold bg-transparent hover:bg-black border"
									>
										{t.cancel}
									</Button>
								) : (
									<Button
										onClick={() => {
											if (!socket) return;
											setIsQueueDisabled(true);
											quickStartHandler();
											setTournButtonDisabled(true);
										}}
										className="text-white font-bold bg-transparent hover:bg-black border"
										disabled={isQueueDisabled && !canCancelQueue}
									>
										{isQueueDisabled ? t.loading : t.start}
									</Button>
								)
							}
						/>

						<GameModeCard
							title={
								<div className="flex items-center justify-center space-x-2">
									<Trophy className="text-amber-400" />
									<span>{t.tournament}</span>
								</div>
							}
							description={t.tournamentDesc}
							footer={
								<Button
									onClick={() => setView("tournament")}
									className="text-white font-bold bg-transparent hover:bg-black border"
									disabled={tournButtonDisabled}
								>
									{t.join}
								</Button>
							}
						/>

						<GameModeCard
							title={
								<div className="flex items-center justify-center space-x-2">
									<Swords className="text-blue-400" />
									<span>{t.localGame}</span>
								</div>
							}
							description={t.tournamentDesc}
							footer={
								<Button
									onClick={() => setView("1vs1")}
									className="text-white font-bold bg-transparent hover:bg-black border"
									disabled={tournButtonDisabled}
								>
									{t.play}
								</Button>
							}
						/>

					</div>
				</section>
			)}

			{view === "tournament" && <Tournament />}
			{view === "1vs1" && <OneVsOne />}
		</>
	);
}
