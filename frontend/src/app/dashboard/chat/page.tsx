'use client'

import { Suspense } from 'react'
import { ChatComponent } from '@/components/dashboard/chat'
import { useSearchParams } from 'next/navigation'

// Loading component for Suspense
function LoadingFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="animate-pulse text-center">
        <div className="h-8 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-4 mx-auto"></div>
        <div className="h-4 w-48 bg-gray-300 dark:bg-gray-700 rounded mx-auto"></div>
      </div>
    </div>
  )
}

function ChatContent() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')
  
  return <ChatComponent userId={userId ? parseInt(userId) : undefined} />
}

export default function ChatPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ChatContent />
    </Suspense>
  )
}
