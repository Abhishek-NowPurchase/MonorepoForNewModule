import { authenticatedApiCall } from '../apiUtils';

// Raw Material API endpoints
const RAW_MATERIAL_ENDPOINTS = {
  ITEM_INVENTORY: '/api/s/item_inventory/',
} as const;

// Item Inventory API - automatically gets token from localStorage
export const getItemInventory = async (pageSize: number = 150) => {
  return authenticatedApiCall(`${RAW_MATERIAL_ENDPOINTS.ITEM_INVENTORY}?page_size=${pageSize}`, { 
    method: 'GET'
  });
};
