import { useOnlineUsers } from '@/hooks/useOnlineUsers'
import { UserInfo } from './friends/UserInfo'
import { FriendshipStatus } from '@/types/Dashboard'
import { FriendData } from '@/types/friends'
import { Card, CardContent } from '@/components/ui/card'
import { OnlineUserData } from '@/lib/socket'
import { cn } from '@/utils/index'
import { toast } from 'sonner'

export interface OnlineUsersProps {
	maxDisplay?: number
	showCount?: boolean
	title?: string
	className?: string
	showUpdateIndicator?: boolean
	scrollable?: boolean
	maxHeight?: string
	reserveSpace?: boolean
}

export function OnlineUsers({
	maxDisplay = 3,
	showCount = false,
	title = 'Online Users',
	className = '',
	showUpdateIndicator = true,
	scrollable = false,
	maxHeight = '300px',
	reserveSpace = false
}: OnlineUsersProps) {
	const {
		onlineUsers,
		onlineCount,
		lastUpdated
	} = useOnlineUsers()

	const displayUsers: FriendData[] = onlineUsers
		.slice(0, scrollable ? undefined : maxDisplay)
		.map((user: OnlineUserData) => ({
			id: Number(user.userId),
			username: user.username || 'User',
			first_name: '',
			last_name: '',
			avatar: user.avatar,
			is_online: true,
			friendship_status: FriendshipStatus.NONE
		}))
		.filter((user, index, self) =>
			index === self.findIndex((u) => u.id === user.id)
		);

	const emptySpacesNeeded = reserveSpace ? Math.max(0, maxDisplay - displayUsers.length) : 0;
	const emptySpaces = Array(emptySpacesNeeded).fill(null);

	return (
		<Card className={className}>
			<CardContent>
				{displayUsers.length > 0 || reserveSpace ? (
					<div className={cn(
						"space-y-4", 
						scrollable && "overflow-y-auto pr-2",
						scrollable && `max-h-[${maxHeight}]`
					)}>
						{displayUsers.map((user, index) => (
							<div
								key={`${user.id}-${user.username}-${index}`}
								className="transition-all duration-300"
							>
								<UserInfo
									user={user}
									useRealTimeStatus={false}
								/>
							</div>
						))}
						
						{/* Empty spaces to reserve space */}
						{emptySpaces.map((_, index) => (
							<div key={`empty-space-${index}`} className="h-[60px]" />
						))}
						
						{!scrollable && !reserveSpace && onlineCount > maxDisplay && (
							<div className="text-sm text-muted-foreground pt-2">
								And {onlineCount - maxDisplay} more...
							</div>
						)}
					</div>
				) : (
					<div className="text-sm text-muted-foreground">No users online</div>
				)}
			</CardContent>
		</Card >
	)
} 