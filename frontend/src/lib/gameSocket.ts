import { io, Socket } from 'socket.io-client';
import { TokenManager } from '@/lib/api';
import { toast } from 'sonner';

let gameSocket: Socket | null = null;
let isConnecting = false;

const initializeGameSocketAsync = async (token: string): Promise<Socket> => {
  if (gameSocket && gameSocket.connected) {
    return gameSocket;
  }
  
  if (isConnecting) {
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    if (gameSocket) return gameSocket;
  }
  
  isConnecting = true;
  
  try {
    gameSocket = io("https://blackholejs.art/", {
      path: "/game.socket/",
      transports: ["websocket"],
      auth: { token },
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
      forceNew: true,
    });
    
    gameSocket.on('connect', () => {
      isConnecting = false;
    });
    
    gameSocket.on('disconnect', (reason) => {
      isConnecting = false;
    });
    
    gameSocket.on('connect_error', (error) => {
      toast.error('Game socket connection error');
      gameSocket?.disconnect();
      gameSocket = null;
      isConnecting = false;
    });
    
    return gameSocket;
  } catch (error) {
    toast.error('Game socket initialization error');
    isConnecting = false;
    throw error;
  }
};

export const initializeGameSocket = initializeGameSocketAsync;

export const getGameSocket = (): Socket | null => gameSocket;

export const disconnectGameSocket = (): void => {
  if (gameSocket) {
    gameSocket.disconnect();
    gameSocket = null;
  }
  isConnecting = false;
}; 