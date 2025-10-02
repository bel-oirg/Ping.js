'use client'

import { useRouter } from 'next/navigation'
import { ForgotPasswordForm } from '@/components/Auth/forgot-password'
import { useAuth } from '@/hooks/useAuth'
import { useNavigation } from '@/context/NavigationContext'

export default function ForgotPasswordPage() {
  const { getOTP, isLoading, error } = useAuth()
  const router = useRouter()
  const { allowNavigation } = useNavigation()

  const handleForgotPassword = async (email: string) => {
    try {
      const success = await getOTP(email)      
      if (success) {
        const otpPath = `/forgot-password/otp?email=${encodeURIComponent(email)}`
        allowNavigation(otpPath)
        router.push(otpPath)
        return true
      }
      return false
    } catch {
      return false
    }
  }
  
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <ForgotPasswordForm 
        handleForgotPassword={handleForgotPassword}
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
} 