import { apiFetch } from '../apiUtils';
import { getToken } from '../tokenUtils';

// Raw Material API endpoints
const RAW_MATERIAL_ENDPOINTS = {
  ITEM_INVENTORY: '/api/s/item_inventory/',
} as const;

// Item Inventory API - automatically gets token from localStorage
export const getItemInventory = async (pageSize: number = 150) => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  return apiFetch(`${RAW_MATERIAL_ENDPOINTS.ITEM_INVENTORY}?page_size=${pageSize}`, token, { 
    method: 'GET',
    headers: { 'authorization': `Token ${token}` }
  });
};
