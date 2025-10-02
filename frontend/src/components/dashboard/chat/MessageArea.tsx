'use client'

import { useState, useRef, useEffect } from 'react'
import { Message, Conversation } from '@/types/Chat'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, Send } from 'lucide-react'
import { getStoredProfile } from '@/utils/profileStorage'
import { OnlineStatus } from '@/components/ui/OnlineStatus'
import { formatLastOnline } from '@/lib/formatLastOnline'
import { onlineUsersStore } from '@/lib/onlineUsersStore'
import { useLang } from '@/context/langContext'
import enChat from '@/i18n/en/chat'
import frChat from '@/i18n/fr/chat'
import React from 'react'
import { toast } from 'sonner'
import { storeProfileData, isProfileDataValid } from '@/utils/profileStorage'
import { dashboardService } from "@/lib/api/index"

interface MessageAreaProps {
  messages: Message[]
  isLoading: boolean
  onSendMessage: (content: string) => void
  onBack?: () => void
  activeConversation?: Conversation
  avatarVersion?: number
}

export function MessageArea({
  messages,
  isLoading,
  onSendMessage,
  onBack,
  activeConversation,
  avatarVersion
}: MessageAreaProps) {
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [lastOnlineTime, setLastOnlineTime] = useState<number | undefined>(undefined)
  const [avatar, setAvatar] = useState<string | null>(null)
	const [userId, setUserId] = useState<string | null>(null)
	const [isLoading2, setIsLoading2] = useState(true)
	const prevAvatarRef = useRef<string | null>(null);
	const [mounted, setMounted] = useState(false)
  const [username, setUsername] = useState<string>('')
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  useEffect(() => {
    setNewMessage('')
  }, [activeConversation?.id])
  
  useEffect(() => {
    if (!activeConversation) return
    
    const updateLastOnlineTime = () => {
      const userData = onlineUsersStore.getUserById(activeConversation.id)
      setLastOnlineTime(userData?.lastOnlineTime)
    }
    
    const unsubscribe = onlineUsersStore.subscribe(() => {
      updateLastOnlineTime()
    })
    
    updateLastOnlineTime()
    return unsubscribe
  }, [activeConversation])
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  const handleSend = () => {
    if (newMessage.length > 100) {
      toast.error(t.messageTooLong)
      return
    }
    if (newMessage.trim()) {
      onSendMessage(newMessage)
      setNewMessage('')
    }
  }
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }
  
	useEffect(() => {
		const fetchProfileData = async () => {
			if (mounted && typeof window !== 'undefined') {
				const storedProfile = getStoredProfile();

				if (storedProfile && isProfileDataValid()) {
					setUsername(storedProfile.username);
					setAvatar(storedProfile.avatar);
					setUserId(storedProfile.id);
					setIsLoading2(false);
					if (prevAvatarRef.current !== storedProfile.avatar) {
						// setAvatarVersion(Date.now()); // Removed as per edit hint
						prevAvatarRef.current = storedProfile.avatar;
					}
					return;
				}
				setIsLoading2(true);
				try {
					const response = await dashboardService.getCard();
					if (response.status.success && response.data) {
						const { User } = response.data;
						setUsername(User.username);
						setAvatar(User.avatar);
						setUserId(User.id);
						storeProfileData(response.data);
					}
				} catch (err) {
					toast.error('game profile error');
				} finally {
					setIsLoading2(false);
				}
			}
		};
		fetchProfileData();
	}, [mounted]);


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
  
  const { lang } = useLang();
  const t = lang === 'en' ? enChat : frChat;
  if (!activeConversation) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        {t.selectConversation}
      </div>
    )
  }
  
  const storedProfile = getStoredProfile()
  const currentUserId = storedProfile?.id
  
  return (
    <div className="flex flex-col h-full no-scrollbar">
      <div className="flex items-center gap-3 p-3 border-b">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        
        <div className="relative">
          <Avatar className="h-8 w-8">
            <AvatarImage src={normalizeAvatarUrl(activeConversation.avatar, avatarVersion)} alt={activeConversation} />
            <AvatarFallback>
              {activeConversation.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <OnlineStatus 
            userId={activeConversation.id} 
            className="absolute bottom-0 right-0"
            showLastOnline={false}
          />
        </div>
        
        <div>
          <div className="font-medium text-sm">
            {activeConversation.username}
          </div>
          <div className="text-xs text-muted-foreground">
            {activeConversation.is_online ? t.online : lastOnlineTime ? `${t.lastSeen} ${formatLastOnline(lastOnlineTime)}` : t.offline}
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {isLoading && messages.length === 0 ? (
          <div className="flex flex-col space-y-4">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className={`flex items-end gap-2 ${i % 2 === 0 ? 'justify-end' : ''}`}
              >
                {i % 2 !== 0 && (
                  <div className="w-8 h-8 rounded-full bg-muted"></div>
                )}
                <div 
                  className={`rounded-lg p-3 max-w-[70%] animate-pulse
                    ${i % 2 === 0 
                      ? 'bg-primary/20 rounded-tr-none' 
                      : 'bg-muted rounded-tl-none'}`
                  }
                >
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t.noMessages}
              </div>
            ) : (
              messages.map((message, index) => {
                const messageSender = Number(message.sender);
                const isCurrentUser = messageSender === currentUserId;
                
                return (
                  <div 
                    key={index} 
                    className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : ''}`}
                  >
                    {!isCurrentUser && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={normalizeAvatarUrl(activeConversation.avatar, avatarVersion) || '/data/avatars/default.png'} 
                          alt={activeConversation.username} 
                        />
                        <AvatarFallback>
                          {activeConversation.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div 
                      className={`rounded-lg p-3 max-w-[70%]
                        ${isCurrentUser 
                          ? 'bg-primary text-primary-background rounded-tr-none' 
                          : 'bg-secondary rounded-tl-none'}
                      `}
                    >
                      <p className="break-words" aria-label={message.data}>{message.data}</p>
                      <div className="text-xs mt-1 opacity-70 text-right">
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    {index === messages.length - 1 && <div ref={messagesEndRef} />}
                  </div>
                )
              })
            )}
          </>
        )}
      </div>
      
      <div className="p-3 border-t">
        <div className="flex items-center gap-2">
          <Input
            placeholder={t.typeMessage}
            value={newMessage}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-primary"
            disabled={!activeConversation}
            maxLength={100}
            aria-label={t.typeMessage}
          />
          <Button onClick={handleSend} className="bg-secondaryForeground" disabled={!newMessage.trim() || isLoading || !activeConversation}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}