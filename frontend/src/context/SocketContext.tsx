'use client'

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
// Use triple-slash directive to reference the socket.io-client types
/// <reference types="socket.io-client" />
import type { Socket } from 'socket.io-client';
import type { Timeout } from 'node:timers';
import { initializeSocket, getSocket, disconnectSocket, markAllNotificationsAsRead, Notification, OnlineUserData } from '@/lib/socket';
import { initializeGameSocket, getGameSocket, disconnectGameSocket } from '@/lib/gameSocket';
import { useAuth } from './AuthContext';
import { TokenManager } from '@/lib/api/TokenManager';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import { onlineUsersStore } from '@/lib/onlineUsersStore';
import { dashboardService } from '@/lib/api';

export interface EnhancedNotification extends Omit<Notification, 'sender' | 'receiver'> {
	sender: {
		id: number;
		username?: string;
		avatar?: string;
		displayName?: string;
	};
	receiver: {
		id: number;
		username?: string;
		avatar?: string;
		displayName?: string;
	};
	created_at: string;
	read: boolean;
	msg?: string;
}

export interface UserStatus {
	userId: number;
	username: string;
	avatar: string | null;
	status: 'online' | 'offline';
	timestamp: number;
	isOnline?: boolean;
	lastOnlineTime?: number;
}

interface SocketContextType {
	socket: Socket | null;
	// gameSocket: Socket | null;
	notifications: EnhancedNotification[];
	markAllAsRead: () => void;
	friendshipUpdateCount: number;
	chatMessageCount: number;
	lastChatMessage: EnhancedNotification | null;
	currentUserId: number | null;
	onlineUsers: OnlineUserData[];
	refreshOnlineUsers?: () => void;
	chatMessageReceived: EnhancedNotification | null;
	setChatMessageReceived: (notification: EnhancedNotification | null) => void;
	setChatMessageCount: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
	const { isAuthenticated } = useAuth();
	const [notifications, setNotifications] = useState<EnhancedNotification[]>([]);
	const [friendshipUpdateCount, setFriendshipUpdateCount] = useState(0);
	const [chatMessageCount, setChatMessageCount] = useState(0);
	const [lastChatMessage, setLastChatMessage] = useState<EnhancedNotification | null>(null);
	const [currentUserId, setCurrentUserId] = useState<number | null>(null);
	const [onlineUsers, setOnlineUsers] = useState<OnlineUserData[]>([]);
	const router = useRouter();
	// Add forceUpdate mechanism for production builds
	const forceUpdateRef = useRef(0);
	const [forceUpdate, setForceUpdate] = useState(0);
	const refreshIntervalRef = useRef<Timeout | null>(null);
	const [chatMessageReceived, setChatMessageReceived] = useState<EnhancedNotification | null>(null);

	// Function to request online users list
	const refreshOnlineUsers = useCallback(() => {
		const socket = getSocket();
		if (socket && socket.connected) {
			socket.emit('users:online:get');
			// Force a re-render to ensure state updates are applied
			forceUpdateRef.current += 1;
			setForceUpdate(forceUpdateRef.current);
		}
	}, []);

	// Set up periodic refresh
	useEffect(() => {
		if (isAuthenticated) {
			refreshOnlineUsers();
			if (refreshIntervalRef.current) {
				clearInterval(refreshIntervalRef.current);
			}
			refreshIntervalRef.current = setInterval(refreshOnlineUsers, 30000);
			return () => {
				if (refreshIntervalRef.current) {
					clearInterval(refreshIntervalRef.current);
					refreshIntervalRef.current = null;
				}
			};
		}
	}, [isAuthenticated, refreshOnlineUsers]);

	useEffect(() => {
		if (notifications.length > 0) {
			const uniqueNotifications = notifications.filter(
				(notification: EnhancedNotification, index: number, self: EnhancedNotification[]) =>
					index === self.findIndex((n: EnhancedNotification) => n.id === notification.id)
			);
			if (uniqueNotifications.length !== notifications.length) {
				setNotifications(uniqueNotifications);
			}
		}
	}, [notifications]);
	useEffect(() => {
		const interval = setInterval(() => {
			forceUpdateRef.current += 1;
			setForceUpdate(forceUpdateRef.current);
		}, 5000);

		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		if (!isAuthenticated) return;

		const token = TokenManager.getToken();
		if (!token) return;

		const setupSocketListeners = async () => {
			try {
				const socket = await initializeSocket(token);
				await initializeGameSocket(token);
				socket.off('users:online');
				socket.off('user:status');
				socket.off('gateway:notification');
				const storedProfile = localStorage.getItem('blackhole_user_profile');
				if (storedProfile) {
					const profile = JSON.parse(storedProfile);
					setCurrentUserId(Number(profile.id));
				}
				socket.emit('users:online:get');
				socket.on('users:online', (data: { users: OnlineUserData[], timestamp: number }) => {
					if (data && Array.isArray(data.users)) {
						onlineUsersStore.setUsers(data.users);
						const updatedUsers = [...data.users];
						setOnlineUsers(updatedUsers);
						forceUpdateRef.current += 1;
						setForceUpdate(forceUpdateRef.current);
						setTimeout(() => {
							if (socket.connected) {
								socket.emit('users:online:get');
							}
						}, 30000);
					} else {
						toast.error('[SOCKET] Invalid users:online data received');
					}
				});
				socket.on('user:status', (data: UserStatus) => {
					if (!data || (!data.userId && data.userId !== 0)) return;
					const isOnline = data.status ? data.status === 'online' : data.isOnline;
					const status = data.status || (data.isOnline ? 'online' : 'offline');
					if (isOnline) {
						onlineUsersStore.addUser({
							userId: Number(data.userId),
							username: data.username || `User${data.userId}`,
							avatar: data.avatar || null,
							status: status,
							timestamp: data.timestamp || Date.now(),
							lastOnlineTime: data.lastOnlineTime
						});
					} else {
						if (data.lastOnlineTime) {
							const existingUser = onlineUsersStore.getUserById(Number(data.userId));
							if (existingUser) {
								onlineUsersStore.addUser({
									...existingUser,
									status: 'offline',
									lastOnlineTime: data.lastOnlineTime
								});
							}
						}
						onlineUsersStore.removeUser(Number(data.userId));
					}
					setOnlineUsers((prev: OnlineUserData[]) => {
						if (isOnline) {
							const userExists = prev.some((user: OnlineUserData) => Number(user.userId) === Number(data.userId));
							if (!userExists) {
								const newUser = {
									userId: Number(data.userId),
									username: data.username || `User${data.userId}`,
									avatar: data.avatar || null,
									status: status,
									timestamp: data.timestamp || Date.now(),
									lastOnlineTime: data.lastOnlineTime
								};
								forceUpdateRef.current += 1;
								setForceUpdate(forceUpdateRef.current);
								return [...prev, newUser];
							} else {
								forceUpdateRef.current += 1;
								setForceUpdate(forceUpdateRef.current);
								return prev.map((user: OnlineUserData) =>
									Number(user.userId) === Number(data.userId)
										? {
											...user,
											username: data.username || user.username,
											avatar: data.avatar !== undefined ? data.avatar : user.avatar,
											timestamp: data.timestamp || Date.now(),
											status: status,
											lastOnlineTime: data.lastOnlineTime
										}
										: user
								);
							}
						} else {
							forceUpdateRef.current += 1;
							setForceUpdate(forceUpdateRef.current);
							return prev.filter((user: OnlineUserData) => Number(user.userId) !== Number(data.userId));
						}
					});
				});
				socket.on('gateway:notification', async (payload: any) => {
					const notificationsArray = Array.isArray(payload) ? payload : [payload];
					let added = false;
					for (const notification of notificationsArray) {
						switch (notification.type) {
							case 1:
							case 2: {
								let senderUsername = ''
								let receivedUsername = ''
								if (notification.sender.id) {
									try {
										const cardRes = await dashboardService.getCard(notification.sender.id.toString());
										if (cardRes.status.success && cardRes.data && cardRes.data.User && cardRes.data.User.username) {
											senderUsername = cardRes.data.User.username;
										}
										const cardRev = await dashboardService.getCard(notification.receiver.id.toString());
										if (cardRev.status.success && cardRev.data && cardRev.data.User && cardRev.data.User.username) {
											receivedUsername = cardRev.data.User.username;
										}
									} catch {}
								}
								const enhancedNotification: EnhancedNotification = {
									...notification,
									sender: {
										id: Number(notification.sender.id ?? notification.sender),
										username: senderUsername,
										avatar: notification.sender.avatar,
										displayName: senderUsername,
									},
									receiver: {
										id: Number(notification.receiver.id ?? notification.receiver),
										username: receivedUsername,
										avatar: notification.receiver.avatar,
										displayName: receivedUsername,
									},
								};
								setNotifications((prevNotifications: EnhancedNotification[]) => {
									const notificationExists = prevNotifications.some(
										(existingNotif: EnhancedNotification) => existingNotif.id === enhancedNotification.id
									);
									if (!notificationExists) {
										added = true;
										return [enhancedNotification, ...prevNotifications];
									}
									return prevNotifications;
								});
								setFriendshipUpdateCount((count: number) => count + 1);
								added = true;
								break;
							}
							case 3:
								setFriendshipUpdateCount((count: number) => count + 1);
								added = true;
								break;
							case 4:
								console.log('[DEBUG] [SocketContext] Received message notification:', notification);
								setLastChatMessage(notification);
								console.log('[DEBUG] [SocketContext] Called setLastChatMessage');
								setChatMessageCount((count: number) => {
									const newCount = count + 1;
									console.log('[DEBUG] [SocketContext] Called setChatMessageCount, new count:', newCount);
									return newCount;
								});
								added = true;
								break;
						}
					}
					if (added) {
						forceUpdateRef.current += 1;
						setForceUpdate(forceUpdateRef.current);
					}
				});
			} catch (error) {
				toast.error('Error initializing sockets');
			}
		};

		setupSocketListeners();
		const handleBeforeUnload = () => {
			disconnectSocket();
			disconnectGameSocket();
		};
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'hidden') return;
			if (document.visibilityState === 'visible' && isAuthenticated) {
				const token = TokenManager.getToken();
				if (!token) return;

				const socket = getSocket();
				const gameSocket = getGameSocket();

				if (!socket || !socket.connected) {
					setTimeout(async () => {
						try {
							await setupSocketListeners(); // <-- Attach listeners after re-init
							refreshOnlineUsers();
						} catch (error) {
							toast.error('Error reconnecting socket');
						}
					}, 100);
				} else {
					refreshOnlineUsers();
				}

				if (!gameSocket || !gameSocket.connected) {
					setTimeout(async () => {
						try {
							await initializeGameSocket(token);
						} catch (error) {
							toast.error('Error reconnecting game socket');
						}
					}, 100);
				}
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);
		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
			document.removeEventListener('visibilitychange', handleVisibilityChange);

			if (!isAuthenticated) {
				disconnectSocket();
				disconnectGameSocket();
			}
		};
	}, [isAuthenticated, router, refreshOnlineUsers]);

	useEffect(() => {
		const socket = getSocket();
		if (!socket) return;
		const handleNewMsg = (msg: any) => {
			console.log('[DEBUG] [SocketContext] Received gateway:newMsg:', msg);
			// Get the current active conversation from the chat state (if possible)
			// This requires a callback or event to the chat logic; here we use a custom event
			const event = new CustomEvent('chat:newMsg', { detail: msg });
			window.dispatchEvent(event);
		};
		socket.on('gateway:newMsg', handleNewMsg);
		return () => {
			socket.off('gateway:newMsg', handleNewMsg);
		};
	}, []);

	const markAllAsRead = () => {
		markAllNotificationsAsRead();
		setNotifications((prevNotifications: EnhancedNotification[]) =>
			prevNotifications.map((notif: EnhancedNotification) => ({ ...notif, read: true }))
		);
	};

	const value = {
		socket: getSocket(),
		gameSocket: getGameSocket(),
		notifications,
		markAllAsRead,
		friendshipUpdateCount,
		chatMessageCount,
		lastChatMessage,
		currentUserId,
		onlineUsers,
		refreshOnlineUsers,
		chatMessageReceived,
		setChatMessageReceived,
		setChatMessageCount
	};

	return (
		<SocketContext.Provider value={value}>
			{children}
		</SocketContext.Provider>
	);
}

export function useSocket(): SocketContextType {
	const context = useContext(SocketContext);
	if (context === undefined) {
		throw new Error('useSocket must be used within a SocketProvider');
	}
	return context;
} 