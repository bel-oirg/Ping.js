'use client';

import { Card } from '@/components/ui/card';
import React, { useEffect, useState } from 'react';
import { TokenManager } from '@/lib/api';
import { toast } from 'sonner';

interface Summary {
	wins: number;
	losses: number;
	total: number;
	winRate: number;
}

interface Props {
	apiUrl: string;
}

const GameStatsSummary = ({ apiUrl }: Props) => {
	const [summary, setSummary] = useState<Summary | null>(null);

	useEffect(() => {
		const fetchSummary = async () => {
			try {
				// 👇 Fetch the game summary from backend
				const res = await fetch(apiUrl, {
					headers: {
						Authorization: `Bearer ${TokenManager.getToken()}`,
					},
				});
				if (!res.ok) throw new Error('Failed to fetch summary');

				const json = await res.json();

				// 👇 Extract necessary fields
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
			<Card className="w-full h-full rounded-2xl shadow-md p-6 flex flex-col justify-center">
				<div className="flex items-center justify-center h-40">
					<p className="text-sm text-gray-500">No data available.</p>
				</div>
			</Card>
		);
	}

	return (
		<Card className="w-full h-full rounded-2xl shadow-md p-6 flex flex-col justify-center">
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
				{[
					{ label: 'Total Games', value: summary.total },
					{ label: 'Wins', value: summary.wins, className: 'text-green-600' },
					{ label: 'Losses', value: summary.losses, className: 'text-red-500' },
					{ label: 'Win Rate', value: `${summary.winRate}%` },
				].map((item, idx) => (
					<div key={idx} className="p-4 rounded-xl border text-center space-y-1 shadow-sm">
						<p className="text-sm text-gray-500">{item.label}</p>
						<p className={`text-2xl font-bold ${item.className || ''}`}>{item.value}</p>
					</div>
				))}
			</div>
		</Card>
	);
};

export default GameStatsSummary;
