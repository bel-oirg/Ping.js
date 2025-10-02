'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useLang } from '@/context/langContext'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Home, Gamepad2, MessageSquare, Users, Trophy, History, Settings, Search, ChevronLeft, ChevronRight, X, LogOut, ChartBar, ShoppingCart, Send } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils/index'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { dashboardService } from '@/lib/api'
import { SearchUser } from '@/types/Dashboard'
import { ThemeToggle } from '@/components/layouts/theme-toggle'
import { NotificationCenter } from '@/components/ui/notif'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from '@/hooks/useAuth'
import { getStoredProfile, storeProfileData, isProfileDataValid } from '@/utils/profileStorage'
import { toast } from 'sonner';

interface EnhancedSearchUser extends SearchUser {
	avatarUrl?: string;
}

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

const DashboardSidebar = () => {
	const { lang, setLang, mounted: langMounted } = useLang()
	const [mounted, setMounted] = useState(false)
	const [isDockVisible, setIsDockVisible] = useState<boolean | null>(null)
	const [isSearchOpen, setIsSearchOpen] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const [searchResults, setSearchResults] = useState<EnhancedSearchUser[]>([])
	const [isSearching, setIsSearching] = useState(false)
	const [username, setUsername] = useState<string>('')
	const [avatar, setAvatar] = useState<string | null>(null)
	const [userId, setUserId] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const pathname = usePathname()
	const { logout } = useAuth()
	const [avatarVersion, setAvatarVersion] = useState(Date.now());
	const prevAvatarRef = useRef<string | null>(null);

	const debouncedSearch = useCallback(
		debounce(async (query: string) => {
			if (!query.trim()) {
				setSearchResults([])
				setIsSearching(false)
				return
			}

			try {
				const response = await dashboardService.search(query)

				if (response.status.success && response.data) {
					const enhancedResults = response.data.map(user => ({
						...user,
						avatarUrl: normalizeAvatarUrl(user.avatar, Date.now()) || "/data/avatars/default.png"
					}))
					setSearchResults(enhancedResults)
				} else {
					setSearchResults([])
				}
			} catch (err) {
				toast.error('Search error');
				setSearchResults([])
			} finally {
				setIsSearching(false)
			}
		}, 300),
		[]
	)

	const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const query = e.target.value
		setSearchQuery(query)

		if (query.trim()) {
			setIsSearching(true)
			debouncedSearch(query)
		} else {
			setSearchResults([])
			setIsSearching(false)
		}
	}

	useEffect(() => {
		setMounted(true)
		const handleResize = () => {
			if (window.innerWidth < 768) {
				setIsDockVisible(false)
			} else {
				setIsDockVisible(true)
			}
		}
		handleResize()
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [pathname])

	useEffect(() => {
		const fetchProfileData = async () => {
			if (mounted && typeof window !== 'undefined') {
				const storedProfile = getStoredProfile();

				if (storedProfile && isProfileDataValid()) {
					setUsername(storedProfile.username);
					setAvatar(storedProfile.avatar);
					setUserId(storedProfile.id);
					setIsLoading(false);
					if (prevAvatarRef.current !== storedProfile.avatar) {
						setAvatarVersion(Date.now());
						prevAvatarRef.current = storedProfile.avatar;
					}
					return;
				}
				setIsLoading(true);
				try {
					const response = await dashboardService.getCard();
					if (response.status.success && response.data) {
						const { User } = response.data;
						setUsername(User.username);
						setAvatar(User.avatar);
						setUserId(User.id);
						storeProfileData(response.data);
					}
				} catch (err) {
					toast.error('Sidebar error');
				} finally {
					setIsLoading(false);
				}
			}
		};
		fetchProfileData();
	}, [mounted]);

	useEffect(() => {
		const handleProfileUpdated = () => {
			const storedProfile = getStoredProfile();
			if (storedProfile && isProfileDataValid()) {
				setUsername(storedProfile.username);
				setAvatar(storedProfile.avatar);
				setUserId(storedProfile.id);
				if (prevAvatarRef.current !== storedProfile.avatar) {
					setAvatarVersion(Date.now());
					prevAvatarRef.current = storedProfile.avatar;
				}
			}
		};
		window.addEventListener('profile-updated', handleProfileUpdated);
		return () => window.removeEventListener('profile-updated', handleProfileUpdated);
	}, []);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isSearchOpen) {
				setIsSearchOpen(false)
			}
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [isSearchOpen])

	const toggleDock = () => {
		setIsDockVisible(!isDockVisible)
	}

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault()
	}

	const handleUserClick = (userId: string) => {
		setIsSearchOpen(false)
		setSearchQuery('')
		window.location.href = `/dashboard/profile?id=${userId}`
	}

	const toggleLang = () => {
		setLang(lang === 'en' ? 'fr' : 'en')
	}
	const navTabs = [
		{ name: 'Home', href: '/dashboard', icon: <Home className="h-5 w-5" /> },
		{ name: 'Game', href: '/dashboard/game', icon: <Gamepad2 className="h-5 w-5" /> },
		{ name: 'Chat', href: '/dashboard/chat', icon: <MessageSquare className="h-5 w-5" /> },
		{ name: 'Friends', href: '/dashboard/friends', icon: <Users className="h-5 w-5" /> },
		{ name: 'Leaderboard', href: '/dashboard/leaderboard', icon: <Trophy className="h-5 w-5" /> },
		{ name: 'Store', href: '/dashboard/store', icon: <ShoppingCart className="h-5 w-5" /> },
		{ name: 'History', href: '/dashboard/history', icon: <History className="h-5 w-5" /> },
		{ name: 'Statistics', href: '/dashboard/statistics', icon: <ChartBar className="h-5 w-5" /> },
		{ name: 'Settings', href: '/dashboard/settings', icon: <Settings className="h-5 w-5" /> },
	]
	if (!mounted || !langMounted) {
		return null;
	}
	const showDock = isDockVisible === null ? true : isDockVisible;

	return (
		<>
			<div className="fixed top-0 left-0 right-0 h-14 bg-card/80 backdrop-blur-sm border-b border-border z-50 flex items-center px-4" data-dashboard-header>
				<div className="flex items-center justify-between w-full">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
							<Avatar className="md:h-12 md:w-12 sm:h-10 sm:w-10 lg:h-12 lg:w-12 border-primary/20">
								{avatar ? (
									<AvatarImage src={normalizeAvatarUrl(avatar, avatarVersion)} alt={username} />
								) : (
									<AvatarImage src="/data/avatars/default.png" alt={username || "User"} />
								)}
							</Avatar>
								<p className="font-medium text-sm">
									@{username || "loading..."}
								</p>
							</div>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start" className="w-48">
							<DropdownMenuItem onClick={() => logout()} className="cursor-pointer">
								<LogOut className="mr-2 h-4 w-4" />
								<span>Logout</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					<div className="flex items-center gap-2">
						<NotificationCenter />

						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<ThemeToggle className="h-8 w-8 rounded-full" />
								</TooltipTrigger>
								<TooltipContent side="bottom">
									<p>Toggle Theme</p>
								</TooltipContent>
							</Tooltip>

							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										onClick={toggleLang}
										className="h-8 w-8 rounded-full"
									>
										<span className="font-medium text-xs">{lang === 'en' ? 'FR' : 'EN'}</span>
									</Button>
								</TooltipTrigger>
								<TooltipContent side="bottom">
									<p>Switch Language</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				</div>
			</div>

			<div className="fixed bottom-4 right-4 z-20">
				<div className={cn(
					"flex flex-col items-center space-y-1 md:space-y-2 py-3 md:py-4 px-1 md:px-2 rounded-full bg-card hover:bg-card",
					!showDock && "py-2 px-1 md:px-2",
				)}>
					<TooltipProvider>
						{showDock && (
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => setIsSearchOpen(!isSearchOpen)}
										className={cn(
											"rounded-full",
											"h-8 w-8 md:h-12 md:w-12 hover:bg-card hover:text-primary"
										)}
									>
										<Search className={cn("md:h-5 md:w-5", "h-3.5 w-3.5")} />
									</Button>
								</TooltipTrigger>
								<TooltipContent side="left">
									<p>Search</p>
								</TooltipContent>
							</Tooltip>
						)}
						{/** //TODO: Check this later */}
						{showDock && (
							<div className="w-full border-t my-1 md:my-2"></div>
						)}
						{showDock && navTabs.map((tab) => (
							<Tooltip key={tab.name}>
								<TooltipTrigger asChild>
									<Link href={tab.href}>
										<Button
											variant={pathname === tab.href ? "default bg-card" : "ghost bg-card"}
											size="icon"
											className={cn(pathname === tab.href ? " transition-all duration-200 rounded-full h-8 w-8 md:h-12 md:w-12 text-primary  " : " transition-all duration-200 rounded-full h-8 w-8 md:h-12 md:w-12")}
											onClick={() => {
												if (pathname === tab.href) {
													setIsDockVisible(false)
												}
											}}
										>
											<div className={cn("h-3.5 w-3.5 md:h-5 md:w-5")}>
												{tab.icon}
											</div>
										</Button>
									</Link>
								</TooltipTrigger>
								<TooltipContent side="left">
									<p>{tab.name}</p>
								</TooltipContent>
							</Tooltip>
						))}

						{showDock && (
							<div className="w-full  my-1 md:my-1"></div>
						)}
						{showDock && (
							<Tooltip>
								<TooltipTrigger asChild>
									<Link href={`/dashboard/profile?id=${userId}`}>
										<Button
											variant="ghost"
											size="icon"
											className={cn(
												"rounded-full",
												"h-8 w-8 md:h-12 md:w-12"
											)}
										>
											{/* <Avatar className="md:h-12 md:w-12 sm:h-5 sm:w-5 lg:h-12 lg:w-12">
												{avatar ? (
													<AvatarImage src={`${normalizeAvatarUrl(avatar)}?cb=${avatarVersion}`} alt={username} />
												) : (
													<AvatarImage src="/data/avatars/default.png" alt={username || "User"} />
												)}
											</Avatar> */}
											<Avatar className="md:h-12 md:w-12 sm:h-10 sm:w-10 lg:h-12 lg:w-12">
												{avatar ? (
													<AvatarImage src={normalizeAvatarUrl(avatar, avatarVersion)} alt={username} />
												) : (
													<AvatarImage src="/data/avatars/default.png" alt={username || "User"} />
												)}
											</Avatar>
										</Button>
									</Link>
								</TooltipTrigger>
								<TooltipContent side="left">
									<p>Profile</p>
								</TooltipContent>
							</Tooltip>
						)}
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									onClick={toggleDock}
									className={cn(
										"rounded-full",
										"h-8 w-8 md:h-12 md:w-12"
									)}
								>
									{showDock ?
										<ChevronRight className="h-3.5 w-3.5 md:h-5 md:w-5" /> :
										<ChevronLeft className="h-3.5 w-3.5 md:h-5 md:w-5" />
									}
								</Button>
							</TooltipTrigger>
							<TooltipContent side="left">
								<p>Toggle Dock</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>
			{isSearchOpen && (
				<div className="fixed inset-0 bg-card/95 backdrop-blur-sm z-20 items-center justify-center animate-in fade-in-0 duration-200 flex">
					<div className="relative w-full max-w-xl mx-4 flex flex-col">
						<form onSubmit={handleSearch} className="relative w-full">
							<Input
								type="search"
								placeholder="Search users..."
								className="w-full pl-10 pr-12 py-2 h-12 rounded-full border-2 focus-visible:ring-primary text-center"
								value={searchQuery}
								onChange={handleSearchInputChange}
								autoFocus
							/>
							<div className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5">
								<Search className="h-5 w-5 text-muted-foreground" />
							</div>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={() => {
									setIsSearchOpen(false);
									setSearchQuery('');
									setSearchResults([]);
								}}
								className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full hover:bg-accent/50"
								aria-label="Close search"
							>
								<X className="h-4 w-4" />
							</Button>
						</form>

						{searchResults.length > 0 && (
							<div className="bg-card border border-border rounded-lg mt-4 max-h-80 overflow-y-auto">
								<div className="p-2 text-sm text-muted-foreground border-b border-border">
									Search Results
								</div>
								<div className="divide-y divide-border">
									{searchResults.map((user: EnhancedSearchUser) => (
										<div
											key={user.id}
											className="flex items-center gap-3 p-3 hover:bg-accent/50 cursor-pointer"
											onClick={() => handleUserClick(user.id)}
										>
											<Avatar className="h-8 w-8">
												{user.avatarUrl ? (
													<AvatarImage src={normalizeAvatarUrl(user.avatar, avatarVersion)} alt={username} />
												) : (
													<AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
												)}
											</Avatar>
											<div>
												<p className="font-medium">@{user.username}</p>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{searchQuery && !isSearching && searchResults.length === 0 && (
							<div className="bg-card border border-border rounded-lg mt-4 p-4 text-center text-muted-foreground">
								No users found
							</div>
						)}

						{isSearching && (
							<div className="bg-card border border-border rounded-lg mt-4 p-4 text-center">
								<div className="animate-pulse flex justify-center">
									<div className="h-6 w-24 bg-muted rounded"></div>
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</>
	)
}

function debounce<F extends (...args: any[]) => any>(func: F, wait: number) {
	let timeout: ReturnType<typeof setTimeout> | null = null;

	return function (...args: Parameters<F>) {
		if (timeout !== null) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(() => func(...args), wait);
	};
}

export default DashboardSidebar;
