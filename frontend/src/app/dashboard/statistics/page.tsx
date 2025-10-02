'use client';


import WinRateChart from '@/components/dashboard/statistics/winRateChart';
import GameDoughnutChart from '@/components/dashboard/statistics/gameDoughnutChart';
import GameStatsSummary from '@/components/dashboard/statistics/gameStatsSummary';

const StatisticsPage = () => {
	return (
		<div className="flex flex-col gap-6 px-4 py-6 mx-auto">
			<h1 className="text-2xl font-bold">Statistics</h1>

			<WinRateChart apiUrl="/api/dash/get-game-charts/?interval=1" />

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
				<GameDoughnutChart apiUrl="/api/dash/get-game-charts/" />
				<GameStatsSummary apiUrl="/api/dash/get-game-charts/" />
			</div>
		</div>
	);
};

export default StatisticsPage;
