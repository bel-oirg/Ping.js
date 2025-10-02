'use client';

import { Card } from '@/components/ui/card';
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TokenManager } from '@/lib/api';
import { toast } from 'sonner';

const COLORS = ['#10b981', '#ef4444'];

interface ChartSlice {
	name: string;
	value: number;
}

interface ApiResponse {
	wins: number;
	losses: number;
}

interface Props {
	apiUrl: string;
}

const GameDoughnutChart = ({ apiUrl }: Props) => {
	const [chartData, setChartData] = useState<ChartSlice[]>([]);

	useEffect(() => {
		const fetchChartData = async () => {
			try {

				const res = await fetch(apiUrl, {
					headers: {
						Authorization: `Bearer ${TokenManager.getToken()}`,
					},
				});
				if (!res.ok) throw new Error('Failed to fetch game stats');
				const data: ApiResponse = await res.json();


				setChartData([
					{ name: 'Wins', value: data.wins },
					{ name: 'Losses', value: data.losses },
				]);
			} catch (err) {
				toast.error('Error loading chart data');
				setChartData([]);
			}
		};

		fetchChartData();
	}, [apiUrl]);

	return (
		<Card className="w-full h-[350px] p-4 rounded-2xl shadow-md flex flex-col">
			<h2 className="text-center font-semibold mb-3 text-base sm:text-lg">Wins vs Losses</h2>

			{chartData.length === 0 ? (

				<div className="flex-1 flex items-center justify-center">
					<p className="text-sm text-gray-500">No data available.</p>
				</div>
			) : (

				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Pie
							data={chartData}
							cx="50%"
							cy="50%"
							innerRadius={60}
							outerRadius={90}
							paddingAngle={3}
							dataKey="value"
						>
							{chartData.map((_, i) => (
								<Cell key={i} fill={COLORS[i % COLORS.length]} />
							))}
						</Pie>
						<Tooltip />
						<Legend iconType="circle" />
					</PieChart>
				</ResponsiveContainer>
			)}
		</Card>
	);
};

export default GameDoughnutChart;
