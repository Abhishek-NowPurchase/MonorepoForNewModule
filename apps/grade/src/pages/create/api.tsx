import { apiFetch } from '../../../../shared/Api/apiUtils';
import { getToken } from '../../../../shared/Api/tokenUtils';

// Grade-specific API endpoints
const GRADE_ENDPOINTS = {
  TAG_ID: '/api/cm/metalgrade/gen_grade_tag_id/',
  CREATE_GRADE: '/api/c/grades_add_api/',
} as const;

// Generate Grade Tag ID API - automatically gets token from localStorage
export const getGradeTagId = async () => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }
  const result = await apiFetch(GRADE_ENDPOINTS.TAG_ID, token, { 
    method: 'GET',
    headers: { 'authorization': `Token ${token}` }
  });
  return result;
};

// Grade creation payload interface
export interface GradeCreationPayload {
  created_at: number;
  add_dil_inactive_elements: any[];
  name: string;
  grade_code: string;
  grade_category: number;
  pouring_time: string;
  temperature_min: string;
  temperature_max: string;
  mg_in_fesimg: string;
  gradeTypeName: string;
  has_bath_chemistry: boolean;
  grade_tag_id: string;
  pit_tc_same_as_ladle: boolean;
  grade_tc: Array<{
    element: number;
    name: string;
    element__symbol: string;
    losses: string;
    min: string;
    relaxed_min: string;
    max: string;
    relaxed_max: string;
  }>;
  grade_item: Array<{
    customer: number;
    name: string;
    variant_name: string | null;
    item_rr: Array<{
      id: number;
      element: number;
      element_symbol: string;
      composition: string;
      loss: string | null;
      recovery_rate: string | null;
      recovery_rate_p: string | null;
      min_rr: string | null;
      max_rr: string | null;
      created_at: string;
      modified_at: string;
    }>;
    item_grade: Array<{
      id: number;
      grade: number;
      grade_tag_id: string;
      grade_name: string;
      part_name: string;
      part_no: string;
      grade_category: number;
      min_qty: string | null;
      max_qty: string | null;
      created_at: string;
      modified_at: string;
    }>;
    cm_type: string;
    is_active: boolean;
    is_search_active: boolean;
    sku: string | null;
    stock: string;
    price: string | null;
    material_rr: string;
    sop: string;
    slug: string;
    qty_uom: string;
    min_qty: number | null;
    max_qty: number | null;
    category: number;
    subcategory: number;
    created_at: string;
    modified_at: string;
    item: number;
  }>;
  grade_cms: Array<any>; // Same structure as grade_item
  customer: number;
  has_nodularization: boolean;
  carbon_loss: string;
  inventory_item: any[];
  addition_tc: any[];
}

// Create Grade API - automatically gets token from localStorage
export const createGrade = async (gradeData: GradeCreationPayload) => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }
  const result = await apiFetch(GRADE_ENDPOINTS.CREATE_GRADE, token, { 
    method: 'POST',
    body: gradeData,
    headers: { 'authorization': `Token ${token}` }
  });
  return result;
};
