'use client'

import { Conversation } from '@/types/Chat'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useRouter } from 'next/navigation'
import { OnlineStatus } from '@/components/ui/OnlineStatus'
import { formatLastOnline } from '@/lib/formatLastOnline'
import { onlineUsersStore } from '@/lib/onlineUsersStore'
import { useEffect, useState } from 'react'
import { useLang } from '@/context/langContext'
import enChat from '@/i18n/en/chat'
import frChat from '@/i18n/fr/chat'
interface ConversationListProps {
  conversations: Conversation[];
  activeId: number | null;
  isLoading: boolean;
  onSelectConversation: (userId: number) => void;
}

export function ConversationList({ 
  conversations, 
  activeId,
  isLoading,
  onSelectConversation
}: ConversationListProps) {
  const router = useRouter()
  const [lastOnlineTimes, setLastOnlineTimes] = useState<Record<number, number | undefined>>({})
  const [avatarVersion, setAvatarVersion] = useState(Date.now());
  // Get last online times from the store
  useEffect(() => {
    const updateLastOnlineTimes = () => {
      const times: Record<number, number | undefined> = {}
      conversations.forEach(conversation => {
        const userData = onlineUsersStore.getUserById(conversation.id)
        if (userData?.lastOnlineTime) {
          times[conversation.id] = userData.lastOnlineTime
        }
      })
      setLastOnlineTimes(times)
    }

    // Subscribe to changes in the online users store
    const unsubscribe = onlineUsersStore.subscribe(() => {
      updateLastOnlineTimes()
    })
    
    updateLastOnlineTimes()
    return unsubscribe
  }, [conversations])
  
  
  if (isLoading && conversations.length === 0) {
    return (
      <div className="flex flex-col space-y-4 py-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-md animate-pulse">
            <div className="w-10 h-10 rounded-full bg-muted"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const { lang } = useLang();
  const t = lang === 'en' ? enChat : frChat;
  if (conversations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t.noConversations}
      </div>
    )
  }

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

  return (
    <div className="flex flex-col space-y-1 py-4">
      {conversations.map((conversation) => {
        const lastOnlineTime = lastOnlineTimes[conversation.id]
        
        return (
          <button
            key={conversation.id}
            className={`flex items-center gap-3 p-3 rounded-md hover:bg-secondary/50 transition-colors ${
              activeId === conversation.id ? 'bg-secondary' : ''
            }`}
            onClick={() => onSelectConversation(conversation.id)}
          >
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={normalizeAvatarUrl(conversation.avatar, avatarVersion)} alt={conversation.username} />
                <AvatarFallback>
                  {conversation.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <OnlineStatus 
                userId={conversation.id} 
                className="absolute bottom-0 right-0"
                showLastOnline={false}
              />
            </div>
            
            <div className="flex flex-col items-start flex-1 overflow-hidden">
              <div className="flex items-center w-full">
                <span className="font-medium text-sm">
                  {conversation.username}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {conversation.is_online ? t.online : lastOnlineTime ? `${t.lastSeen} ${formatLastOnline(lastOnlineTime)}` : t.offline}
                </span>
              </div>
              <span className="text-xs text-muted-foreground truncate w-full text-left">
                {conversation.last_message}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
