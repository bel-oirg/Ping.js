'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useCliToken } from '@/hooks/useCliToken'
import { Loader2, RefreshCw, Copy, Terminal, CheckCircle } from 'lucide-react'
import { useLang } from '@/context/langContext'
import en from '@/i18n/en'
import fr from '@/i18n/fr'
import React from 'react'

export function CliTokenSettings() {
  const { isLoading, error, getCliToken, resetCliToken, verifyCliToken } = useCliToken();
  const [token, setToken] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { lang } = useLang();
  const t = lang === 'en' ? en.settings : fr.settings;

  const handleGetToken = async () => {
    try {
      const tokenData = await getCliToken();
      if (tokenData) {
        setToken(tokenData);
        toast.success('CLI token retrieved successfully');
      }
    } catch (err) {
      toast.error('Failed to retrieve CLI token');
    }
  };

  const handleResetToken = async () => {
    try {
      await resetCliToken();
      setToken(null);
      toast.success('CLI token reset successfully');
    } catch (err) {
      toast.error('Failed to reset CLI token');
    }
  };

  const handleVerifyToken = async () => {
    if (!verificationCode) {
      toast.error('Please enter a verification code');
      return;
    }
    
    setIsVerifying(true);
    try {
      const success = await verifyCliToken(verificationCode);
      if (success) {
        toast.success('CLI token verified successfully');
        setVerificationCode('');
        setIsVerifying(false);
      } else {
        toast.error('Invalid verification code');
      }
    } catch (err) {
      toast.error('Failed to verify CLI token');
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      toast.success('Token copied to clipboard');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" />
          {t.cliToken}
        </CardTitle>
        <CardDescription>
          {t.cliTokenDesc}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {token ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">{t.yourCliToken}</p>
              <div className="flex items-center gap-2">
                <Input 
                  value={token} 
                  readOnly 
                  className="font-mono text-xs"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t.keepSecure}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm">
                {t.generateCli}
              </p>
              <Button 
                variant="outline" 
                onClick={handleGetToken} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Terminal className="h-4 w-4 mr-2" />
                )}
                {t.getCliToken}
              </Button>
            </div>
          )}
        </div>
        
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          onClick={handleResetToken}
          disabled={isLoading}
          className="flex items-center gap-2 ml-auto"
        >
          <RefreshCw className="h-4 w-4" />
          {t.resetToken}
        </Button>
      </CardFooter>
    </Card>
  )
} 