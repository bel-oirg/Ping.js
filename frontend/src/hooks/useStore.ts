import { useState, useCallback, useEffect } from 'react';
import { DashboardService } from '@/lib/api/DashboardService';
import { BuyItemRequest, InventoryItem, StoreItemsResponse, InventoryResponse, ItemType } from '@/types/Store';
import { toast } from 'sonner';
import { useLang } from '@/context/langContext';
import en from '@/i18n/en';
import fr from '@/i18n/fr';
import storeItems from '@/constants/storeItems';
import { useWallet } from '@/context/walletContext';

export interface UseStoreReturn {
  storeItems: StoreItemsResponse;
  inventory: InventoryItem[];
  isLoading: boolean;
  error: string | null;
  buyItem: (data: BuyItemRequest) => Promise<boolean>;
  fetchInventory: () => Promise<void>;
  equipItem: (data: BuyItemRequest) => Promise<boolean>;
}

export const useStore = (): UseStoreReturn => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { lang } = useLang();
  const { updateBudget } = useWallet();
  const t = lang === 'en' ? en.store : fr.store;
  
  const dashboardService = new DashboardService();
  
  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await dashboardService.getInventory();
      
      if (response.status.success) {
        if (response.data?.inventory) {
          // Normalize is_equipped to boolean
          const normalizedInventory = response.data.inventory.map(item => ({
            ...item,
            is_equipped: item.is_equipped === true || item.is_equipped === 'true',
            item_type: item.item_type.toString(), // keep as string for comparison
          }));
          setInventory(normalizedInventory);
        } else {
          setInventory([]);
        }        
        if (response.data?.coins !== undefined) {
          updateBudget(response.data.coins);
        }
      } else {
        setError(response.status.message || t.fetchFailed);
        toast.error(response.status.message || t.fetchFailed);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t.fetchFailed;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [t, updateBudget]);
  
  const buyItem = useCallback(async (data: BuyItemRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Ensure item_type is sent as a number
      const payload = {
        ...data,
        item_type: Number(data.item_type),
        item_id: data.item_id,
      };
      const response = await dashboardService.buyItem(payload);
      if (response.status.success) {
        toast.success(t.purchaseSuccess);
        await fetchInventory(); // Refresh inventory after purchase
        return true;
      } else {
        setError(response.status.message || t.purchaseFailed);
        toast.error(response.status.message || t.purchaseFailed);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t.purchaseFailed;
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchInventory, t, dashboardService]);

  const equipItem = useCallback(async (data: BuyItemRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    // Check if the item is already equipped
    const isAlreadyEquipped = inventory.some(item => 
      item.item_id === data.item_id && 
      item.item_type === data.item_type && 
      item.is_equipped
    );
    
    if (isAlreadyEquipped) {
      setIsLoading(false);
      toast.info(t.alreadyEquipped || 'This item is already equipped');
      return false;
    }
    
    try {
      // Ensure item_type is sent as a number
      const payload = {
        ...data,
        item_type: Number(data.item_type),
        item_id: data.item_id,
      };
      const response = await dashboardService.equipItem(payload);
      
      if (response.status.success) {
        toast.success(t.equipSuccess || 'Item equipped successfully');
        
        if (payload.item_type === ItemType.AVATAR) {
          try {
            const avatarItem = storeItems.avatars.find(avatar => avatar.id.toString() === data.item_id);
            if (avatarItem) {
              const userProfileKey = 'blackhole_user_profile';
              const userProfileStr = localStorage.getItem(userProfileKey);
              
              if (userProfileStr) {
                const userProfile = JSON.parse(userProfileStr);
                userProfile.avatar = avatarItem.image_path;
                userProfile.timestamp = Date.now();
                localStorage.setItem(userProfileKey, JSON.stringify(userProfile));
              }
            }
          } catch (err) {
            // Only log if needed, no console output in production
          }
        }
        
        await fetchInventory(); // Refresh inventory after equipping
        return true;
      } else {
        setError(response.status.message || t.equipFailed || 'Failed to equip item');
        toast.error(response.status.message || t.equipFailed || 'Failed to equip item');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t.equipFailed || 'Failed to equip item';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchInventory, t, dashboardService, inventory, storeItems.avatars]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);
  
  return {
    storeItems,
    inventory,
    isLoading,
    error,
    buyItem,
    fetchInventory,
    equipItem
  };
}; 