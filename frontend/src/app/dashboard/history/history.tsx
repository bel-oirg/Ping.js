"use client"

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { TokenManager } from "@/lib/api";
import { toast } from 'sonner';

interface gameType {
	id: number;
	username: string;
	avatar: string;
	myScore: number;
	opponentscore: number;
	created_at: string;
	_localKey?: number;
}

export default function HistoryPage() {
	const [games, setGames] = useState<gameType[]>([]);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);

	const loader = useRef<HTMLDivElement>(null);
	const loadingRef = useRef(loading);
	const hasMoreRef = useRef(hasMore);
	const offsetRef = useRef(0);
	const limit = 20;

	const fetchGames = useCallback(async () => {
		if (loadingRef.current || !hasMoreRef.current) return;

		setLoading(true);
		loadingRef.current = true;

		try {
			const offset = offsetRef.current;

			const res = await fetch(
				`/api/dash/get-game-history/?limit=${limit}&offset=${offset}`,
				{
					method: "GET",
					headers: { Authorization: `Bearer ${TokenManager.getToken()}` },
				}
			);

			if (!res.ok) throw new Error("Failed to fetch data");

			const data = await res.json();

			const newGames: gameType[] = data.map((game: any, i: number) => ({
				...game,
				_localKey: offset + i,
			}));

			setGames((prev) => [...prev, ...newGames]);
			offsetRef.current += newGames.length;

			if (newGames.length < limit) {
				setHasMore(false);
				hasMoreRef.current = false;
			}
		} catch (err) {
			toast.error('Failed to fetch history data');
		} finally {
			setLoading(false);
			loadingRef.current = false;
		}
	}, []);

	useEffect(() => {
		fetchGames();
	}, []);

	useEffect(() => {
		const observer = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting && !loadingRef.current && hasMoreRef.current) {
				fetchGames();
			}
		}, { threshold: 1.0 });

		if (loader.current) observer.observe(loader.current);
		return () => {
			if (loader.current) observer.unobserve(loader.current);
		};
	}, [fetchGames]);
	
	const normalizeAvatarUrl = (url?: string, version?: number) => {
		if (typeof url === 'string') {
		  let newUrl = url;
		  let shouldNormalize = false;
		  if (newUrl.includes('/dash/media/avatarUpload')) {
			newUrl = newUrl.replace('/dash/media/avatarUpload', 'https://blackholejs.art/avatars');
			shouldNormalize = true;
		  } else if (newUrl.includes('/media/avatarUpload')) {
			newUrl = newUrl.replace('/media/avatarUpload', 'https://blackholejs.art/avatars');
			shouldNormalize = true;
		  }
		  if (shouldNormalize && version) {
			return `${newUrl}?cb=${version}`;
		  }
		  return newUrl;
		}
		return url;
	  };



	return (
		<div className="w-full max-w-[2000px] mx-auto px-4 space-y-2">
			<div className="flex justify-between items-center mb-8">
				<h2 className="text-2xl font-bold">History</h2>
			</div>

			{games.map(({ _localKey, id, myScore, opponentscore, avatar, username, created_at }) => {
				const won = myScore > opponentscore;
				const resultText = won ? "Victory" : "Defeat";
				const resultColor = won ? "text-success-1" : "text-error-1";
				const formattedDate = new Date(created_at).toLocaleString(undefined, {
					dateStyle: "medium",
					timeStyle: "short",
				});

				return (
					<div
						key={_localKey}
						className="flex flex-col sm:flex-row items-start sm:items-center p-2 rounded-xl gap-4 bg-card/50 border border-white/10"
					>
						{/* Avatar + Username */}
						<div className="flex items-center gap-4 flex-1 min-w-0">
							<Link href={`/dashboard/profile/?id=${id}`} className="shrink-0">
								<img
									src={normalizeAvatarUrl(avatar, Date.now())}
									alt={`Avatar of ${username}`}
									className="w-12 h-12 rounded-full border border-white/10 block"
								/>
							</Link>
							<div className="truncate">
								<p className="text-base font-semibold text-white truncate">{username}</p>
								<p className="text-xs text-gray-400">{formattedDate}</p>
							</div>
						</div>

						{/* Score display */}
						<div className="flex items-center gap-2 text-sm font-semibold text-white sm:justify-center">
							<span className="text-[18px] text-gray-400">{opponentscore}</span>
							<span className="text-gray-500">–</span>
							<span className="text-[18px] text-white">{myScore}</span>
						</div>

						{/* Result label */}
						<div className="flex items-center justify-end sm:w-24">
							<span className={`text-[13px] px-2 py-0.5 rounded-full font-semibold ${resultColor}`}>
								{resultText}
							</span>
						</div>
					</div>
				);
			})}

			{/* Infinite scroll loader */}
			{hasMore && (
				<div ref={loader} className="text-center py-4 text-sm text-gray-400">
					{loading ? "Loading more..." : "Scroll down to load more"}
				</div>
			)}
		</div>
	);

}
