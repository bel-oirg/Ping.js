import { useState, useEffect } from 'react';
import { onlineUsersStore } from '@/lib/onlineUsersStore';
import { OnlineUserData } from '@/lib/socket';

export interface UseGlobalOnlineUsersResult {
  onlineUsers: OnlineUserData[];
  onlineCount: number;
  isUserOnline: (userId: number) => boolean;
}

export function useGlobalOnlineUsers(): UseGlobalOnlineUsersResult {
  const [users, setUsers] = useState<OnlineUserData[]>(onlineUsersStore.getUsers());
  
  useEffect(() => {
    const unsubscribe = onlineUsersStore.subscribe(() => {
      setUsers(onlineUsersStore.getUsers());
    });
    
    return unsubscribe;
  }, []);
  
  return {
    onlineUsers: users,
    onlineCount: users.length,
    isUserOnline: (userId: number) => onlineUsersStore.isUserOnline(userId)
  };
} 