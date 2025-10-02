/**
 * Utility for storing and retrieving user profile data securely
 */

import { UserCard } from '@/types/Dashboard';
import { toast } from 'sonner';

const PROFILE_STORAGE_KEY = 'blackhole_user_profile';
const INTEGRITY_KEY = 'blackhole_profile_integrity';

interface StoredProfile {
  id: number;
  username: string;
  avatar: string | null;
  timestamp: number;
}

/**
 * Generate a simple integrity hash for profile data
 * Using a more reliable and stable approach
 */
const generateIntegrityHash = (data: StoredProfile): string => { 
  const stablePayload = `${data.id}:${data.username}`;
  
  // Simple stable hash function
  let hash = 0;
  for (let i = 0; i < stablePayload.length; i++) {
    const char = stablePayload.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return hash.toString(36);
};

/**
 * Store essential user profile data in sessionStorage with integrity check
 */
export const storeProfileData = (data: UserCard): void => {
  if (!data || !data.User) return;
  
  const profileData: StoredProfile = {
    id: data.User.id,
    username: data.User.username,
    avatar: data.User.avatar,
    timestamp: Date.now()
  };
  
  try {
    const integrityHash = generateIntegrityHash(profileData);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));
    localStorage.setItem(INTEGRITY_KEY, integrityHash);
  } catch (error) {
    toast.error('Failed to store profile data');
  }
};




/**
 * Get stored profile data from sessionStorage with integrity verification
 */
export const getStoredProfile = (): StoredProfile | null => {
  try {
    const data = localStorage.getItem(PROFILE_STORAGE_KEY);
    const storedHash = localStorage.getItem(INTEGRITY_KEY);
    
    if (!data || !storedHash) return null;
    
    const profileData = JSON.parse(data) as StoredProfile;
    const calculatedHash = generateIntegrityHash(profileData);    
    if (calculatedHash !== storedHash) {
      console.warn('Profile data integrity check failed');
      clearProfileData();
      return null;
    }
    
    return profileData;
  } catch (error) {
    toast.error('Failed to retrieve profile data');
    return null;
  }
};

/**
 * Check if stored profile data is still valid (based on integrity only)
 */
export const isProfileDataValid = (): boolean => {
  try {
    const data = localStorage.getItem(PROFILE_STORAGE_KEY);
    const storedHash = localStorage.getItem(INTEGRITY_KEY);
    if (!data || !storedHash) return false;
    const profileData = JSON.parse(data) as StoredProfile;
    const calculatedHash = generateIntegrityHash(profileData);    
    return calculatedHash === storedHash;
  } catch (error) {
    toast.error('Failed to validate profile data');
    return false;
  }
};

/**
 * Clear stored profile data
 */
export const clearProfileData = (): void => {
  try {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    localStorage.removeItem(INTEGRITY_KEY);
  } catch (error) {
    toast.error('Failed to clear profile data');
  }
}; 

/**
 * Refresh profile data: clear, fetch, store, and notify
 */
export const refreshProfileData = async (user: UserCard) => {
  clearProfileData();
  try {
    if (user) {
      storeProfileData(user);
      window.dispatchEvent(new Event('profile-updated'));
      toast.success('Profile data refreshed successfully');
    }
  } catch (error) {
    toast.error('Failed to refresh profile data');
  }
};

/*
*/