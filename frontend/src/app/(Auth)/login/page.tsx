'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoginForm } from '@/components/Auth/login'
import { useAuth } from '@/hooks/useAuth'
import { AuthService } from '@/lib/api/AuthService'

// Loading component for Suspense
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

function LoginContent() {
  const { login, loginWithToken, isLoading, error } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isExchanging, setIsExchanging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    let token = searchParams.get('token')
    let otp_token = searchParams.get('otp_token')
    const errorMsg = searchParams.get('error')
    
    if (token || otp_token) {
      setIsExchanging(true)
      if (otp_token) {
        localStorage.setItem('otp_token', otp_token)
        sessionStorage.setItem('justRedirectedTo2FA', 'true')
        const cleanUrl = window.location.pathname
        window.history.replaceState({}, '', cleanUrl)
        window.location.replace('/login/2fa')
        return
      }
      
      // It's a regular token, attempt to log in
      try {
        if (token) {
          loginWithToken(token)
          .then(() => {
          })
          .catch((err) => {
            setLocalError(`Token authentication failed: ${err.message || 'Unknown error'}`)
          })
          .finally(() => {
            setIsExchanging(false)
          })
        } else {
          setLocalError("No valid token received")
          setIsExchanging(false)
        }
      } catch (err) {
        setLocalError(`Authentication error: ${err instanceof Error ? err.message : 'Unknown error'}`)
        setIsExchanging(false)
      }      
      const cleanUrl = window.location.pathname
      window.history.replaceState({}, '', cleanUrl)
      return
    }
    
    if (errorMsg) {
      window.location.reload()
    }
  }, [searchParams, loginWithToken, router])

  useEffect(() => {
    if (localError || error) {
      window.location.reload()
    }
  }, [localError, error, router])

  const handleLogin = async (username: string, password: string) => {
    try {
      setLocalError(null)
      await login({ username, password })
    } catch (err) {
      if (err instanceof Error) {
        setLocalError(err.message)
      }
    }
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      {isExchanging ? (
        <div className="text-lg text-muted-foreground">Logging you in...</div>
      ) : (
        <LoginForm 
          handleLogin={handleLogin}
          isLoading={isLoading}
          error={localError || error}
        />
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginContent />
    </Suspense>
  )
}