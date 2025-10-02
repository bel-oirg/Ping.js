import { useState } from 'react';
import { dashboardService } from '@/lib/api';
import { toast } from 'sonner';

interface UseTwoFactorReturn {
  isLoading: boolean;
  error: string | null;
  getQRCode: () => Promise<string | null>;
  verifySetup: (code: string) => Promise<boolean>;
  verifyDisable: (code: string) => Promise<boolean>;
  updateStatus: (enabled: boolean) => Promise<boolean>;
}

export function useTwoFactor(): UseTwoFactorReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getQRCode = async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await dashboardService.getTwoFactorQR();
      if (response.status.success && response.data?.qrCode) {
        return response.data.qrCode;
      } else {
        setError(response.status.message || 'Failed to get QR code');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get QR code';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const verifySetup = async (code: string): Promise<boolean> => {
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setError('Verification code must be 6 digits');
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await dashboardService.verifyTwoFactorSetup(code);
      if (response.status.success && response.data?.verified) {
        toast.success('Two-factor authentication verified successfully');
        return true;
      } else {
        setError(response.status.message || 'Invalid verification code');
        toast.error('Invalid verification code');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyDisable = async (code: string): Promise<boolean> => {
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setError('Verification code must be 6 digits');
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await dashboardService.verifyTwoFactorCode(code);
      if (response.status.success) {
        return true;
      } else {
        setError(response.status.message || 'Invalid verification code');
        toast.error('Invalid verification code');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (enabled: boolean): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await dashboardService.updateTwoFactorStatus(enabled ? 1 : 0);
      if (response.status.success) {
        toast.success(`Two-factor authentication ${enabled ? 'enabled' : 'disabled'}`);
        return true;
      } else {
        setError(response.status.message || `Failed to ${enabled ? 'enable' : 'disable'} 2FA`);
        toast.error(`Failed to ${enabled ? 'enable' : 'disable'} 2FA`);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${enabled ? 'enable' : 'disable'} 2FA`;
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    getQRCode,
    verifySetup,
    verifyDisable,
    updateStatus
  };
} 