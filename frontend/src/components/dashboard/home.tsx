'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import MiniHistory from "@/components/dashboard/miniHistory"
import { useEffect, useState } from "react"
import { TokenManager } from "@/lib/api"
import { useTranslation } from "@/hooks/useTranslation"
import { useAuth } from "@/context/AuthContext"
import GameStatsCard from "@/components/dashboard/dashStatsCard"


interface gameType {
	id: number;
	username: string;
	avatar: string;
	myScore: number;
	opponentscore: number;
}

type historyType = gameType[];

/**
 * Just place holder for now 
 * @returns 
 */

export function DashboardComponent() {
	const { t } = useTranslation('common')
	const { user } = useAuth()

	return (
		<div className="container mt-8 mx-auto">
			<h1 className="text-2xl font-bold mb-4">{t('dashboard.title')}</h1>
			{user && <p className="mb-6">{t('dashboard.greeting', { name: user.username || JSON.parse(localStorage.getItem('blackhole_user_profile') || '{}').username })}</p>}

			<div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
				<div>
					<Card className="h-full">
						<CardHeader>
							<CardTitle>Quick Actions</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 gap-4">
								<Link href="/dashboard/game">
									<Button variant="outline" className="w-full">Play Game</Button>
								</Link>
								<Link href="/dashboard/friends">
									<Button variant="outline" className="w-full">Find Friends</Button>
								</Link>
								<Link href="/dashboard/chat">
									<Button variant="outline" className="w-full">Open Chat</Button>
								</Link>
								<Link href="/dashboard/leaderboard">
									<Button variant="outline" className="w-full">View Leaderboard</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Recent Activity</CardTitle>
				</CardHeader>
				<CardContent>
					<MiniHistory />
					<Link href="/dashboard/history" className="block mt-4">
						<Button variant="outline" className="w-full">View Full History</Button>
					</Link>
				</CardContent>
			</Card>

			<GameStatsCard apiUrl="/api/dash/get-game-charts/" />


		</div>
	)
} 