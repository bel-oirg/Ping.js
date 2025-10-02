/**
 * Friends component Card 
 */

'use client'

import { useState, useEffect } from 'react'
import {
	Card,
	CardContent,
	CardTitle
} from "@/components/ui/card"
import {
	Users,
	ChevronDown
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useFriends } from '@/hooks/useFriends'
import { FriendsList } from './All'
import { FriendRequestsList } from './Received'
import { SentRequestsList } from './Response'
import { BlockedUsersList } from './Blocked'
import { useSocket } from '@/context/SocketContext'
import { useLang } from '@/context/langContext'
import enFriends from '@/i18n/en/friends'
import frFriends from '@/i18n/fr/friends'

export function FriendsComponent() {
	const [activeTab, setActiveTab] = useState("friends")
	const [isMobile, setIsMobile] = useState(false)
	const { friendshipUpdated } = useSocket()
	const { lang } = useLang();
	const t = lang === 'en' ? enFriends : frFriends;

	const {
		isLoading,
		friends,
		receivedRequests,
		sentRequests,
		blockedUsers,
		acceptFriendRequest,
		rejectFriendRequest,
		cancelFriendRequest,
		removeFriend,
		blockUser,
		unblockUser
	} = useFriends()

	useEffect(() => {
		const checkIfMobile = () => {
			setIsMobile(window.innerWidth < 640)
		}
		checkIfMobile()
		window.addEventListener('resize', checkIfMobile)
		return () => window.removeEventListener('resize', checkIfMobile)
	}, [])

	// Update the active tab when receiving a friend request
	useEffect(() => {
		if (friendshipUpdated && receivedRequests.length > 0) {
			setActiveTab("received")
		}
	}, [friendshipUpdated, receivedRequests.length])

	const tabOptions = {
		friends: t.friends,
		received: t.received,
		sent: t.sent,
		blocked: t.blocked
	}

	const handleTabChange = (value: string) => {
		setActiveTab(value);
	}

	const renderActiveTabContent = () => {
		switch (activeTab) {
			case "friends":
				return (
					<FriendsList
						friends={friends}
						onRemove={removeFriend}
						onBlock={blockUser}
						isLoading={isLoading}
					/>
				);
			case "received":
				return (
					<FriendRequestsList
						requests={receivedRequests}
						onAccept={acceptFriendRequest}
						onReject={rejectFriendRequest}
						onBlock={blockUser}
						isLoading={isLoading}
					/>
				);
			case "sent":
				return (
					<SentRequestsList
						requests={sentRequests}
						onCancel={cancelFriendRequest}
						isLoading={isLoading}
					/>
				);
			case "blocked":
				return (
					<BlockedUsersList
						users={blockedUsers}
						onUnblock={unblockUser}
						isLoading={isLoading}
					/>
				);
			default:
				return null;
		}
	}

	return (
		<div className="container mx-auto item-center justify-center w-full h-full p-4 sm:p-6">
		{/* <div className="flex justify-between items-center mb-8"> */}
		  {/* <Wallet budget={budget} /> */}
		{/* </div> */}
		{/* <div className="relative mt-8 mx-auto w-full h-full"> */}
				<div className="flex items-center justify-between mb-6 gap-4">
		  			<h2 className="text-2xl font-bold">{t.friendsManagement}</h2>
					{/* <CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5 text-primary" />
						Friends Management
					</CardTitle> */}

					{isMobile ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" className="flex items-center justify-between">
									{tabOptions[activeTab as keyof typeof tabOptions]}
									<ChevronDown className="ml-2 h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={() => handleTabChange("friends")}>{t.friends}</DropdownMenuItem>
								<DropdownMenuItem onClick={() => handleTabChange("received")}>{t.received}</DropdownMenuItem>
								<DropdownMenuItem onClick={() => handleTabChange("sent")}>{t.sent}</DropdownMenuItem>
								<DropdownMenuItem onClick={() => handleTabChange("blocked")}>{t.blocked}</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<Tabs value={activeTab} onValueChange={handleTabChange}>
							<TabsList className="bg-secondary">
								<TabsTrigger value="friends">{t.friends}</TabsTrigger>
								<TabsTrigger value="received">{t.received}</TabsTrigger>
								<TabsTrigger value="sent">{t.sent}</TabsTrigger>
								<TabsTrigger value="blocked">{t.blocked}</TabsTrigger>
							</TabsList>
						</Tabs>
					)}
				</div>
			{/* <Card className="w-full h-full p-4 sm:p-6 "> */}

				<CardContent className="p-0">
					{isMobile ? (
						<div className="pt-2">
							{renderActiveTabContent()}
						</div>
					) : (
						<Tabs value={activeTab} onValueChange={handleTabChange}>
							<TabsContent value="friends">
								<FriendsList
									friends={friends}
									onRemove={removeFriend}
									onBlock={blockUser}
									isLoading={isLoading}
								/>
							</TabsContent>

							<TabsContent value="received">
								<FriendRequestsList
									requests={receivedRequests}
									onAccept={acceptFriendRequest}
									onReject={rejectFriendRequest}
									onBlock={blockUser}
									isLoading={isLoading}
								/>
							</TabsContent>

							<TabsContent value="sent">
								<SentRequestsList
									requests={sentRequests}
									onCancel={cancelFriendRequest}
									isLoading={isLoading}
								/>
							</TabsContent>

							<TabsContent value="blocked">
								<BlockedUsersList
									users={blockedUsers}
									onUnblock={unblockUser}
									isLoading={isLoading}
								/>
							</TabsContent>
						</Tabs>
					)}
				</CardContent>
			{/* </Card> */}
		</div>
	)
}

