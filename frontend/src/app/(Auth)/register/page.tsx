'use client'

import { RegisterForm } from '@/components/Auth/register'
import { useAuth } from '@/hooks/useAuth'

export default function RegisterPage() {
  const { register, isLoading, error } = useAuth()

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <RegisterForm 
        handleRegister={register}
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
} 