'use client'

import { useSocket } from '@/context/SocketContext'
import { EnhancedNotification } from '@/context/SocketContext'
import { formatDistanceToNow } from 'date-fns'
import { Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from './button'
import Link from 'next/link'
import { dashboardService } from '@/lib/api';
// import {dashboard}

export function NotificationCenter() {
  const { notifications, markAllAsRead, socket } = useSocket()
  const [unreadCount, setUnreadCount] = useState(0)
  const [filteredNotifications, setFilteredNotifications] = useState<EnhancedNotification[]>([])
  const [usernames, setUsernames] = useState<Record<number, string>>({})

  useEffect(() => {
    // Filter notifications and ensure uniqueness by ID
    const uniqueNotifications = notifications
      .filter(n => n.type === 1 || n.type === 2)
      .filter((notification, index, self) => 
        index === self.findIndex(n => n.id === notification.id)
      );
    setFilteredNotifications(uniqueNotifications);
    setUnreadCount(uniqueNotifications.filter(n => !n.read).length);
  }, [notifications])

  useEffect(() => {
    // Fetch usernames for notifications that don't have them
    const missing = filteredNotifications.filter(n => !n.sender.username && !usernames[n.sender.id]);
    if (missing.length === 0) return;
    missing.forEach(async (notif) => {
      try {
        const res = await dashboardService.getCard(notif.sender.id.toString());
        if (res.status.success && res.data && res.data.User && res.data.User.username) {
          setUsernames(prev => ({ ...prev, [notif.sender.id]: res.data.User.username }));
        }
      } catch {}
    });
  }, [filteredNotifications, usernames])

  const handleOpenChange = (open: boolean) => {
    if (open && unreadCount > 0) {
      if (socket) {
        socket.emit('notification:seen-all');
      }
      markAllAsRead()
    }
  }

  // const getUsername = (userId) => {

  // }

  const getNotificationMessage = (notification: EnhancedNotification) => {
    switch (notification.type) {
      case 1:
        return 'sent you a friend request'
      case 2:
        return 'accepted your friend request'
      default:
        return ''
    }
  }

  const getNotificationLink = (notification: EnhancedNotification) => {
    switch (notification.type) {
      case 1:
      case 2:
        return `/dashboard/profile?id=${notification.sender.id}`
      default:
        return '#'
    }
  }

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-[10px] flex items-center justify-center text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[70vh] overflow-y-auto">
        <div className="p-2">
          <h3 className="text-sm font-medium mb-1">Notifications</h3>
          {filteredNotifications.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No notifications</p>
          ) : (
            <div className="space-y-1">
              {filteredNotifications.map((notification: EnhancedNotification) => (
                <Link 
                  href={getNotificationLink(notification)}
                  key={`notif-${notification.id}`} 
                  className="block p-2 text-xs rounded-md hover:bg-accent"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium">
                          {notification.sender.username || usernames[notification.sender.id] || `User #${notification.sender.id}`}
                        </span>
                        <span className="text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <span>{getNotificationMessage(notification)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 