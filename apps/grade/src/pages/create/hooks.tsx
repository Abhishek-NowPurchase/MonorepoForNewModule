import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useFormConfig, useSections } from "@dynamic_forms/react";
import {
  gradeConfigurationModel,
  gradeConfigurationSectionedModel,
} from "./modal";
import {
  getGradeCategory,
  getItemInventory,
} from "../../../../shared/Api/rawMaterial";
import { getElements } from "../../../../shared/Api/elements";
import { getGradeTagId, createGrade, updateGrade, getGrade } from "./api";
import { useApiDataManager } from "./apiOptions";

export const useUserDetail = () => {
  return useSelector((state: any) => state.userDetail || {});
};

export const useCustomerId = (): number => {
  const userDetail = useSelector((state: any) => state.userDetail);
  return userDetail?.customer?.id || 243;
};

export const useCustomer = () => {
  const userDetail = useSelector((state: any) => state.userDetail);
  return userDetail?.customer || null;
};

export const useIsAuthenticated = (): boolean => {
  const auth = useSelector((state: any) => state.auth);
  return !!auth?.token && !!auth?.isLoggedIn;
};

const autoSelectFirstOption = (
  data: any,
  dataKey: string,
  fieldKey: string,
  valueField: string,
  form: any
) => {
  const fieldData = data[dataKey];
  if (fieldData && Array.isArray(fieldData) && fieldData.length > 0) {
    const firstValue = fieldData[0][valueField];
    const currentValue = form.values[fieldKey];

    if (!currentValue || currentValue !== firstValue) {
      form.setValue(fieldKey, firstValue);
    }
  }
};

const fixExistingMaterials = (items: any[], inventoryData: any, fieldName: string, form: any) => {
  if (!inventoryData?.results) return;

  const fixedItems = items.map((item: any) => {
    // Check if we have a materialId to look up (for edit case) or if material is a number (for create case)
    const materialIdToLookup = item.materialId || (typeof item.material === "number" ? item.material : null);
    
    if (materialIdToLookup) {
      const materialObj = inventoryData.results.find((m: any) => m.id == materialIdToLookup);
      if (materialObj) {
        return {
          ...item,
          material: materialObj.name,
          materialId: materialIdToLookup,
          materialSlug: materialObj.slug || "",
          fullMaterialData: materialObj, // Store the complete material object from inventory API
          minPercent: item.minPercent ?? 0, // Ensure minPercent defaults to 0
          maxPercent: item.maxPercent ?? 0, // Ensure maxPercent defaults to 0
        };
      }
    }
    return item;
  });

  const hasChanges = fixedItems.some(
    (item: any, index: number) => item.material !== items[index]?.material
  );

  if (hasChanges) {
    form.setValue(fieldName, fixedItems);
  }
};

const fixExistingElements = (items: any[], elementsData: any[], form: any) => {
  if (!elementsData || !Array.isArray(elementsData)) return;

  const fixedItems = items.map((item: any) => {
    if (typeof item.element === "number" || /^\d+$/.test(item.element)) {
      const elementObj = elementsData.find((el: any) => el.id == item.element);
      if (elementObj) {
        return {
          ...item,
          element: elementObj.symbol,
          elementId: item.element,
          elementName: elementObj.name || "",
        };
      }
    }
    return item;
  });

  const hasChanges = fixedItems.some(
    (item: any, index: number) => item.element !== items[index]?.element
  );

  if (hasChanges) {
    form.setValue("targetChemistry", fixedItems);
  }
};

export const useGradeCreateForm = (initialValues: any = {}, gradeId?: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const customerId = useCustomerId();
  const userDetail = useUserDetail();
  
  // Store userDetail on window for access in modal configuration
  useEffect(() => {
    (window as any).userDetail = userDetail;
  }, [userDetail]);
  
  const form = useFormConfig(gradeConfigurationModel, {
    initialValues,
    enableValidation: true,
    enableDependencies: true,
    enableAnalytics: true,
  });

  const sections = useSections(gradeConfigurationSectionedModel, form as any, {
    autoHideEmptySections: true,
  });

  const { data, loading, error } = useApiDataManager([
    {
      key: "gradeCategory",
      apiFunction: getGradeCategory,
    },
    {
      key: "elements",
      apiFunction: getElements,
    },
    {
      key: "itemInventory",
      apiFunction: getItemInventory,
    },
    // Only fetch gradeTagId for create operations, not edit operations
    ...(gradeId ? [] : [{
      key: "gradeTagId",
      apiFunction: getGradeTagId,
    }]),
  ]);


  useEffect(() => {
    autoSelectFirstOption(data, "gradeCategory", "gradeType", "symbol", form);
  }, [(data as any).gradeCategory]);

  useEffect(() => {
    // Only fetch and set grade tag ID for create operations, not edit operations
    if (!gradeId && (data as any).gradeTagId && (data as any).gradeTagId.new_tag_id) {
      form.setValue("tagId", (data as any).gradeTagId.new_tag_id);
    }
  }, [(data as any).gradeTagId, gradeId]);

  useEffect(() => {
    if ((data as any).itemInventory && form.values.rawMaterials) {
      const itemInventoryData = (window as any).itemInventoryData;
      fixExistingMaterials(form.values.rawMaterials as any[], itemInventoryData, "rawMaterials", form);
    }
  }, [(data as any).itemInventory, form.values.rawMaterials]);

  useEffect(() => {
    if ((data as any).itemInventory && form.values.chargemixMaterials) {
      const itemInventoryData = (window as any).itemInventoryData;
      fixExistingMaterials(form.values.chargemixMaterials as any[], itemInventoryData, "chargemixMaterials", form);
    }
  }, [(data as any).itemInventory, form.values.chargemixMaterials]);

  useEffect(() => {
    if ((data as any).elements && form.values.targetChemistry) {
      const elementsData = (window as any).elementsData;
      fixExistingElements(form.values.targetChemistry as any[], elementsData, form);
    }
  }, [(data as any).elements, form.values.targetChemistry]);

  // Fetch grade data when in edit mode
  useEffect(() => {
    const fetchGradeData = async () => {
      if (gradeId) {
        try {
          const gradeData = await getGrade(gradeId);
          
          // Transform API response to form values
          const formValues = {
            tagId: gradeData.grade_tag_id,
            gradeName: gradeData.name,
            gradeCode: gradeData.grade_code,
            gradeCategory: gradeData.grade_category?.id,
            gradeType: gradeData.grade_category?.symbol,
            pouringTime: parseFloat(gradeData.pouring_time),
            tappingTempMin: gradeData.temperature_min ? parseFloat(gradeData.temperature_min) : null,
            tappingTempMax: gradeData.temperature_max ? parseFloat(gradeData.temperature_max) : null,
            mgTreatmentTime: gradeData?.pouring_time ? parseFloat(gradeData.pouring_time) : null, // Map pouring_time to mgTreatmentTime
            mgInFesimg: gradeData.mg_in_fesimg,
            bathChemistry: gradeData.has_bath_chemistry ? 'with' : 'without',
            gradeTagId: gradeData.grade_tag_id,
            rememberChoice: false, // This is a client-side preference, not from API
          };
          
          // Set form values
          Object.entries(formValues).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              form.setValue(key, value);
            }
          });
          
          // Transform target chemistry data
          if (gradeData.grade_tc && Array.isArray(gradeData.grade_tc)) {
            const targetChemistry = gradeData.grade_tc.map((tc: any) => ({
              element: tc.element__symbol,
              elementId: tc.element,
              elementName: tc.element__symbol, // We'll get the full name from elements data
              bathMin: tc.min ? parseFloat(tc.min) : '',
              bathMax: tc.max ? parseFloat(tc.max) : '',
              finalMin: tc.relaxed_min ? parseFloat(tc.relaxed_min) : '',
              finalMax: tc.relaxed_max ? parseFloat(tc.relaxed_max) : '',
              isDefault: false,
            }));
            form.setValue('targetChemistry', targetChemistry);
            
            // Transform addition elements from target chemistry
            const additionElements = gradeData.grade_tc.map((tc: any) => ({
              element: tc.element__symbol,
              selected: true,
            }));
            form.setValue('additionElements', additionElements);
          }
          
          // Transform raw materials data
          if (gradeData.grade_item && Array.isArray(gradeData.grade_item)) {
            const rawMaterials = gradeData.grade_item.map((item: any) => ({
              element: item.item_name,
              elementId: item.item,
              minPercent: item.min_qty ? parseFloat(item.min_qty) : 0,
              maxPercent: item.max_qty ? parseFloat(item.max_qty) : 0,
              category: item.item_type,
              fullMaterialData: null, // This will be populated by fixExistingMaterials later
            }));
            form.setValue('rawMaterials', rawMaterials);
          }
          
          // Transform chargemix materials data
          if (gradeData.grade_cms && Array.isArray(gradeData.grade_cms)) {
            const chargemixMaterials = gradeData.grade_cms.map((item: any) => ({
              material: item.item_name,
              materialId: item.item,
              minPercent: item.min_qty ? parseFloat(item.min_qty) : 0,
              maxPercent: item.max_qty ? parseFloat(item.max_qty) : 0,
              fullMaterialData: null, // This will be populated by fixExistingMaterials later
            }));
            form.setValue('chargemixMaterials', chargemixMaterials);
          }
          
          // Transform tolerance settings (if available)
          if (gradeData.tolerance_settings && Array.isArray(gradeData.tolerance_settings)) {
            form.setValue('toleranceSettings', gradeData.tolerance_settings);
          }
          
        } catch (error) {
          console.error('Error fetching grade data:', error);
        }
      }
    };
    
    fetchGradeData();
  }, [gradeId]);

  const handleSubmit = form.handleSubmit(async (values: any) => {
    
    setIsSubmitting(true);
    try {
      // Use updateGrade if gradeId exists (edit mode), otherwise use createGrade (create mode)
      const result = gradeId 
        ? await updateGrade(gradeId, values, customerId)
        : await createGrade(values, customerId);
      
      // ✅ SUCCESS INDICATOR: Check for id and grade_tag_id
      if (result.id && result.grade_tag_id) {
        // Redirect to /grades
        window.location.href = '/grades';
      }
      
      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  });

  return {
    form,
    sections,
    handleSubmit,
    loading,
    error,
    isSubmitting,
  };
};
