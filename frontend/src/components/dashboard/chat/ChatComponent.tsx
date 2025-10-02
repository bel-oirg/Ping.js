'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { MessageSquare, UserPlus } from "lucide-react"
import { useChat } from '@/hooks/useChat'
import { ConversationList } from './ConversationList'
import { MessageArea } from './MessageArea'
import { chatService, dashboardService } from '@/lib/api'
import { Conversation } from '@/types/Chat'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from "sonner"
import { useSocket } from '@/context/SocketContext'
import { getStoredProfile } from '@/utils/profileStorage'
import { onlineUsersStore } from '@/lib/onlineUsersStore'
import { useLang } from '@/context/langContext'
import enChat from '@/i18n/en/chat'
import frChat from '@/i18n/fr/chat'
import { useSocketSync } from '@/utils/socketSync';
import { useRef } from 'react'
import { useRouter } from 'next/navigation'
interface ChatComponentProps {
  userId?: number
}

export function ChatComponent({ userId }: ChatComponentProps) {
  useSocketSync();
  const { lang } = useLang();
  const t = lang === 'en' ? enChat : frChat;
  const {
    conversations,
    activeConversation,
    isLoading,
    fetchMessages,
    sendMessage,
    addConversationToSidebar
  } = useChat();
  const { socket, onlineUsers } = useSocket();
  const [isMobile, setIsMobile] = useState(false);
  const [showConversations, setShowConversations] = useState(true);
  const [directUser, setDirectUser] = useState<Conversation | null>(null);
  const [newUserDialog, setNewUserDialog] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [updatedConversations, setUpdatedConversations] = useState<Conversation[]>([]);
  const [, forceUpdate] = useState<number>(0);
  const messagesRef = useRef<any[]>([]);
  const router = useRouter();
  const [avatarVersion, setAvatarVersion] = useState(Date.now());
  const normalizeAvatarUrl = (url?: string, version?: number) => {
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
      if (shouldNormalize && version) {
        return `${newUrl}?cb=${version}`;
      }
      return newUrl;
    }
    return url;
  };

  const currentConversation = activeConversation ? 
    updatedConversations.find((c: Conversation) => c.id === activeConversation) || directUser : null;

  // Update avatarVersion if directUser or currentConversation avatar changes
  useEffect(() => {
    let avatarUrl = directUser?.avatar;
    if (!avatarUrl && currentConversation) avatarUrl = currentConversation.avatar;
    if (avatarUrl && typeof avatarUrl === 'string' && avatarUrl.includes('/dash/media/avatarUpload')) {
      setAvatarVersion(Date.now());
    }
  }, [directUser?.avatar, currentConversation?.avatar]);
  // Direct socket message listener for real-time updates
  useEffect(() => {
    if (!socket) return;
    const handleNewMsg = (msg: any) => {
      const currentUserId = activeConversation;
      const senderId = typeof msg.sender === 'object' ? msg.sender.id : msg.sender;
      const receiverId = typeof msg.receiver === 'object' ? msg.receiver.id : msg.receiver;
      if (currentUserId && (currentUserId === senderId || currentUserId === receiverId)) {
        messagesRef.current = [...messagesRef.current, {
          sender: msg.sender,
          data: msg.msg,
          created_at: msg.created_at
        }];
        forceUpdate((x: number) => x + 1);
      }
    };
    socket.on('gateway:newMsg', handleNewMsg);
    return () => {
      socket.off('gateway:newMsg', handleNewMsg);
    };
  }, [socket, activeConversation]);

  useEffect(() => {
    if (activeConversation) {
      (async () => {
        try {
          const response = await fetchMessages(activeConversation);
          if (Array.isArray(response)) {
            messagesRef.current = response;
            forceUpdate((x: number) => x + 1);
          }
        } catch (err) {
          // Optionally handle error
        }
      })();
    }
  }, [activeConversation, fetchMessages]);

  const fetchHistory = async (userId: number) => {
    const response = await chatService.getMessages(userId);
    if (response.status.success && response.data) {
      messagesRef.current = response.data;
      forceUpdate((x: number) => x + 1);
    }
  }

  // Update online status of conversations
  useEffect(() => {
    const updateOnlineStatus = () => {
      if (conversations.length === 0) return;
      
      const updatedConversations = conversations.map((conversation: Conversation) => {
        const isOnline = onlineUsersStore.isUserOnline(conversation.id);
        const userData = onlineUsersStore.getUserById(conversation.id);
        return {
          ...conversation,
          is_online: isOnline,
          lastOnlineTime: userData?.lastOnlineTime
        };
      });
      setUpdatedConversations(updatedConversations);
    };
    
    // Subscribe to changes in the online users store
    const unsubscribe = onlineUsersStore.subscribe(() => {
      updateOnlineStatus();
    });
    
    updateOnlineStatus();
    return unsubscribe;
  }, [conversations]);
  
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])
  
  useEffect(() => {
    if (activeConversation && isMobile) {
      setShowConversations(false)
    }
  }, [activeConversation, isMobile])
  
  useEffect(() => {
    if (userId && !isLoading && !conversations.some((c: Conversation) => c.id === userId)) {
      const fetchAndSet = async () => {
        try {
          const response = await dashboardService.getCard(userId.toString());
          // const messageHistory = await chatService.getMessages(userId);
          if (response.status.success && response.data) {
            const userData = response.data.User;
            const userConversation = {
              id: userData.id,
              username: userData.username,
              first_name: "", // Keep empty
              last_name: "", // Keep empty
              avatar: userData.avatar || '/data/avatars/default.png',
              last_message: '',
              is_online: userData.is_online
            };
            
            setDirectUser(userConversation);
            addConversationToSidebar(userData);
            fetchHistory(userId);
          }
        } catch (error) {
          toast.error(t.noConversations);
        }
      };
      fetchAndSet();
    }
  }, [userId, isLoading, conversations, fetchMessages, addConversationToSidebar]);
  
  useEffect(() => {
    if (
      userId &&
      !isLoading &&
      activeConversation !== userId
    ) {
      fetchMessages(userId);
    }
  }, [userId, isLoading, activeConversation, fetchMessages]);
  
  const handleSelectConversation = (userId: number) => {
    router.push(`/dashboard/chat?userId=${userId}`)
    fetchHistory(userId);
  };
  
  const handleSendMessage = async (content: string) => {
    if (activeConversation && content.trim()) {
      const profile = getStoredProfile();
      const friendCheck = await dashboardService.friendShipCheck(String(activeConversation));
      if (!friendCheck.status.success || !friendCheck.data?.Friendship) {
        toast.error(t.noConversations || 'You are not friends with this user.');
        return;
      }
      const msg = {
        sender: profile?.id,
        data: content,
        created_at: new Date().toISOString()
      };
      messagesRef.current = [...messagesRef.current, msg];
      forceUpdate((x: number) => x + 1);
      sendMessage(content).catch(() => {
        toast.error('Failed to send message');
      });
    }
  };
  
  const handleBackToList = () => {
    
    setShowConversations(true);
  };
  
  const handleAddNewUser = async () => {
    if (!newUsername.trim()) {
      toast.error(t.enterUsername);
      return;
    }
    
    try {
      const response = await dashboardService.getUserByUsername(newUsername);
      if (!response || !response.status) {
        toast.error(t.noConversations);
        return;
      }
      if (response.data?.id === getStoredProfile()?.id) {
        toast.error(t.noConversations);
        return;
      }
      if (response.status.success && response.data) {
        const userData = response.data;
        
        addConversationToSidebar(userData);
        
        fetchMessages(Number(userData.id));
        {/** add logic of no firend history message */}
        setNewUserDialog(false);
        setNewUsername('');
        
        if (isMobile) {
          setShowConversations(false);
        }
        toast.success(`${t.startChat} ${userData.username}`);
      } else {
        toast.error(t.noConversations);
      }
    } catch (error) {
      toast.error(t.noConversations);
    }
  };
  
  return (
    <div className="container items-center mx-auto w-full h-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{t.messages}</h2>
          <Dialog open={newUserDialog} onOpenChange={setNewUserDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">{t.newChat}</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.startNewConversation}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">{t.username}</Label>
                  <Input 
                    id="username" 
                    value={newUsername}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUsername(e.target.value)}
                    placeholder={t.enterUsername}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleAddNewUser()}
                  />
                </div>
                <Button variant="outline" className="bg-primary"  onClick={handleAddNewUser}>{t.startChat}</Button>
              </div>
            </DialogContent>
          </Dialog>
        {/* </div> */}
        </div>
        
      <Card className="w-full h-[calc(100vh-180px)]  p-4 sm:p-6">
        <CardContent className="p-0 h-[calc(100%-60px)]">
          <div className="flex h-full gap-4">
            {(!isMobile || showConversations) && (
              <div className={`${isMobile ? 'w-full' : 'w-1/3'} h-full overflow-y-auto border-r pr-4`}>
                <ConversationList 
                  conversations={updatedConversations}
                  activeId={activeConversation}
                  isLoading={isLoading}
                  onSelectConversation={handleSelectConversation}
                />
              </div>
            )}
            
            {(!isMobile || !showConversations) && (
              <div className={`${isMobile ? 'w-full' : 'w-2/3'} h-full `}>
                <MessageArea 
                  messages={messagesRef.current}
                  isLoading={isLoading}
                  onSendMessage={handleSendMessage}
                  onBack={isMobile ? handleBackToList : undefined}
                  activeConversation={
                    activeConversation ? 
                      (() => {
                        const found = updatedConversations.find((c: Conversation) => c.id === activeConversation) || directUser;
                        if (!found) return undefined;
                        return {
                          ...found,
                          avatar: normalizeAvatarUrl(found.avatar, avatarVersion),
                          is_online: onlineUsersStore.isUserOnline(found.id)
                        };
                      })()
                      : undefined
                  }
                  avatarVersion={avatarVersion}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 