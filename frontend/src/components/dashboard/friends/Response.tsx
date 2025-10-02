import { useState } from 'react'
import { FriendData, MinimalFriendData } from '@/types/friends'
import { UserInfo } from './UserInfo'
import { CancelButton } from './ActionButtons'
import { useLang } from '@/context/langContext'
import enFriends from '@/i18n/en/friends'
import frFriends from '@/i18n/fr/friends'

interface SentRequestProps {
  request: FriendData
  onCancel?: (userId: number) => void
  isLoading?: boolean
}

interface MinimalSentRequestProps {
  request: MinimalFriendData
  onCancel?: (userId: number) => void
  isLoading?: boolean
}

export function SentRequest({
  request,
  onCancel,
  isLoading = false
}: SentRequestProps) {
  const [localLoading, setLocalLoading] = useState(false)
  
  const handleCancel = async () => {
    setLocalLoading(true)
    try {
      await onCancel?.(request.id)
    } finally {
      setLocalLoading(false)
    }
  }
  
  const isDisabled = isLoading || localLoading
  
  return (
    <div className="flex items-center justify-between p-3 border rounded-md">
      <UserInfo user={request} />
      
      <div className="flex gap-2">
        <CancelButton
          onClick={handleCancel}
          isLoading={localLoading}
          disabled={isDisabled}
        />
      </div>
    </div>
  )
}

export function MinimalSentRequest({
  request,
  onCancel,
  isLoading = false
}: MinimalSentRequestProps) {
  const [localLoading, setLocalLoading] = useState(false)
  
  const handleCancel = async () => {
    setLocalLoading(true)
    try {
      await onCancel?.(request.userId)
    } finally {
      setLocalLoading(false)
    }
  }
  
  const isDisabled = isLoading || localLoading
  
  return (
    <div className="flex items-center justify-between p-3 border rounded-md">
      <UserInfo user={request} minimal />
      
      <div className="flex gap-2">
        <CancelButton
          onClick={handleCancel}
          isLoading={localLoading}
          disabled={isDisabled}
        />
      </div>
    </div>
  )
}

export function SentRequestsList({
  requests,
  onCancel,
  isLoading = false
}: {
  requests: FriendData[] | MinimalFriendData[]
  onCancel?: (userId: number) => void
  isLoading?: boolean
}) {
  const { lang } = useLang();
  const t = lang === 'en' ? enFriends : frFriends;
  const isMinimal = requests.length > 0 && 'userId' in requests[0]  
  return (
    <div className="space-y-4">
      {requests.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {t.noSent}
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            isMinimal ? (
              <MinimalSentRequest
                key={(request as MinimalFriendData).userId}
                request={request as MinimalFriendData}
                onCancel={onCancel}
                isLoading={isLoading}
              />
            ) : (
              <SentRequest
                key={(request as FriendData).id}
                request={request as FriendData}
                onCancel={onCancel}
                isLoading={isLoading}
              />
            )
          ))}
        </div>
      )}
    </div>
  )
}
