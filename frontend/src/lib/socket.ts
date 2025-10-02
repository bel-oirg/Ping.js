import { io, Socket } from 'socket.io-client';
import { dashboardService } from '@/lib/api';
import { toast } from 'sonner';

let socket: Socket | null = null;
let isConnecting = false;

export type Notification = {
  id: string;
  type: number;
  sender: number;
  receiver: number;
  created_at: string;
  read: boolean;
  msg?: string;
}

export type OnlineUserData = {
  userId: string | number;
  username: string;
  avatar: string | null;
  status: 'online' | 'offline';
  timestamp: number;
  lastOnlineTime?: number;
}

const getUserProfileData = async () => {
  try {
    const storedProfile = localStorage.getItem('blackhole_user_profile');
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      return {
        id: profile.id,
        username: profile.username,
        avatar: profile.avatar
      };
    }
    
    const response = await dashboardService.getCard();
    if (response && response.data && response.data.User) {
      const user = response.data.User;
      const profileData = {
        id: user.id,
        username: user.username,
        avatar: user.avatar
      };
      localStorage.setItem('blackhole_user_profile', JSON.stringify(profileData));
      localStorage.setItem('user_id', user.id.toString());
      return profileData;
    }
  } catch (error) {
    toast.error('Error getting user profile');
  }
  return null;
};

const initializeSocketAsync = async (token: string): Promise<Socket> => {
  if (socket && socket.connected) {
    return socket;
  }
  
  if (isConnecting) {
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    if (socket) return socket;
  }
  
  isConnecting = true;
  
  try {
    const userData = await getUserProfileData();
    
    socket = io(process.env.NEXT_PUBLIC_GATEWAY_SOCKET_URL || 'https://blackholejs.art', {
      path: process.env.NEXT_PUBLIC_GATEWAY_SOCKET_PATH || '/gateway.socket',
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
      forceNew: true,
      auth: { 
        token,
        userData
      },
      transports: ['websocket', 'polling']
    });
    
    socket.on('connect', () => {
      isConnecting = false;
    });
    
    socket.on('disconnect', (reason) => {
      isConnecting = false;
    });
    
    socket.on('connect_error', (error) => {
      toast.error('Gateway socket connection error');
      socket?.disconnect();
      socket = null;
      isConnecting = false;
    });
    
    return socket;
  } catch (error) {
    toast.error('Socket initialization error');
    isConnecting = false;
    throw error;
  }
};

export const initializeSocket = initializeSocketAsync;

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  isConnecting = false;
};

export const markAllNotificationsAsRead = (): void => {
  if (socket) {
    socket.emit('notification:seen-all');
  }
}; 
