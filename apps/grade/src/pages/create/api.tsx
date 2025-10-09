import { apiFetch } from '../../../../shared/Api/apiUtils';
import { getToken } from '../../../../shared/Api/tokenUtils';

interface MaterialRecoveryRate {
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
}

interface MaterialGrade {
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
}

interface MaterialItem {
  id?: number;
  customer: number;
  name: string;
  variant_name: string | null;
  item_rr: MaterialRecoveryRate[];
  item_grade: MaterialGrade[];
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
}

interface TargetChemistryElement {
  element: number;
  name: string;
  element__symbol: string;
  losses: string;
  min: string;
  relaxed_min: string;
  max: string;
  relaxed_max: string;
}

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
  grade_tc: TargetChemistryElement[];
  grade_item: MaterialItem[];
  grade_cms: MaterialItem[];
  customer: number;
  has_nodularization: boolean;
  carbon_loss: string;
  inventory_item: any[];
  addition_tc: any[];
}

interface GradeFormData {
  gradeName?: string;
  gradeCode?: string;
  gradeCategory?: number;
  pouringTime?: number;
  tappingTempMin?: number;
  tappingTempMax?: number;
  mgInFesimg?: string;
  gradeTypeName?: string;
  bathChemistry?: 'with' | 'without';
  gradeTagId?: string;
  targetChemistry?: TargetChemistryFormItem[];
  rawMaterials?: MaterialFormItem[];
  chargemixMaterials?: MaterialFormItem[];
}

interface TargetChemistryFormItem {
  elementId: number;
  elementName: string;
  element: string;
  bathMin?: number;
  bathMax?: number;
  finalMin?: number;
  finalMax?: number;
}

interface MaterialFormItem {
  material: string;
  materialId: number;
  materialSlug: string;
  minPercent: number;
  maxPercent: number;
  fullMaterialData?: MaterialItem;
}


const GRADE_ENDPOINTS = {
  TAG_ID: '/api/cm/metalgrade/gen_grade_tag_id/',
  CREATE_GRADE: '/api/c/grades_add_api/',
} as const;


const validateMaterialData = (materials: MaterialFormItem[], type: string): void => {
  const missingData = materials.filter(item => !item.fullMaterialData);
  
  if (missingData.length > 0) {
    console.error(`❌ ${type} materials missing fullMaterialData:`, missingData);
    throw new Error(
      `Some ${type} materials are missing required inventory data. Please refresh and try again.`
    );
  }
};


const transformTargetChemistry = (
  targetChemistry: TargetChemistryFormItem[] = []
): TargetChemistryElement[] => {
  return targetChemistry
    .filter((item) => item.elementId && item.elementId > 0)
    .map((item) => {
      const min = parseFloat(item.bathMin?.toString() || '0');
      const max = parseFloat(item.bathMax?.toString() || '0');
      const relaxedMin = parseFloat(item.finalMin?.toString() || '0');
      const relaxedMax = parseFloat(item.finalMax?.toString() || '0');
      
      let validMin = min;
      let validMax = max;
      let validRelaxedMin = relaxedMin;
      let validRelaxedMax = relaxedMax;
      
      if (min > max && max > 0) {
        validMin = max;
      }
      
      if (relaxedMin > relaxedMax && relaxedMax > 0) {
        validRelaxedMin = relaxedMax;
      }
      
      if (validRelaxedMin > validMin && validMin > 0) {
        validRelaxedMin = validMin;
      }
      
      if (validMax > validRelaxedMax && validRelaxedMax > 0) {
        validRelaxedMax = validMax;
      }
      
      return {
        element: item.elementId,
        name: item.elementName || '',
        element__symbol: item.element || '',
        losses: '',
        min: validMin > 0 ? validMin.toString() : '',
        relaxed_min: validRelaxedMin > 0 ? validRelaxedMin.toString() : '',
        max: validMax > 0 ? validMax.toString() : '',
        relaxed_max: validRelaxedMax > 0 ? validRelaxedMax.toString() : '',
      };
    });
};

const transformMaterials = (
  materials: MaterialFormItem[] = [],
  materialType: string
): MaterialItem[] => {
  return materials
    .map((item) => {
      if (item.fullMaterialData) {
        return {
          ...item.fullMaterialData,
          item: item.materialId,
          min_qty: parseFloat(item.minPercent?.toString() || '0') || null,
          max_qty: parseFloat(item.maxPercent?.toString() || '0') || null,
        };
      }
      
      console.error(`❌ Missing fullMaterialData for ${materialType}:`, item.material, item);
      return null;
    })
    .filter((item): item is MaterialItem => item !== null);
};

const transformFormDataToPayload = (formData: GradeFormData, customerId: number): GradeCreationPayload => {
  if (formData.rawMaterials && formData.rawMaterials.length > 0) {
    validateMaterialData(formData.rawMaterials, 'Raw');
  }
  
  if (formData.chargemixMaterials && formData.chargemixMaterials.length > 0) {
    validateMaterialData(formData.chargemixMaterials, 'Chargemix');
  }

  return {
    created_at: Date.now(),
    customer: customerId,
    name: formData.gradeName || '',
    grade_code: formData.gradeCode || '',
    grade_category: formData.gradeCategory || 1,
    gradeTypeName: formData.gradeTypeName || 'Ductile Iron',
    grade_tag_id: formData.gradeTagId || '',
    pouring_time: formData.pouringTime?.toString() || '1.00',
    temperature_min: formData.tappingTempMin?.toString() || '',
    temperature_max: formData.tappingTempMax?.toString() || '',
    mg_in_fesimg: formData.mgInFesimg || '',
    has_bath_chemistry: formData.bathChemistry === 'with',
    pit_tc_same_as_ladle: false,
    has_nodularization: false,
    grade_tc: transformTargetChemistry(formData.targetChemistry),
    grade_item: transformMaterials(formData.rawMaterials || [], 'raw material'),
    grade_cms: transformMaterials(formData.chargemixMaterials || [], 'chargemix material'),
    carbon_loss: '0.00',
    inventory_item: [],
    addition_tc: [],
    add_dil_inactive_elements: [],
  };
};

export const getGradeTagId = async (): Promise<any> => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  const result = await apiFetch(GRADE_ENDPOINTS.TAG_ID, token, { 
    method: 'GET',
    headers: { 
      'authorization': `Token ${token}` 
    }
  });
  
  return result;
};

export const createGrade = async (formData: GradeFormData, customerId: number = 243): Promise<any> => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  const payload = transformFormDataToPayload(formData, customerId);
  
  const result = await apiFetch(GRADE_ENDPOINTS.CREATE_GRADE, token, { 
    method: 'POST',
    body: payload,
    headers: { 
      'authorization': `Token ${token}` 
    }
  });
  
  return result;
};
