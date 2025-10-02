'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useLang } from '@/context/langContext'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useWallet } from '@/context/walletContext'
import Wallet from '@/components/ui/wallet'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { getStoredProfile, isProfileDataValid, refreshProfileData, storeProfileData } from '@/utils/profileStorage'
import { DashboardService } from '@/lib/api/DashboardService'
import { toast } from 'sonner'
/**
 * Small header component for dashboard layout
 * @returns Header component
 */
const DashboardHeader = () => {
  const { lang, setLang, mounted: langMounted } = useLang()
  const { budget, isLoading: walletLoading } = useWallet()
  const [mounted, setMounted] = useState(false)
  const [username, setUsername] = useState<string>('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [avatarVersion, setAvatarVersion] = useState(Date.now());
  const prevAvatarRef = useRef<string | null>(null);

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const updateProfile = () => {
      const storedProfile = getStoredProfile();
      if (storedProfile && isProfileDataValid()) {
        setUsername(storedProfile.username);
        setAvatar(storedProfile.avatar);
        if (prevAvatarRef.current !== storedProfile.avatar) {
          setAvatarVersion(Date.now());
          prevAvatarRef.current = storedProfile.avatar;
        }
      }
    };
    updateProfile();
    // refreshProfile();
    window.addEventListener('profile-updated', updateProfile);
    return () => window.removeEventListener('profile-updated', updateProfile);
  }, [])

  const toggleLang = () => {
    setLang(lang === 'en' ? 'fr' : 'en')
  }

	const normalizeAvatarUrl = (url?: string, version?: number) => {
		if (typeof url === 'string') {
			let newUrl = url;
			if (newUrl.includes('/dash/media/avatarUpload')) {
				newUrl = newUrl.replace('/dash/media/avatarUpload', 'https://blackholejs.art/avatars');
			} else if (newUrl.includes('/media/avatarUpload')) {
				newUrl = newUrl.replace('/media/avatarUpload', 'https://blackholejs.art/avatars');
			}
			const versionSuffix = version ? `?cb=${version}` : '';
			return `${newUrl}${versionSuffix}`;
		}
		return url;
	};

  if (!mounted || !langMounted) {
    return (
      <div className="w-full">
        <header className="border-b border-border-1 bg-card/80 backdrop-blur-sm h-12 px-4">
          <div className="flex items-center justify-between h-full">
          </div>
        </header>
      </div>
    )
  }

  return (
    <div className="w-full">
      <header className="border-b border-border-1 bg-card/80 backdrop-blur-sm h-12 px-4">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-3">
            {mounted && <Wallet budget={budget} size="sm" />}
            {avatar && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={`${normalizeAvatarUrl(avatar, avatarVersion)}`} alt={username} />
                <AvatarFallback>{username ? username.charAt(0).toUpperCase() : '?'}</AvatarFallback>
              </Avatar>
            )}
            {username && (
              <span className="font-medium text-xs">@{username}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleLang}
                    className="h-8 w-8 rounded-full"
                  >
                    <span className="font-medium text-xs">{lang === 'en' ? 'FR' : 'EN'}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Switch Language</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>
    </div>
  )
}

export default DashboardHeader 