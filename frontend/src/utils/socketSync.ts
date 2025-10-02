/**
 * Utility functions to ensure socket data is properly synced with the UI
 */

import { useEffect, useState } from 'react';
import { useSocket } from '@/context/SocketContext';

/**
 * Ensures that the provided data is always up-to-date with socket events
 * This is especially important in production builds where React's state updates
 * might not trigger re-renders as expected
 * 
 * @param dataFn A function that returns the data to keep in sync
 * @param dependencies Dependencies array for the useEffect hook
 * @returns The synchronized data
 */
export function useSyncedSocketData<T>(dataFn: () => T, dependencies: any[] = []): T {
  const [data, setData] = useState<T>(dataFn());
  const { socket } = useSocket();
  
  useEffect(() => {
    // Initial update
    setData(dataFn());
    
    // Update on socket events
    const updateData = () => {
      setData(dataFn());
    };
    
    if (socket) {
      // Listen for common socket events that might update data
      socket.on('users:online', updateData);
      socket.on('user:status', updateData);
      socket.on('gateway:notification', updateData);
      socket.on('friendship:update', updateData);
      // socket.on('chat:message', updateData);
    }
    
    // Set up interval to periodically check for updates
    const interval = setInterval(updateData, 2000);
    
    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off('users:online', updateData);
        socket.off('user:status', updateData);
        socket.off('gateway:notification', updateData);
        socket.off('friendship:update', updateData);
        // socket.off('chat:message', updateData);
      }
    };
  }, [socket, ...dependencies]);
  
  return data;
}

/**
 * Ensures that React components re-render when socket events occur
 * This is a simpler version of useSyncedSocketData that doesn't return any data
 * 
 * @param dependencies Dependencies array for the useEffect hook
 */
export function useSocketSync(dependencies: any[] = []): void {
  const [, setTick] = useState(0);
  const { socket } = useSocket();
  
  useEffect(() => {
    // Force re-render on socket events
    const forceUpdate = () => {
      setTick(tick => tick + 1);
    };
    
    if (socket) {
      // Listen for common socket events
      socket.on('users:online', forceUpdate);
      socket.on('user:status', forceUpdate);
      socket.on('gateway:notification', forceUpdate);
      socket.on('friendship:update', forceUpdate);
      // socket.on('chat:message', forceUpdate);
    }
    
    // Set up interval to periodically force updates
    const interval = setInterval(forceUpdate, 2000);
    
    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off('users:online', forceUpdate);
        socket.off('user:status', forceUpdate);
        socket.off('gateway:notification', forceUpdate);
        socket.off('friendship:update', forceUpdate);
        // socket.off('chat:message', forceUpdate);
      }
    };
  }, [socket, ...dependencies]);
} 