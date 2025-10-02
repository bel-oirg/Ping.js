'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { TokenManager } from '@/lib/api';

const toast = {
	error: (msg: string) => console.error(msg),
};

interface GameType {
	id: number;
	username: string;
	avatar: string;
	myScore: number;
	opponentscore: number;
	created_at: string;
}

function formatDate(iso: string) {
	const date = new Date(iso);
	return date.toLocaleString('en-GB', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

export default function MiniHistory({ id = undefined }: { id?: number }) {
	const [games, setGames] = useState<GameType[]>([]);


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

	useEffect(() => {
		const fetchData = async () => {
			const token = TokenManager.getToken();
			let fetchUrl = "/api/dash/get-game-history/?limit=5";
			if (id)
				fetchUrl = `/api/dash/get-game-history/?limit=5&id=${id}`

			const res = await fetch(fetchUrl, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!res.ok) throw new Error('Failed to fetch game history');

			const data: GameType[] = await res.json();
			setGames(data);
		};

		fetchData().catch((err) => toast.error('Error fetching data'));
	}, []);

	return (
		<div className="space-y-2">
			{games.map(({ id, myScore, opponentscore, avatar, username, created_at }: GameType, index: number) => {
				const won = myScore > opponentscore;
				const resultText = won ? 'Victory' : 'Defeat';
				const resultColor = won ? 'text-success-1' : 'text-error-1';
				const formattedDate = formatDate(created_at);

				return (
					<div
						key={index}
						className="flex flex-col sm:flex-row items-start sm:items-center p-2 rounded-xl gap-3 bg-card/50 border border-white/10"
					>
						<div className="flex items-center gap-3 flex-1 min-w-0">
							<Link href={`/dashboard/profile/?id=${id}`} className="shrink-0">
								<img
									src={`${normalizeAvatarUrl(avatar, Date.now())}`}
									alt={`Avatar of ${username}`}
									className="w-12 h-12 rounded-full border border-white/10 block"
								/>
								{/* <Avatar className="md:h-12 md:w-12 sm:h-10 sm:w-10 lg:h-12 lg:w-12">
									{avatar ? (
										<AvatarImage src={normalizeAvatarUrl(avatar, avatarVersion)} alt={username} />
											) : (
										<AvatarImage src="/data/avatars/default.png" alt={username || "User"} />
									)}
								</Avatar> */}
							</Link>
							<div className="truncate">
								<p className="text-base font-semibold text-white truncate">{username}</p>
								<p className="text-xs text-gray-400">{formattedDate}</p>
							</div>
						</div>

						<div className="flex items-center gap-2 text-sm font-semibold text-white sm:justify-center">
							<span className="text-[18px] text-gray-400">{opponentscore}</span>
							<span className="text-gray-500">–</span>
							<span className="text-[18px] text-white">{myScore}</span>
						</div>

						<div className="flex items-center justify-end sm:w-24">
							<span className={`text-[13px] px-2 py-0.5 rounded-full font-semibold ${resultColor}`}>
								{resultText}
							</span>
						</div>
					</div>
				);
			})}
		</div>
	);
}
