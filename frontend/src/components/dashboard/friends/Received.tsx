import { useState } from 'react'
import { FriendData, MinimalFriendData } from '@/types/friends'
import { UserInfo } from './UserInfo'
import { AcceptButton, RejectButton } from './ActionButtons'
import { useLang } from '@/context/langContext'
import enFriends from '@/i18n/en/friends'
import frFriends from '@/i18n/fr/friends'

interface FriendRequestProps {
  request: FriendData
  onAccept?: (userId: number) => void
  onReject?: (userId: number) => void
  onBlock?: (userId: number) => void
  isLoading?: boolean
}

interface MinimalFriendRequestProps {
  request: MinimalFriendData
  onAccept?: (userId: number) => void
  onReject?: (userId: number) => void
  onBlock?: (userId: number) => void
  isLoading?: boolean
}

export function FriendRequest({
  request,
  onAccept,
  onReject,
  onBlock,
  isLoading = false
}: FriendRequestProps) {
  const [localLoading, setLocalLoading] = useState(false)
  
  const handleAccept = async () => {
    setLocalLoading(true)
    try {
      await onAccept?.(request.id)
    } finally {
      setLocalLoading(false)
    }
  }
  
  const handleReject = async () => {
    setLocalLoading(true)
    try {
      await onReject?.(request.id)
    } finally {
      setLocalLoading(false)
    }
  }
  
  const isDisabled = isLoading || localLoading
  
  return (
    <div className="flex items-center justify-between p-3 border rounded-md">
      <UserInfo user={request} />
      
      <div className="flex gap-2">
        <AcceptButton 
          onClick={handleAccept}
          isLoading={localLoading}
          disabled={isDisabled}
        />
        
        <RejectButton
          onClick={handleReject}
          isLoading={localLoading}
          disabled={isDisabled}
        />
      </div>
    </div>
  )
}

export function MinimalFriendRequest({
  request,
  onAccept,
  onReject,
  onBlock,
  isLoading = false
}: MinimalFriendRequestProps) {
  const [localLoading, setLocalLoading] = useState(false)
  
  const handleAccept = async () => {
    setLocalLoading(true)
    try {
      await onAccept?.(request.userId)
    } finally {
      setLocalLoading(false)
    }
  }
  
  const handleReject = async () => {
    setLocalLoading(true)
    try {
      await onReject?.(request.userId)
    } finally {
      setLocalLoading(false)
    }
  }
  
  const isDisabled = isLoading || localLoading
  
  return (
    <div className="flex items-center justify-between p-3 border rounded-md">
      <UserInfo user={request} minimal />
      
      <div className="flex gap-2">
        <AcceptButton 
          onClick={handleAccept}
          isLoading={localLoading}
          disabled={isDisabled}
        />
        
        <RejectButton
          onClick={handleReject}
          isLoading={localLoading}
          disabled={isDisabled}
        />
      </div>
    </div>
  )
}

export function FriendRequestsList({
  requests,
  onAccept,
  onReject,
  onBlock,
  isLoading = false
}: {
  requests: FriendData[] | MinimalFriendData[]
  onAccept?: (userId: number) => void
  onReject?: (userId: number) => void
  onBlock?: (userId: number) => void
  isLoading?: boolean
}) {
  // Check if we're using minimal data format
  const isMinimal = requests.length > 0 && 'userId' in requests[0]
  const { lang } = useLang();
  const t = lang === 'en' ? enFriends : frFriends;
  return (
    <div className="space-y-4">
      {requests.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {t.noPending}
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            isMinimal ? (
              <MinimalFriendRequest
                key={(request as MinimalFriendData).userId}
                request={request as MinimalFriendData}
                onAccept={onAccept}
                onReject={onReject}
                onBlock={onBlock}
                isLoading={isLoading}
              />
            ) : (
              <FriendRequest
                key={(request as FriendData).id}
                request={request as FriendData}
                onAccept={onAccept}
                onReject={onReject}
                onBlock={onBlock}
                isLoading={isLoading}
              />
            )
          ))}
        </div>
      )}
    </div>
  )
}
