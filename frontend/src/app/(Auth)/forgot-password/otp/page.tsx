'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { OtpVerificationForm } from '@/components/Auth/otp-verification'
import { useAuth } from '@/hooks/useAuth'
import { useNavigation } from '@/context/NavigationContext'

function OtpVerificationContent() {
  const { changePassword, isLoading, error } = useAuth()
  const [verificationStep, setVerificationStep] = useState<'otp' | 'password'>('otp')
  const [otpCode, setOtpCode] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const { isNavigationAllowed } = useNavigation()
  const currentPath = `/forgot-password/otp?email=${encodeURIComponent(email)}`

  useEffect(() => {
    if (!email || !isNavigationAllowed(currentPath)) {
      router.push('/forgot-password')
    }
  }, [email, router, currentPath, isNavigationAllowed])

  // Don't render anything if not allowed to access this page
  if (!email || !isNavigationAllowed(currentPath)) return null
  
  const handleVerifyOtp = async (otp: string) => {
    if (otp.length !== 6) return false
    setOtpCode(otp)
    setVerificationStep('password')
    return true
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <OtpVerificationForm
        email={email}
        handleVerifyOtp={handleVerifyOtp}
        handleResetPassword={(password) => changePassword(email, otpCode, password).then(() => true).catch(() => false)}
        handleBackToEmail={() => router.push('/forgot-password')}
        verificationStep={verificationStep}
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
}

// Loading fallback for Suspense
function LoadingFallback() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <div className="animate-pulse text-center">
        <div className="h-8 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-4 mx-auto"></div>
        <div className="h-4 w-48 bg-gray-300 dark:bg-gray-700 rounded mx-auto"></div>
      </div>
    </div>
  )
}

export default function OtpVerificationPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OtpVerificationContent />
    </Suspense>
  )
} 