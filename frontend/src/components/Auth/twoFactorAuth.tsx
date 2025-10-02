// @ts-nocheck
'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useLang } from "@/context/langContext"
import en from "@/i18n/en/auth"
import fr from "@/i18n/fr/auth"
import { toast } from 'sonner';

export function TwoFactorAuthForm({
  className = "",
  handleVerify,
  isLoading: externalIsLoading,
  error: externalError,
  ...props
}) {
  const { lang } = useLang()
  const content = lang === 'fr' ? fr.twoFactorAuth : en.twoFactorAuth
  const [internalIsLoading, setInternalIsLoading] = useState(false)
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : internalIsLoading
  
  const [code, setCode] = useState("")
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setCode(e.target.value)
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!code) {
      setError("Verification code is required")
      return
    }
    
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setError("Verification code must be 6 digits")
      return
    }
    
    if (!handleVerify) return
    
    try {
      if (externalIsLoading === undefined) {
        setInternalIsLoading(true)
      }
      await handleVerify(code)
    } catch (error) {
      toast.error('Verification failed');
      setError(error.message || "Invalid verification code")
    } finally {
      if (externalIsLoading === undefined) {
        setInternalIsLoading(false)
      }
    }
  }
  
  // Handle external error
  useState(() => {
    if (externalError) {
      setError(externalError)
    }
  }, [externalError])
  
  return (
    <div className={`flex justify-center items-center min-h-screen w-full px-4 py-6 ${className}`} {...props}>
      <div className="w-full max-w-md mx-auto">
        <Card className="w-full shadow-md border-0">
          <CardHeader className="pb-2 space-y-1">
            <CardTitle className="text-xl font-bold text-foreground text-center">
              {content?.title || "Two-Factor Authentication"}
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              {content?.subtitle || "Enter the 6-digit code from your authenticator app"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium block mb-1">
                  {content?.codeLabel || "Verification Code"}
                </label>
                <Input
                  id="code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder={content?.codePlaceholder || "Enter 6-digit code"}
                  value={code}
                  onChange={handleChange}
                  className={error ? "border-red-500" : ""}
                />
                {error && (
                  <p className="text-xs text-red-500 mt-1">{error}</p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-foreground text-background hover:bg-primary/90" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {content?.verifyButton || "Verifying..."}
                  </span>
                ) : content?.verifyButton || "Verify"}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <div className="text-center text-xs text-muted-foreground">
              {content?.helpText || "Open your authenticator app to view your verification code"}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 