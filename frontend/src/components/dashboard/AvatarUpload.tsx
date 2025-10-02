'use client'

import { useState, useRef } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Loader2, Upload, Camera } from "lucide-react"
import { dashboardService } from '@/lib/api'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { refreshProfileData } from '@/utils/profileStorage'
interface AvatarUploadProps {
  currentAvatar?: string
  username: string
  onAvatarUpdated: (newAvatarUrl: string) => void
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function AvatarUpload({ 
  currentAvatar, 
  username, 
  onAvatarUpdated,
  size = 'md'
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarVersion, setAvatarVersion] = useState(Date.now());

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
    xl: 'h-40 w-40'
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const file = e.target.files?.[0]
    
    if (!file) return    
    if (!file.type.startsWith('image/')) {
      setError('Selected file is not an image')
      toast.error('Selected file is not an image')
      return
    }    
    if (file.type !== 'image/png') {
      setError('Only PNG formats are allowed')
      toast.error('Only PNG formats are allowed')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit')
      toast.error('File size exceeds 5MB limit')
      return
    }
    
    setSelectedFile(file)
    
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setIsUploading(true)
    setError(null)
    
    try {
      const response = await dashboardService.uploadAvatar(selectedFile)
      
      if (!response.status.success) {
        throw new Error(response.status.message)
      }      
      let newAvatarUrl = response.data?.avatar || currentAvatar || ''
      if (typeof newAvatarUrl === 'string') {
        newAvatarUrl = newAvatarUrl.replace('/dash/media/avatarUpload', 'https://blackholejs.art/avatars');
      }
      onAvatarUpdated(newAvatarUrl)
      setAvatarVersion(Date.now())
      const user = await dashboardService.getCard().then(response => response.data)
      if (user) {
        refreshProfileData(user)
      }
      setIsDialogOpen(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload avatar'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
    }
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

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const resetFileInput = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetFileInput()
    }
  }

  const avatarUrl = currentAvatar || '/data/avatars/default.png'
  const displayName = username.charAt(0).toUpperCase()

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <div className={`relative group cursor-pointer ${sizeClasses[size]}`}>
          <Avatar className={`${sizeClasses[size]} border-4 border-background`}>
            {/* <AvatarImage src={avatarUrl} alt={username} /> */}
            <AvatarImage src={
              previewUrl
                ? previewUrl
                : `${normalizeAvatarUrl(avatarUrl, avatarVersion)}`
            } alt={username} />
            <AvatarFallback>{displayName}</AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-6 w-6 text-white" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
          <DialogDescription>
            Upload a new profile picture. Only PNG formats are allowed (max 5MB).
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center gap-4 py-4">
          <Avatar className="h-40 w-40 border-4 border-border">
            <AvatarImage 
              src={normalizeAvatarUrl(avatarUrl, avatarVersion)}
              alt={username} 
              className="object-cover"
            />
            <AvatarFallback>{displayName}</AvatarFallback>
          </Avatar>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png"
            className="hidden"
          />
          
          <Button 
            variant="outline" 
            onClick={triggerFileInput}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {selectedFile ? 'Change Image' : 'Select Image'}
          </Button>
          
          {selectedFile && (
            <div className="text-sm text-muted-foreground">
              {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsDialogOpen(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button 
            variant="outline" 
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 