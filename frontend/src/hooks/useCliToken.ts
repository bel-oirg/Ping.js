import { useState } from 'react';
import { dashboardService } from '@/lib/api';
import { handleApiError } from '@/utils/errorHandler';

export function useCliToken() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getCliToken = async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await dashboardService.getCliToken();
      
      if (!response.status.success || !response.data) {
        throw new Error(response.status.message || 'Failed to get CLI token');
      }
      
      return response.data.token || null;
    } catch (err) {
      const errorMessage = handleApiError(err, 'CLI Token');
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetCliToken = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await dashboardService.resetCliToken();
      
      if (!response.status.success) {
        throw new Error(response.status.message || 'Failed to reset CLI token');
      }
      
      return true;
    } catch (err) {
      const errorMessage = handleApiError(err, 'CLI Token Reset');
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCliToken = async (code: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await dashboardService.verifyCliToken(code);
      
      if (!response.status.success) {
        throw new Error(response.status.message || 'Failed to verify CLI token');
      }
      
      return true;
    } catch (err) {
      const errorMessage = handleApiError(err, 'CLI Token Verification');
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    getCliToken,
    resetCliToken,
    verifyCliToken
  };
} 