'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
	Users,
	Award,
	Star,
	Loader2,
	CircleDot
} from "lucide-react"
import Image from 'next/image'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { dashboardService } from '@/lib/api'
import { handleApiError } from '@/utils/errorHandler'
import { UserCard, FriendshipStatus } from '@/types/Dashboard'
import { FriendActions } from './friends/Actions'
import { useSocket } from '@/context/SocketContext'
import { useOnlineUsers } from '@/hooks/useOnlineUsers'
import { Badge } from '@/components/ui/badge'
import { AvatarUpload } from './AvatarUpload'
import { storeProfileData } from '@/utils/profileStorage'
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import en from '@/i18n/en'
import fr from '@/i18n/fr'
import { useLang } from '@/context/langContext'
import MiniHistory from '@/components/dashboard/miniHistory'
import { useSocketSync } from '@/utils/socketSync';

const AVATAR_CACHE_BUSTER_KEY = 'avatarCacheBuster';
const AVATAR_VERSION_KEY = 'avatarVersion';

export const normalizeAvatarUrl = (url?: string, version?: number, extraCacheBuster?: number | null) => {
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
	  if (shouldNormalize && (version || extraCacheBuster)) {
		const cb = extraCacheBuster || version;
		return `${newUrl}?cb=${cb}`;
	  }
	  return newUrl;
	}
	return url;
};

export function ProfileComponent({ userId }: { userId?: string }) {
	useSocketSync();
	const [profileData, setProfileData] = useState<UserCard | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("profile");
	const { friendshipUpdateCount, currentUserId } = useSocket();
	const { isUserOnline, onlineUsers } = useOnlineUsers();
	const fetchingRef = useRef<boolean>(false);
	const [isUserOnlineState, setIsUserOnlineState] = useState(false);
	const router = useRouter();
	const { lang } = useLang()
	const t = lang === 'en' ? en.profile : fr.profile
	const [cacheBuster, setCacheBuster] = useState<number | null>(() => {
		if (typeof window !== 'undefined') {
			const stored = localStorage.getItem(AVATAR_CACHE_BUSTER_KEY);
			return stored ? Number(stored) : null;
		}
		return null;
	});

	const fetchProfileData = async (skipLoading = false) => {
		if (fetchingRef.current) {
			return;
		}

		fetchingRef.current = true;

		if (!skipLoading) {
			setIsLoading(true);
		}
		setError(null);

		try {
			const response = await dashboardService.getCard(userId);

			if (!response.status.success || !response.data) {
				throw new Error(response.status.message);
			}
			setProfileData({
				...response.data,
				Friends: response.data.Friends.filter(Boolean)
			});

			// Compare backend avatar_version to last uploaded version
			if (typeof window !== 'undefined') {
				const lastUploadedVersion = localStorage.getItem(AVATAR_VERSION_KEY);
				const backendVersion = response.data?.User?.avatar_version?.toString();
				if (backendVersion && lastUploadedVersion && backendVersion !== lastUploadedVersion) {
					localStorage.removeItem(AVATAR_CACHE_BUSTER_KEY);
					localStorage.removeItem(AVATAR_VERSION_KEY);
					setCacheBuster(null);
				} else if (backendVersion && lastUploadedVersion && backendVersion === lastUploadedVersion) {
					const storedBuster = localStorage.getItem(AVATAR_CACHE_BUSTER_KEY);
					setCacheBuster(storedBuster ? Number(storedBuster) : null);
				}
			}
		} catch (err) {
			const errorMessage = handleApiError(err, 'Profile');
			setError(errorMessage);
			toast.error('Profile error');
		} finally {
			if (!skipLoading) {
				setIsLoading(false);
			}
			fetchingRef.current = false;
		}
	};

	useEffect(() => {
		if (userId) {
			fetchProfileData(true);
		}
	}, [userId, friendshipUpdateCount]);

	useEffect(() => {
		if (profileData?.User?.id) {
			setIsUserOnlineState(isUserOnline(profileData.User.id));
		}
	}, [onlineUsers, profileData?.User?.id, isUserOnline]);

	useEffect(() => {
		const handleProfileUpdated = () => {
			fetchProfileData(true);
		};
		window.addEventListener('profile-updated', handleProfileUpdated);
		return () => window.removeEventListener('profile-updated', handleProfileUpdated);
	}, [userId]);

	if (isLoading && !profileData) {
		return (
			<div className="flex justify-center items-center h-64">
				<Loader2 className="h-12 w-12 animate-spin text-primary" />
			</div>
		);
	}

	if (error || !profileData) {
		return (
			<div className="bg-destructive/10 border border-destructive rounded-xl p-4 text-destructive">
				{error || t.failedToLoadProfile}
			</div>
		);
	}

	const { User: UserInfo, Level, Rank, is_self, Friendship } = profileData;
	const isOnline = isUserOnlineState;

	const friendshipValue = Number(Friendship);
	const isRequestSent = friendshipValue === -3;

	const displayName = UserInfo.first_name && UserInfo.last_name
		? `${UserInfo.first_name} ${UserInfo.last_name}`
		: UserInfo.username;

	const expProgress = Level ?
		((UserInfo.exp - Level.min_exp) / (Level.max_exp - Level.min_exp)) * 100 : 0;

	const getNextRankName = (currentRank: string): string => {
		const ranks = ['Iron', 'Bronze', 'Silver', 'Gold', 'Mythic'];
		const currentIndex = ranks.findIndex(rank => rank === currentRank);
		if (currentIndex === -1 || currentIndex === ranks.length - 1) {
			return currentRank;
		}
		return ranks[currentIndex + 1];
	};

	const nextRank = getNextRankName(Rank.name);
	const rankProgress = ((UserInfo.exp - Rank.min_exp) / (Rank.max_exp - Rank.min_exp)) * 100;

	const validFriends = profileData.Friends.filter(friend => friend !== undefined);

	
	return (
		<div className="container mx-auto w-full space-y-6 mt-16 items-center justify-center">
			<div className="relative w-full h-48 md:h-64 rounded-t-xl overflow-hidden">
				{UserInfo.background ? (
					<Image
						src={UserInfo.background}
						alt="Profile background"
						fill
						sizes="100vw"
						style={{ objectFit: 'cover' }}
						priority
					/>
				) : (
					<Image
						src="/data/backgrounds/default.png"
						alt="Default background"
						fill
						sizes="100vw"
						style={{ objectFit: 'cover' }}
						priority
					/>
				)}
				<div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/70" />
			</div>

			<Card className="relative -mt-16 mx-4 z-10 border-border/40 bg-card/80 backdrop-blur-sm">
				<CardHeader className="flex flex-col md:flex-row md:items-center gap-4">
					{is_self ? (
						<AvatarUpload
							currentAvatar={normalizeAvatarUrl(UserInfo.avatar, cacheBuster || UserInfo.avatar_version)}
							username={UserInfo.username}
							onAvatarUpdated={(newAvatarUrl: string) => {
								if (profileData && profileData.User) {
									let normalizedUrl = newAvatarUrl;
									if (typeof normalizedUrl === 'string') {
										if (normalizedUrl.includes('/dash/media/avatarUpload')) {
											normalizedUrl = normalizedUrl.replace('/dash/media/avatarUpload', 'https://blackholejs.art/avatars');
										} else if (normalizedUrl.includes('/media/avatarUpload')) {
											normalizedUrl = normalizedUrl.replace('/media/avatarUpload', 'https://blackholejs.art/avatars');
										}
									}
									const now = Date.now();
									const updatedProfile = {
										...profileData,
										User: {
											...profileData.User,
											avatar: normalizedUrl,
											avatar_version: now,
										},
									};
									setProfileData(updatedProfile);
									storeProfileData(updatedProfile);
									setCacheBuster(now);
									if (typeof window !== 'undefined') {
										localStorage.setItem(AVATAR_CACHE_BUSTER_KEY, now.toString());
										localStorage.setItem(AVATAR_VERSION_KEY, now.toString());
									}
									router.refresh();
								}
							}}
							size="lg"
						/>
					) : (
						<Avatar className="h-24 w-24 border-4 border-background">
							{UserInfo.avatar ? (
								<AvatarImage src={normalizeAvatarUrl(UserInfo.avatar, UserInfo.avatar_version)} />
							) : (
								<AvatarImage src="/data/avatars/default.png" alt={UserInfo.username} />
							)}
						</Avatar>
					)}

					<div className="flex-1">
						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
							<div>
								<div className="flex items-center gap-2">
									<CardTitle className="text-2xl">{displayName}</CardTitle>
									<Badge variant={isOnline ? "success" : "error"} className="text-xs">
										{isOnline ? (
											<span className="flex items-center gap-1">
												<CircleDot className="h-3 w-3" /> Online
											</span>
										) : (
											"Offline"
										)}
									</Badge>
								</div>
								<CardDescription>@{UserInfo.username}</CardDescription>
							</div>

							{!is_self && (
								<div className="flex gap-2">
									<FriendActions
										userId={UserInfo.id}
										username={UserInfo.username}
										friendshipStatus={Friendship}
										showMessage={Friendship === FriendshipStatus.I_FR || Friendship === FriendshipStatus.HE_FR}
										onActionComplete={async () => {
											fetchProfileData(true);
											return Promise.resolve();
										}}
									/>
								</div>
							)}
						</div>

						{UserInfo.bio && (
							<p className="mt-2 text-sm text-muted-foreground">{t.bio}: {UserInfo.bio}</p>
						)}
					</div>
				</CardHeader>

				<CardContent>
					<Tabs defaultValue="profile" className="w-full" onValueChange={setActiveTab} value={activeTab}>
						{!is_self && (
							<TabsList className="mb-4">
								<TabsTrigger value="profile">{t.profile}</TabsTrigger>
								<TabsTrigger value="matches">{t.matches}</TabsTrigger>
							</TabsList>
						)}

						<TabsContent value="profile">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
								<Card>
									<CardHeader className="pb-2">
										<CardTitle className="text-sm flex items-center gap-2">
											<Star className="h-4 w-4 text-primary" />
											{t.level} {UserInfo.level}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-2">
											<div className="flex justify-between text-xs">
												<span>{Level.min_exp} XP</span>
												<span>{UserInfo.exp} / {Level.max_exp} XP</span>
											</div>
											<Progress value={expProgress} className="h-2" />
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader className="pb-2">
										<CardTitle className="text-sm flex items-center gap-2">
											<Award className="h-4 w-4 text-primary" />
											{t.rank}
										</CardTitle>
									</CardHeader>
									<CardContent className="flex items-center gap-3">
										{Rank.icon_path && (
											<div className="h-10 w-10 relative">
												<Image
													src={`/data/ranks/${Rank.name}.svg`}
													alt={Rank.name}
													width={40}
													height={40}
													className="object-contain"
													priority
												/>
											</div>
										)}
										<div>
											<div className="font-semibold">{Rank.name}</div>
											<div className="text-xs text-muted-foreground">
												{Rank.min_exp} - {Rank.max_exp} XP
											</div>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader className="pb-2">
										<CardTitle className="text-sm flex items-center gap-2">
											<Users className="h-4 w-4 text-primary" />
											{t.friends}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">{validFriends.length}</div>
										{/* {validFriends.length > 0 && (
											<Button
												variant="link"
												className="p-0 h-auto"
												asChild
											>
												<Link href="/dashboard/friends">{t.viewAllFriends}</Link>
											</Button>
										)} */}
									</CardContent>
								</Card>
							</div>

							<Card className="mt-8">
								<CardHeader>
									<CardTitle className="text-lg flex items-center gap-2">
										<Award className="h-5 w-5 text-primary" />
										{t.rankProgress}
									</CardTitle>
									<CardDescription>
										Progress towards {nextRank} rank
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="flex justify-between text-sm">
											<span className="font-medium">{Rank.name}</span>
											<span className="font-medium">{nextRank}</span>
										</div>
										<Progress value={rankProgress} className="h-2" />
										<div className="text-center text-sm text-muted-foreground">
											{Math.round(rankProgress)}% complete - {UserInfo.exp} / {Rank.max_exp} XP
										</div>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="friends">
							<Card>
								<CardHeader>
									<CardTitle>{t.friends}</CardTitle>
									<CardDescription>
										{t.friendsListEmpty}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="text-center py-8 text-muted-foreground">
										{t.friendsListEmpty}
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="matches">
							<Card>
								<CardHeader>
									<CardTitle>{t.matchHistory}</CardTitle>
									<CardDescription>
										{t.matchHistoryEmpty}
									</CardDescription>
								</CardHeader>
								<CardContent>
									{/* profileData?.User?.id */}
									<MiniHistory id={profileData?.User?.id} />
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div >
	);
}
