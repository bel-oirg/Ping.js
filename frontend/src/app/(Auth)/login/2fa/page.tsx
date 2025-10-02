'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TwoFactorAuthForm } from '@/components/Auth/twoFactorAuth'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

export default function TwoFactorAuthPage() {
  const { verifyTwoFactor, isLoading, error } = useAuth()
  const router = useRouter()
  const [otpToken, setOtpToken] = useState<string | null>(null)

  useEffect(() => {
    let timeout;
    let interval;

    const checkToken = () => {
      const token = localStorage.getItem('otp_token');
      if (token) {
        setOtpToken(token);
        sessionStorage.removeItem('justRedirectedTo2FA');
        clearInterval(interval);
        clearTimeout(timeout);
      }
    };

    if (sessionStorage.getItem('justRedirectedTo2FA')) {
      interval = setInterval(checkToken, 50);
      timeout = setTimeout(() => {
        clearInterval(interval);
        window.location.replace('/login');
      }, 1000); // 1 second max wait
    } else {
      const token = localStorage.getItem('otp_token');
      if (!token) {
        window.location.replace('/login');
        return;
      }
      setOtpToken(token);
    }

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const handleVerify = async (code: string) => {
    if (!otpToken) return
    try {
      await verifyTwoFactor(code)
    } catch (err) {
      toast.error('2FA verification failed:', err)
    }
  }

  if (!otpToken) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <span className="text-muted-foreground text-lg">Loading 2FA...</span>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <TwoFactorAuthForm
        handleVerify={handleVerify}
        isLoading={isLoading}
        error={error}
        // code={}
      />
    </div>
  )
} 