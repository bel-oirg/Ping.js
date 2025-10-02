'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import Image from 'next/image'
import { toast } from 'sonner'
import { useTwoFactor } from '@/hooks/useTwoFactor'
import { useLang } from '@/context/langContext'
import en from '@/i18n/en'
import fr from '@/i18n/fr'
import React from "react"

interface TwoFactorSettingsProps {
  isEnabled?: boolean
  isOAuthAccount?: boolean
}

export function TwoFactorSettings({ isEnabled = false}: TwoFactorSettingsProps) {
  const { isLoading, error, getQRCode, verifySetup, updateStatus, verifyDisable } = useTwoFactor();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [setupStep, setSetupStep] = useState<'initial' | 'qrcode' | 'verify' | 'disable'>('initial');
  const [code, setCode] = useState('');
  const [isActive, setIsActive] = useState(isEnabled);
	const { lang } = useLang()
	const t = lang === 'en' ? en.settings : fr.settings
  const handleToggle = async (checked: boolean) => {
    if (checked && !isActive) {
      const qrCodeData = await getQRCode();
      if (qrCodeData) {
        setQrCode(qrCodeData);
        setSetupStep('qrcode');
      }
    } else if (!checked && isActive) {
      setSetupStep('disable');
    }
  }

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.error('Verification code must be 6 digits');
      return;
    }
    
    const success = await verifySetup(code);
    if (success) {
      const statusUpdated = await updateStatus(true);
      if (statusUpdated) {
        setIsActive(true);
        setSetupStep('initial');
        setCode('');
      }
    }
  }

  const handleDisable = async () => {
    if (code.length !== 6) {
      toast.error('Verification code must be 6 digits');
      return;
    }
    
    const success = await verifyDisable(code);
    if (success) {
      const statusUpdated = await updateStatus(false);
      if (statusUpdated) {
        setIsActive(false);
        setSetupStep('initial');
        setCode('');
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.twoFactor}</CardTitle>
        <CardDescription>
          {t.twoFactorDesc}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {setupStep === 'initial' && (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t.twoFactor}</p>
              <p className="text-sm text-muted-foreground">
                {isActive 
                  ? t.twoFactorOn 
                  : t.twoFactorOff}
              </p>
            </div>
            <Switch 
              checked={isActive} 
              onCheckedChange={handleToggle} 
              disabled={isLoading || setupStep !== 'initial'} 
            />
          </div>
        )}
        
        {setupStep === 'qrcode' && qrCode && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-center">
              {t.scanQr}
            </p>
            <div className="border p-4 rounded-lg">
              <Image src={qrCode} alt="QR Code" width={200} height={200} />
            </div>
            <Button variant={"secondary"} className='text:forground hover:bg-primary' onClick={() => setSetupStep('verify')}>
              {t.scannedQr}
            </Button>
          </div>
        )}
        
        {setupStep === 'verify' && (
          <div className="flex flex-col gap-4">
            <p className="text-sm">
              {t.enter6Digit}
            </p>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
              placeholder={t.enter6Digit}
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSetupStep('qrcode')}>
                {t.back}
              </Button>
              <Button variant={"secondary"} className='text:forground hover:bg-primary' onClick={handleVerify} disabled={isLoading}>
                {isLoading ? t.verifying : t.verify}
              </Button>
            </div>
          </div>
        )}

        {setupStep === 'disable' && (
          <div className="flex flex-col gap-4">
            <p className="text-sm">
              {t.enter6DigitDisable}
            </p>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
              placeholder={t.enter6DigitDisable}
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSetupStep('initial')}>
                {t.cancel}
              </Button>
              <Button variant={"secondary"} className='text:forground hover:bg-primary' onClick={handleDisable} disabled={isLoading}>
                {isLoading ? t.verifying : t.disable2fa}
              </Button>
            </div>
          </div>
        )}
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </CardContent>
    </Card>
  )
} 