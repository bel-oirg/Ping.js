"use client";

import { useState, useEffect } from "react";
import { useBarContext } from "@/context/BarContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useView } from "@/context/GameView";
import Game from "@/components/dashboard/game/localGame";

interface PlayersGroup {
	player1: string;
	player2: string;
}

function MatchDisplay({
	player1,
	player2,
	title = "Next Match",
}: {
	player1: string;
	player2: string;
	title?: string;
}) {
	return (
		<Card className="w-full max-w-5xl mx-auto from-gray-900 to-gray-800 text-white shadow-xl rounded-3xl p-6 sm:p-8">
			<CardHeader>
				<CardTitle className="text-center text-cyan-400 text-2xl sm:text-3xl lg:text-4xl">
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-lg sm:text-xl">
					<span className="text-cyan-300 break-words">{player1}</span>
					<span className="text-gray-400">vs</span>
					<span className="text-pink-300 break-words">{player2}</span>
				</div>
			</CardContent>
		</Card>
	);
}

function GroupField({
	value,
	onChange,
	title,
	readonly = false,
}: {
	value: PlayersGroup;
	onChange?: (value: PlayersGroup) => void;
	title: string;
	readonly?: boolean;
}) {
	return (
		<Card className="w-full max-w-full h-[212px] sm:max-w-150 sm:min-w-150 lg:max-w-lg from-gray-900 to-gray-800 text-white shadow-xl rounded-3xl p-6 flex-shrink-0">
			<div className="flex">
				<div className="flex items-center">
					<span
						className="text-cyan-400 font-semibold text-xl select-none"
						style={{
							writingMode: "vertical-rl",
							transform: "rotate(180deg)",
							whiteSpace: "nowrap",
							userSelect: "none",
							marginRight: "1rem",
						}}
					>
						{title}
					</span>
				</div>
				<CardContent className="flex-grow">
					<div className="flex flex-col items-center gap-6 min-w-0">
						<PlayerSlot
							label="Player 1"
							value={value.player1}
							readonly={readonly}
							onChange={(v) => onChange?.({ ...value, player1: v })}
						/>
						<PlayerSlot
							label="Player 2"
							value={value.player2}
							readonly={readonly}
							onChange={(v) => onChange?.({ ...value, player2: v })}
						/>
					</div>
				</CardContent>
			</div>
		</Card>
	);
}

function PlayerSlot({
	label,
	value,
	readonly,
	onChange,
}: {
	label: string;
	value: string;
	readonly: boolean;
	onChange: (value: string) => void;
}) {
	return (
		<div className="flex flex-col items-center text-center w-full min-w-0">
			<div className="text-sm sm:text-base text-gray-400 mb-1">{label}</div>
			<Input
				type="text"
				value={value}
				placeholder="Enter name"
				readOnly={readonly}
				onChange={(e) => onChange(e.target.value)}
				className="w-full max-w-xs sm:max-w-sm text-center text-base sm:text-lg"
			/>
		</div>
	);
}

const OneVsOne = () => {
	const { setView } = useView();
	const { setShowSidebar } = useBarContext();


	const [players, setPlayers] = useState<PlayersGroup>({ player1: "", player2: "" });
	const [mode, setMode] = useState<"lobby" | "game" | "done">("lobby");
	const [triedToStart, setTriedToStart] = useState(false);
	const [winner, setWinner] = useState<string | null>(null);


	useEffect(() => {

		return () => {
			setShowSidebar(true);
		}
	}, []);

	const validatePlayers = () => {
		const { player1, player2 } = players;
		if (
			!player1.trim() ||
			!player2.trim() ||
			player1.trim() === player2.trim() ||
			player1.length > 10 ||
			player2.length > 10
		) {
			return false;
		}
		return true;
	};

	const handleStart = () => {
		setShowSidebar(false);
		setTriedToStart(true);
		if (!validatePlayers()) return;
		setMode("game");
	};

	const handleGameEnd = (winner: string) => {
		setWinner(winner);
		setMode("done");
	};

	return (
		<>
			{mode === "lobby" && (
				<>
					<button
						onClick={() => setView("menu")}
						className="absolute top-20 left-20 text-yellow-200 text-3xl font-bold hover:text-yellow-300 transition select-none z-50"
						aria-label="Back"
					>
						&larr;
					</button>

					<section className="py-16 text-center">
						<h2 className="text-5xl font-bold mb-4">1 vs 1 Match</h2>
						<p className="text-xl max-w-2xl mx-auto text-slate-700 dark:text-slate-300">
							Enter two player names and start the match!
						</p>
					</section>

					<section className="my-6">
						<h2 className="text-2xl font-bold mb-10 text-center">Enter names</h2>
					</section>

					<div className="flex justify-center mb-10">
						<GroupField
							value={players}
							onChange={setPlayers}
							title="Players"
						/>
					</div>

					<div className="flex justify-center">
						<button
							onClick={handleStart}
							disabled={!validatePlayers()}
							className={`px-8 py-3 rounded-xl text-white text-lg font-semibold transition-all shadow-lg ${validatePlayers()
								? "bg-cyan-500 hover:bg-cyan-400"
								: "bg-gray-600 cursor-not-allowed"
								}`}
						>
							Start
						</button>
					</div>
					{triedToStart && !validatePlayers() && (
						<p className="text-red-500 text-center mt-4 text-base">
							Player names are required, must be unique, and under 10 characters.
						</p>
					)}
				</>
			)}

			{mode === "game" && winner === null && (
				<Game players={players} onGameEnd={handleGameEnd} />
			)}


			{mode === "done" && winner && (
				<div className="text-center mt-10 text-2xl sm:text-3xl lg:text-4xl font-bold text-green-400">
					<p>🏆 Winner: {winner}</p>
					<button
						onClick={() => { setView("menu"), setShowSidebar(true) }}
						className="mt-6 bg-yellow-500 hover:bg-yellow-400 text-white px-8 py-3 rounded-xl text-lg font-semibold transition-shadow"
					>
						Back to Menu
					</button>
				</div >
			)}

		</>
	);
};

export default OneVsOne;
