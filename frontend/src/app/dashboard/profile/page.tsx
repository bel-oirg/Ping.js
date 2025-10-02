'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProfileComponent } from '@/components/dashboard/profile'

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

function ProfileContent() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('id')
  
  return <ProfileComponent userId={userId || undefined} />
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ProfileContent />
    </Suspense>
  )
}
