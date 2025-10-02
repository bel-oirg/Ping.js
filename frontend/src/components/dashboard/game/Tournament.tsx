"use client"

import { useEffect, useState } from "react";
import Game from "@/components/dashboard/game/localGame";
import { useBarContext } from "@/context/BarContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useView } from "@/context/GameView";

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

				{/* Fields */}
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

const Tournament = () => {
	const initialGroups: PlayersGroup[] = [
		{ player1: "", player2: "" },
		{ player1: "", player2: "" },
	];

	const [triedToStart, setTriedToStart] = useState(false);
	const { setShowSidebar } = useBarContext();
	const { setView } = useView();



	const [mode, setMode] = useState<"lobby" | "playing" | "final" | "game">("lobby");
	const [groups, setGroups] = useState<PlayersGroup[]>(initialGroups);
	const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
	const [winners, setWinners] = useState<PlayersGroup[]>([]);
	const [finalWinner, setFinalWinner] = useState<string | null>(null);
	const [pendingMatch, setPendingMatch] = useState<PlayersGroup | null>(null);


	useEffect(() => {

		return () => {
			setShowSidebar(true);
		}
	}, []);

	const handleStart = () => {
		setShowSidebar(false);
		setTriedToStart(true);
		if (!validatePlayers()) return;
		setCurrentGroupIndex(0);
		setWinners([]);
		setFinalWinner(null);
		setMode("playing");
	};

	const handleNext = () => {
		setPendingMatch(groups[currentGroupIndex]);
		setMode("game");
	};

	const handleFinal = () => {
		const finalGroup = winners.length === 2
			? { player1: winners[0].player1, player2: winners[1].player1 }
			: { player1: "", player2: "" };
		setPendingMatch(finalGroup);
		setMode("game");
	};

	const handleGameEnd = (winner: string) => {
		setWinners(prev => [...prev, { player1: winner, player2: "TBD" }]);
		if (mode === "game" && currentGroupIndex + 1 < groups.length) {
			setCurrentGroupIndex(i => i + 1);
			setMode("playing");
		} else if (mode === "game" && winners.length === 1) {
			setMode("final");
		} else {
			setFinalWinner(winner);
		}
	};

	const validatePlayers = () => {
		const all = groups.flatMap(g => [g.player1.trim(), g.player2.trim()]);
		if (all.some(n => n === "" || n.length > 10)) return false;
		return new Set(all).size === all.length;
	};

	return (
		<>
			{mode === "lobby" && (
				<>

					<button
						onClick={() => setView("menu")}
						className="absolute top-20 left-20 text-cyan-300 text-3xl font-bold hover:text-cyan-400 transition select-none z-50"
						aria-label="Back"
					>
						&larr;
					</button>

					<section className="py-16 text-center">

						<h2 className="text-5xl font-bold mb-4">
							Tournament Bracket
						</h2>
						<p className="text-xl max-w-2xl mx-auto text-slate-700 ">
							Compete in knockout rounds or track your progress through the tournament bracket to win.
						</p>
					</section>


					<section className="my-6">
						<h2 className="text-2xl font-bold mb-10 text-center">
							Enter names
						</h2>
					</section>

					<div className="flex flex-wrap justify-center gap-6 mb-10">
						{groups.map((group, i) => (
							<GroupField
								key={i}
								value={group}
								onChange={g => setGroups(gs => { const copy = [...gs]; copy[i] = g; return copy; })}
								title={`Group ${i + 1}`} />
						))}
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
							Player names are required and must be unique.
						</p>
					)}
				</>
			)}

			{mode === "playing" && (
				<div className="space-y-8 max-w-4xl mx-auto">
					<MatchDisplay
						title={`Next Match: Group ${currentGroupIndex + 1}`}
						player1={groups[currentGroupIndex].player1}
						player2={groups[currentGroupIndex].player2}
					/>
					<div className="text-center text-lg">Click to start the match</div>
					<div className="flex justify-center">
						<button
							onClick={handleNext}
							className="bg-green-500 hover:bg-green-400 text-white px-8 py-3 rounded-xl text-lg font-semibold transition-shadow"
						>
							Play Match
						</button>
					</div>
				</div>
			)}

			{mode === "game" && pendingMatch && !finalWinner && (
				<Game players={pendingMatch} onGameEnd={handleGameEnd} />
			)}

			{mode === "final" && winners.length === 2 && (
				<div className="space-y-6 text-center max-w-4xl mx-auto">
					<MatchDisplay title="🏁 Final Match" player1={winners[0].player1} player2={winners[1].player1} />
					<div className="flex justify-center">
						<button
							onClick={handleFinal}
							className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-3 rounded-xl text-lg font-semibold transition-shadow"
						>
							Play Final Match
						</button>
					</div>
				</div>
			)}

			{finalWinner && (
				<div className="text-center mt-10 text-2xl sm:text-3xl lg:text-4xl font-bold text-green-400">
					<p>🏆 Winner: {finalWinner}</p>
					<button
						onClick={() => {
							setMode("lobby");
							setGroups(initialGroups);
							setWinners([]);
							setFinalWinner(null);
							setTriedToStart(false);
						}}
						className="mt-6 bg-yellow-500 hover:bg-yellow-400 text-white px-8 py-3 rounded-xl text-lg font-semibold transition-shadow"
					>
						Back to Menu
					</button>
				</div>
			)}


		</>
	);
};

export default Tournament;
