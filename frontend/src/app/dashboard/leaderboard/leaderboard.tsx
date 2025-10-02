'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { TokenManager } from '@/lib/api'
import { toast } from 'sonner';

interface Player {
	id: number
	username: string
	avatar: string
	rank: number
	level: number
	exp: number
	level_limits: {
		min_exp: number
		max_exp: number
	}
}


export default function Leaderboard() {
	const [players, setPlayers] = useState<Player[]>([])

	useEffect(() => {
		const fetchLeaderboard = async () => {
			try {
				const response = await fetch('/api/dash/leaderboard/', {
					method: 'GET',
					headers: { Authorization: `Bearer ${TokenManager.getToken()}` },
				})
				if (!response.ok) throw new Error('Network error')
				const data = await response.json()
				setPlayers(data)
			} catch (error) {
				toast.error('Failed to fetch leaderboard');
			}
		}

		fetchLeaderboard()
	}, [])

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
				<h2 className="text-2xl font-bold"> LeaderBoard </h2>
			</div>

			{players.map((player, index) => {
				const progress =
					((player.exp - player.level_limits.min_exp) /
						(player.level_limits.max_exp - player.level_limits.min_exp)) * 100

				return (
					<div
						key={player.id}
						className="flex flex-col sm:flex-row items-center sm:items-center p-2 rounded-xl gap-3 bg-card/50 border border-white/10"
					>
						<span className="w-8 text-sm text-gray-400 text-center font-bold flex-shrink-0">
							#{index + 1}
						</span>

						<div className="flex items-center gap-4 flex-1 min-w-0">
							<img
								src={normalizeAvatarUrl(player.avatar, Date.now())}
								alt={`${player.username} avatar`}
								className="w-10 h-10 rounded-full border border-white/10 flex-shrink-0"
							/>
							<div className="truncate">
								<Link href={`/dashboard/profile/?id=${player.id}`}>
									<p className="text-base font-semibold text-white hover:underline truncate">
										{player.username}
									</p>
								</Link>
								<p className="text-xs sm:text-sm text-gray-400">Lv {player.level}</p>
							</div>
						</div>

						<div className="flex flex-col items-end gap-1 w-full sm:w-40 mt-2 sm:mt-0">
							<div className="w-full bg-gray-700 h-2 rounded overflow-hidden">
								<div
									className="h-full bg-purple-500 transition-all duration-300 ease-in-out"
									style={{ width: `${progress}%` }}
								/>
							</div>
							<p className="text-xs sm:text-[11px] text-gray-400">
								{player.exp} / {player.level_limits.max_exp} XP
							</p>
						</div>
					</div>
				)
			})}
		</div>
	)
}
