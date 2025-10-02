import type { Metadata } from 'next'
import './globals.css'
import { LangProvider } from '@/context/langContext'
import { ThemeProvider } from '@/context/themeContext'
import ThemeScript from './theme-script'
import { AuthProvider } from '@/context/AuthContext'
import { NavigationProvider } from '@/context/NavigationContext'
import { Toaster } from '@/components/ui/sonner'
import { SocketProvider } from '@/context/SocketContext'
import { OnlineUsersProvider } from '@/context/OnlineUsersContext'
import { exo2, playwrite } from './fonts'

export const metadata: Metadata = {
	title: 'BlackHole.Js',
	description: 'A blazing fast web experience',
}

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`no-scrollbar ${exo2.variable} ${playwrite.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning={true}>
			<head>
				<ThemeScript />
				<script src="/rum.js" strategy="afterInteractive"></script>
				<script
					dangerouslySetInnerHTML={{
						__html: `
							window.elasticApm = window.elasticApm || window['elastic-apm-rum'];
							if (window.elasticApm && window.elasticApm.init) {
								window.elasticApm.init({
									serviceName: 'frontend',
									serverUrl: 'https://blackholejs.art/apm',
									environment: 'production',
								});
							}
						`,
					}}
					strategy="afterInteractive"
				/>
			</head>
			<body className="antialiased no-scrollbar">
				<ThemeProvider>
					<LangProvider>
						<AuthProvider>
							<SocketProvider>
								<OnlineUsersProvider>
									<NavigationProvider>
										{children}
										<Toaster />
									</NavigationProvider>
								</OnlineUsersProvider>
							</SocketProvider>
						</AuthProvider>
					</LangProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}
