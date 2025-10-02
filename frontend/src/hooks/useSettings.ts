import { useState, useCallback } from 'react';
import { dashboardService } from '@/lib/api';
import { handleApiError } from '@/utils/errorHandler';
import { toast } from 'sonner';
import { 
  EditProfileRequest, 
  ChangePasswordRequest, 
  UserCard, 
  UserData,
  UseSettingsProps,
  UseSettingsReturn
} from '@/types/Dashboard';

export function useSettings({ onSuccess }: UseSettingsProps = {}): UseSettingsReturn {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await dashboardService.getCard();
      
      if (!response.status.success || !response.data) {
        throw new Error(response.status.message);
      }
      
      const userCardData = response.data;        
      setUserData({
        first_name: userCardData.User.first_name || '',
        last_name: userCardData.User.last_name || '',
        username: userCardData.User.username,
        email: userCardData.User.email,
        avatar: userCardData.User.avatar || '',
        is_oauth: userCardData.User.is_oauth,
        is_otp_active: userCardData.User.is_otp || false
      });
    } catch (err) {
      const errorMessage = handleApiError(err, 'Settings');
      setError(errorMessage);
      toast.error('Settings error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = async (data: EditProfileRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await dashboardService.editProfile(data);
      
      if (!response.status.success) {
        throw new Error(response.status.message);
      }
      
      await fetchUserData();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = handleApiError(err, 'Profile Update');
      setError(errorMessage);
      toast.error('Profile update error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (data: ChangePasswordRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await dashboardService.changePassword(data);
      
      if (!response.status.success) {
        throw new Error(response.status.message);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = handleApiError(err, 'Password Change');
      setError(errorMessage);
      toast.error('Password change error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    userData,
    isLoading,
    error,
    updateProfile,
    changePassword,
    fetchUserData
  };
} 