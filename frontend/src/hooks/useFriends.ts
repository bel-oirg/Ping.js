import { useState, useEffect, useCallback, useRef } from 'react'
import { dashboardService } from '@/lib/api'
import { FriendshipStatus, RelationshipsResponse } from '@/types/Dashboard'
import { FriendData } from '@/types/friends'
import { normalizeAvatarUrl } from '@/components/dashboard/profile';

export function useFriends() {
  const [isLoading, setIsLoading] = useState(false)
  const [friends, setFriends] = useState<FriendData[]>([])
  const [receivedRequests, setReceivedRequests] = useState<FriendData[]>([])
  const [sentRequests, setSentRequests] = useState<FriendData[]>([])
  const [blockedUsers, setBlockedUsers] = useState<FriendData[]>([])
  const [relationsData, setRelationsData] = useState<RelationshipsResponse | null>(null)
  
  // Use socketSync to ensure component re-renders on socket events
  // Remove: useSocketSync([friendshipUpdated])  
  const debounceRef = useRef<number | null>(null)
  const isFetchingRef = useRef(false)

  const fetchAllRelations = async () => {
    if (isFetchingRef.current) {
      return
    }
    
    isFetchingRef.current = true
    setIsLoading(true)
    try {
      const response = await dashboardService.getAllRelations()
      if (response.status.success && response.data) {
        setRelationsData(response.data)
        processRelationsData(response.data)
      } else {
        // Remove: toast.error("Failed to fetch relationships");
      }
    } catch (error) {
      // Remove: toast.error("Error fetching relationships");
    } finally {
      setIsLoading(false)
      isFetchingRef.current = false
    }
  }

  const processRelationsData = (relations: RelationshipsResponse) => {
    if (!relations) return

    const friendsList = (relations.friends ?? []).map((friend: any): FriendData => ({
      id: friend.id,
      username: friend.username,
      first_name: friend.first_name ?? '',
      last_name: friend.last_name ?? '',
      avatar: normalizeAvatarUrl(friend.avatar) ?? null,
      is_online: false,
      friendship_status: FriendshipStatus.HE_FR,
    }))
    setFriends(friendsList)

    // Process received requests
    const receivedList = (relations.receivedReq ?? []).map((request: any): FriendData => ({
      id: request.id,
      username: request.username,
      first_name: request.first_name ?? '',
      last_name: request.last_name ?? '',
      avatar: normalizeAvatarUrl(request.avatar) ?? null,
      is_online: false,
      friendship_status: FriendshipStatus.NONE,
    }))
    setReceivedRequests(receivedList)

    // Process sent requests
    const sentList = (relations.sentReq ?? []).map((request: any): FriendData => ({
      id: request.id,
      username: request.username,
      first_name: request.first_name ?? '',
      last_name: request.last_name ?? '',
      avatar: normalizeAvatarUrl(request.avatar) ?? null,
      is_online: false,
      friendship_status: FriendshipStatus.NONE,
    }))
    setSentRequests(sentList)

    // Process blocked users
    const blockedList = (relations.blacklist ?? []).map((blocked: any): FriendData => ({
      id: blocked.id,
      username: blocked.username,
      first_name: blocked.first_name ?? '',
      last_name: blocked.last_name ?? '',
      avatar: normalizeAvatarUrl(blocked.avatar) ?? null,
      is_online: false,
      friendship_status: FriendshipStatus.NONE,
    }))
    setBlockedUsers(blockedList)
  }

  const acceptFriendRequest = async (userId: number) => {
    setIsLoading(true)
    try {
      const response = await dashboardService.acceptFriendRequest(userId.toString())
      if (response.status.success) {
        const acceptedUser = receivedRequests.find((req: FriendData) => req.id === userId)
        if (acceptedUser) {
          setFriends((prev: FriendData[]) => [...prev, { ...acceptedUser, status: 'FRIENDS' }])
          setReceivedRequests((prev: FriendData[]) => prev.filter((req: FriendData) => req.id !== userId))
        }
      }
    } catch (error) {
      // Remove: toast.error("Error accepting friend request");
    } finally {
      setIsLoading(false)
    }
  }

  const rejectFriendRequest = async (userId: number) => {
    setIsLoading(true)
    try {
      const response = await dashboardService.denyFriendRequest(userId.toString())
      if (response.status.success) {
        setReceivedRequests((prev: FriendData[]) => prev.filter((req: FriendData) => req.id !== userId))
      }
    } catch (error) {
      // Remove: toast.error("Error rejecting friend request");
    } finally {
      setIsLoading(false)
    }
  }

  const cancelFriendRequest = async (userId: number) => {
    setIsLoading(true)
    try {
      const response = await dashboardService.cancelFriendRequest(userId.toString())
      if (response.status.success) {
        setSentRequests((prev: FriendData[]) => prev.filter((req: FriendData) => req.id !== userId))
      }
    } catch (error) {
      // Remove: toast.error("Error cancelling friend request");
    } finally {
      setIsLoading(false)
    }
  }

  const removeFriend = async (userId: number) => {
    setIsLoading(true)
    try {
      const response = await dashboardService.unfriend(userId.toString())
      if (response.status.success) {
        setFriends((prev: FriendData[]) => prev.filter((friend: FriendData) => friend.id !== userId))
      }
    } catch (error) {
      // Remove: toast.error("Error removing friend");
    } finally {
      setIsLoading(false)
    }
  }

  const blockUser = async (userId: number) => {
    setIsLoading(true)
    try {
      const response = await dashboardService.blockUser(userId.toString())
      if (response.status.success) {
        await fetchAllRelations()
      }
    } catch (error) {
      // Remove: toast.error("Error blocking user");
    } finally {
      setIsLoading(false)
    }
  }

  const unblockUser = async (userId: number) => {
    setIsLoading(true)
    try {
      const response = await dashboardService.unblockUser(userId.toString())
      if (response.status.success) {
        await fetchAllRelations()
      }
    } catch (error) {
      // Remove: toast.error("Error unblocking user");
    } finally {
      setIsLoading(false)
    }
  }

  // Debounced fetch function to handle friendship updates
  const debouncedFetchRelations = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    debounceRef.current = window.setTimeout(async () => {
      if (isFetchingRef.current) {
        return
      }
      
      await fetchAllRelations()
      // Remove: setFriendshipUpdated(false)
    }, 300) // 300ms debounce
  }, []) // Remove: [setFriendshipUpdated]

  useEffect(() => {
    // If you want to trigger on some event, add it here
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [debouncedFetchRelations])

  useEffect(() => {
    fetchAllRelations()
  }, [])

  return {
    isLoading,
    friends,
    receivedRequests,
    sentRequests,
    blockedUsers,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    removeFriend,
    blockUser,
    unblockUser
  }
}
