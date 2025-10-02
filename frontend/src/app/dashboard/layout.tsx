'use client'

import { ProtectedRoute } from "@/lib/auth/ProtectedRoute"
import DashboardSidebar from "@/components/layouts/DashboardSidebar"
// import OnlineUsersDock from "@/components/layouts/OnlineUsersDock"
import { GameSocketProvider, GameSocketContext } from "@/context/GameSocket"
import { WalletProvider } from "@/context/walletContext"
import { ReactNode, useEffect } from "react"
import { BarProvider, useBarContext } from '@/context/BarContext'
import { SocketProvider } from '@/context/SocketContext'
import { LangProviderSSR } from '@/context/langContext'

/**
 * Dashboard layout with authentication protection
 * @param props - Component props
 * @returns Protected Dashboard layout
 */
function DashboardLayoutInner({ children }: { children: ReactNode }) {
	const { showSidebar } = useBarContext();

	useEffect(() => {
		const mainHeader = document.querySelector('header[data-main-header]');
		if (mainHeader instanceof HTMLElement) {
			mainHeader.style.display = 'none';
		}
	}, []);

	return (
		<div className="flex flex-col min-h-screen overflow-y-auto overflow-x-hidden">
			<div className="flex flex-1 pt-14">
				{showSidebar && <DashboardSidebar />}
				{/* <OnlineUsersDock /> */}
				<main className="flex-1 pt-4 pb-16 px-4 md:px-6 md:pr-20 data-scroll-behavior=smooth no-scrollbar">
					{children}
				</main>
			</div>
		</div>
	);
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
	return (
		<ProtectedRoute>
			<WalletProvider>
				<SocketProvider>
					<BarProvider>
						<DashboardLayoutInner>{children}</DashboardLayoutInner>
					</BarProvider>
				</SocketProvider>
			</WalletProvider>
		</ProtectedRoute>
	);
}
