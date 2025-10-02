'use client'

import { useEffect } from 'react'
import { useOnlineUsers } from '@/hooks/useOnlineUsers'
import { OnlineUsers } from '@/components/dashboard/OnlineUsers'

export default function OnlineUsersPage() {
  // const { refreshOnlineUsers } = useOnlineUsers()
  
  // // Refresh online users on page load
  // useEffect(() => {
  //   refreshOnlineUsers()
  // }, [refreshOnlineUsers])
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Online Users</h1>
      <p className="text-muted-foreground mb-6">
        See who's currently online and connect with them.
      </p>
      
      <OnlineUsers 
        maxDisplay={100} 
        title="All Online Users" 
        className="w-full md:max-w-3xl"
      />
    </div>
  )
} 