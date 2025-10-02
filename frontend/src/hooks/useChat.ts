import React, { useState, useEffect, useCallback, useRef } from 'react';
import { chatService } from '@/lib/api';
import { Conversation, Message, ChatState } from '@/types/Chat';
import { useSocket } from '@/context/SocketContext';
import { useSocketSync } from '@/utils/socketSync';
import { toast } from 'sonner';

// Helper function to get stored profile
const getStoredProfile = () => {
  try {
    const storedProfile = localStorage.getItem('blackhole_user_profile');
    if (storedProfile) {
      return JSON.parse(storedProfile);
    }
  } catch (error) {
    toast.error('Error parsing stored profile');
  }
  return null;
};

// Helper function to get current user ID from URL path
const getCurrentUserIdFromPath = () => {
  if (typeof window === 'undefined') return null;
  const url = new URL(window.location.href);
  const userId = url.searchParams.get('userId');
  return userId ? parseInt(userId, 10) : null;
};

export function useChat() {
  const [state, setState] = useState<ChatState>({
    conversations: [],
    activeConversation: null,
    messages: [],
    isLoading: false,
    error: null
  });
  
  // @ts-ignore
  const { chatMessageReceived, setChatMessageReceived, socket } = useSocket();
  const myIdRef = useRef<number | null>(null);  
  useSocketSync([chatMessageReceived]);
  const fetchConversations = useCallback(async () => {
    setState((prev: ChatState) => ({ ...prev, isLoading: true }));
    
    try {
      const response = await chatService.getConversations();
      if (response.status.success && response.data) {
        setState((prev: ChatState) => ({
          ...prev,
          conversations: (response.data ?? []).map((conv: Conversation) => ({
            id: conv.id,
            username: conv.username || '',
            first_name: conv.first_name || '',
            last_name: conv.last_name || '',
            avatar: (conv.avatar?.startsWith('/dash/media') ? conv.avatar.replace('/dash/media', '/media') : conv.avatar || '/data/avatars/default.png'),
            last_message: conv.last_message || '',
            is_online: conv.is_online || false
          })),
          isLoading: false
        }));
      }
    } catch (error) {
      setState((prev: ChatState) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const fetchMessages = useCallback(async (userId: number) => {
    setState((prev: ChatState) => ({ ...prev, isLoading: true, activeConversation: userId }));
    
    try {
      const response = await chatService.getMessages(userId);
      if (response.status.success && response.data) {
        setState((prev: ChatState) => ({
          ...prev,
          messages: (response.data ?? []).map((msg: Message) => ({
            sender: msg.sender,
            data: msg.data,
            created_at: msg.created_at
          })),
          isLoading: false
        }));
      }
    } catch (error) {
      setState((prev: ChatState) => ({ ...prev, isLoading: false }));
    }
  }, []);
  
  const sendMessage = useCallback(async (message: string) => {
    if (!state.activeConversation) return;
    if (!socket || !socket.connected) {
      toast.error('Not connected to chat server.');
      return;
    }
    const profile = getStoredProfile();
    if (!profile || !profile.id) {
      toast.error('User profile not found.');
      return;
    }
    const msgPayload = {
      sender: profile.id,
      receiver: state.activeConversation,
      msg: message,
      created_at: new Date().toISOString()
    };
    // Optimistically append the message to the local state
    setState((prev: ChatState) => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          sender: profile.id,
          data: message,
          created_at: msgPayload.created_at
        }
      ]
    }));
    socket.emit('gateway:sendMsg', msgPayload);
  }, [state.activeConversation, socket]);
  
  const addConversationToSidebar = useCallback((userData: Conversation) => {
    if (!userData || !userData.id) return;
    
    const userConversation: Conversation = {
      id: userData.id,
      username: userData.username || '',
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      avatar: (userData.avatar?.startsWith('/dash/media') ? userData.avatar.replace('/dash/media', '/media') : userData.avatar || '/data/avatars/default.png'),
      last_message: '',
      is_online: userData.is_online || false
    };
    
    setState((prev: ChatState) => {
      const exists = prev.conversations.some((conv: Conversation) => conv.id === userData.id);
      if (!exists) {
        return {
          ...prev,
          conversations: [...prev.conversations, userConversation],
          activeConversation: userData.id
        };
      }
      return {
        ...prev,
        activeConversation: userData.id
      };
    });
  }, []);

  useEffect(() => {
    if (!chatMessageReceived) return;
  
    if (myIdRef.current === null) {
      const profile = getStoredProfile();
      if (!profile || profile.id == null) {
        const alreadyReloaded = localStorage.getItem('profileReloaded');
        if (!alreadyReloaded) {
          localStorage.setItem('profileReloaded', 'true');
          return window.location.reload();
        } else {
          localStorage.removeItem('profileReloaded');
          localStorage.removeItem('auth_token');
          return window.location.reload();
        }
      }
      myIdRef.current = profile.id;
      localStorage.removeItem('profileReloaded');
    }
  
    const myId = myIdRef.current;
    const { sender, receiver, type } = chatMessageReceived;
    const senderId = typeof sender === 'object' ? sender.id : sender;
    const receiverId = typeof receiver === 'object' ? receiver.id : receiver;
    const currentChatUserId = getCurrentUserIdFromPath();
    if (
      type === 4 &&
      currentChatUserId &&
      (currentChatUserId === senderId || currentChatUserId === receiverId)
    ) {
      fetchMessages(currentChatUserId);
    }

    setChatMessageReceived(null);
  }, [chatMessageReceived, setChatMessageReceived, fetchMessages]);
  
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);
  
  useEffect(() => {
    const userId = getCurrentUserIdFromPath();
    if (userId) {
      fetchMessages(userId);
    }
  }, [fetchMessages]);

  useEffect(() => {
    const handleNewMsg = (e: CustomEvent) => {
      const msg = e.detail;
      const currentUserId = state.activeConversation;
      const senderId = typeof msg.sender === 'object' ? msg.sender.id : msg.sender;
      const receiverId = typeof msg.receiver === 'object' ? msg.receiver.id : msg.receiver;
      if (
        currentUserId &&
        (currentUserId === senderId || currentUserId === receiverId)
      ) {
        setState((prev: ChatState) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              sender: msg.sender,
              data: msg.msg,
              created_at: msg.created_at
            }
          ]
        }));
      }
    };
    window.addEventListener('chat:newMsg', handleNewMsg as EventListener);
    return () => {
      window.removeEventListener('chat:newMsg', handleNewMsg as EventListener);
    };
  }, [state.activeConversation]);

  return {
    conversations: state.conversations,
    messages: state.messages,
    activeConversation: state.activeConversation,
    isLoading: state.isLoading,
    fetchConversations,
    fetchMessages,
    sendMessage,
    addConversationToSidebar
  };
} 