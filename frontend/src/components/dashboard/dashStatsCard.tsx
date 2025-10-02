'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TokenManager } from '@/lib/api';
import { toast } from 'sonner';
import { useLang } from '@/context/langContext'
import en from '@/i18n/en'
import fr from '@/i18n/fr'

interface SummaryType {
	wins: number;
	losses: number;
	total: number;
	winRate: number;
}

interface Props { apiUrl: string };

function GameStatsCard({ apiUrl }: Props) {
	const [summary, setSummary] = useState<SummaryType | null>(null);
	const { lang } = useLang()
	const t = lang === 'en' ? en.dashboard : fr.dashboard

	useEffect(() => {
		const fetchSummary = async () => {
			try {
				const res = await fetch(apiUrl, {
					headers: {
						Authorization: `Bearer ${TokenManager.getToken()}`,
					},
				});
				if (!res.ok) throw new Error('Failed to fetch summary');

				const json = await res.json();
				const { wins = 0, losses = 0 } = json;
				const total = wins + losses;
				const winRate = total ? Math.round((wins / total) * 100) : 0;

				setSummary({ wins, losses, total, winRate });
			} catch (err) {
				toast.error('Error loading game stats summary');
				setSummary(null);
			}
		};

		fetchSummary();
	}, [apiUrl]);

	if (!summary) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>{t.stats}</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-center text-gray-400">Loading...</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t.stats}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 gap-4">
					<div className="border p-2 text-center">
						<p className="font-bold">{summary.winRate}%</p>
						<p className="text-sm">{t.winRate}</p>
					</div>
					<div className="border p-2 text-center">
						<p className="font-bold">{summary.total}</p>
						<p className="text-sm">{t.games}</p>
					</div>
					<div className="border p-2 text-center">
						<p className="font-bold">{summary.wins}</p>
						<p className="text-sm">{t.wins}</p>
					</div>
					<div className="border p-2 text-center">
						<p className="font-bold">{summary.losses}</p>
						<p className="text-sm">{t.losses}</p>
					</div>
				</div>

				<Link href="/dashboard/leaderboard" className="block mt-4">
					<Button variant="outline" className="w-full">
						{t.viewLeaderboard}
					</Button>
				</Link>
			</CardContent>
		</Card>
	);
}


export default GameStatsCard;