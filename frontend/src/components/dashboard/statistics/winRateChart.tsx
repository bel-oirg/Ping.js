'use client';

import { Card } from '@/components/ui/card';
import { TokenManager } from '@/lib/api';
import React, { useEffect, useState } from 'react';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	ResponsiveContainer,
	CartesianGrid,
} from 'recharts';
import { toast } from 'sonner';

interface GameAPI {
	myscore: number;
	opponentscore: number;
	created_at: string; // ISO string
	opponent: string;
}

interface ChartDataPoint {
	date: string; // 'YYYY-MM-DD'
	winRate: number;
}

const processGameData = (games: GameAPI[]): ChartDataPoint[] => {
	const sorted = [...games].sort(
		(a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
	);

	const winMap = new Map<string, { wins: number; total: number }>();

	for (const game of sorted) {
		const date = game.created_at.slice(0, 10);
		const isWin = game.myscore > game.opponentscore;

		if (!winMap.has(date)) {
			winMap.set(date, { wins: 0, total: 0 });
		}
		const entry = winMap.get(date)!;
		entry.total++;
		if (isWin) entry.wins++;
	}

	const result: ChartDataPoint[] = [];
	let cumulativeWins = 0;
	let cumulativeTotal = 0;

	for (let i = 6; i >= 0; i--) {
		const d = new Date();
		d.setDate(d.getDate() - i);
		const dateStr = d.toISOString().slice(0, 10);

		const dayData = winMap.get(dateStr);
		if (dayData) {
			cumulativeWins += dayData.wins;
			cumulativeTotal += dayData.total;
		}

		const winRate = cumulativeTotal
			? Math.round((cumulativeWins / cumulativeTotal) * 100)
			: 0;

		result.push({ date: dateStr, winRate });
	}

	return result;
};

const formatDateShort = (dateString: string) => {
	const date = new Date(dateString);
	const day = String(date.getDate()).padStart(2, '0');
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const year = String(date.getFullYear()).slice(-2);
	return `${day}-${month}-${year}`;
};

interface WinRateChartProps {
	apiUrl: string;
}

const WinRateChart = ({ apiUrl }: WinRateChartProps) => {
	const [games, setGames] = useState<GameAPI[]>([]);
	const [data, setData] = useState<ChartDataPoint[]>([]);

	useEffect(() => {
		const fetchGameStats = async () => {
			try {
				const response = await fetch(apiUrl, {
					headers: {
						Authorization: `Bearer ${TokenManager.getToken()}`,
					},
				});
				if (!response.ok) throw new Error("Failed to fetch");
				const data = await response.json();
				setGames(data || []);
			} catch (err) {
				toast.error('Error fetching stats');
				setGames([]);
			}
		};
		fetchGameStats();
	}, [apiUrl]);

	useEffect(() => {
		if (games.length > 0) {
			setData(processGameData(games));
		} else {
			setData(processGameData([]));
		}
	}, [games]);

	return (
		<Card className=" w-full mx-auto p-4 shadow-md rounded-2xl h-[500px] flex flex-col justify-start">
			<h2 className="text-base sm:text-lg font-semibold text-center mb-3">
				Cumulative Win Rate - Last 7 Days
			</h2>

			{data.length === 0 ? (
				<div className="flex-1 flex items-center justify-center">
					<p className="text-center text-gray-500 text-sm">
						Play a game to have statistics.
					</p>
				</div>
			) : (
				<div className="w-full flex-1">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={data}>
							<CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
							<XAxis
								dataKey="date"
								tick={{ fontSize: 11 }}
								tickFormatter={formatDateShort}
								label={{ value: 'Date', position: 'insideBottomRight', offset: -5 }}
							/>
							<YAxis
								domain={[0, 100]}
								tickFormatter={(val) => `${val}%`}
								label={{
									value: 'Win Rate',
									angle: -90,
									position: 'insideLeft',
									style: { textAnchor: 'middle' },
								}}
							/>
							<Tooltip formatter={(val) => `${val}%`} />
							<Legend wrapperStyle={{ fontSize: '12px' }} />
							<Line
								type="monotone"
								dataKey="winRate"
								stroke="#10b981"
								strokeWidth={2}
								name="Win Rate (%)"
								dot={{ r: 3 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			)}
		</Card>
	);
};

export default WinRateChart;
