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
import { autoSelectFirstOption, fixExistingMaterials, fixExistingElements,useApiDataManager } from "./utils";

export const useUserDetail = () => {
  return useSelector((state: any) => state.userDetail || {});
};

export const useCustomerId = (): number => {
  const userDetail = useSelector((state: any) => state.userDetail);
  return userDetail?.customer?.id;
};

export const useCustomer = () => {
  const userDetail = useSelector((state: any) => state.userDetail);
  return userDetail?.customer || null;
};

export const useIsAuthenticated = (): boolean => {
  const auth = useSelector((state: any) => state.auth);
  return !!auth?.token && !!auth?.isLoggedIn;
};




export const useGradeCreateForm = (initialValues: any = {}, gradeId?: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const customerId = useCustomerId();
  const userDetail = useUserDetail();

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

          // Transform target chemistry data (edit prefill normalization)
          const gradeTc: any[] = Array.isArray(gradeData.grade_tc) ? gradeData.grade_tc : [];
          const bathTc: any[] = Array.isArray(gradeData.bath_tc) ? gradeData.bath_tc : [];
          let tolArr: any[] = Array.isArray(gradeData.tolerance_settings) ? gradeData.tolerance_settings : [];

          // Build quick lookups
          const gradeByElementId: Record<number, any> = {};
          gradeTc.forEach((tc: any) => { if (tc && typeof tc.element === 'number') gradeByElementId[tc.element] = tc; });

          const bathByElementId: Record<number, any> = {};
          bathTc.forEach((tc: any) => { if (tc && typeof tc.element === 'number') bathByElementId[tc.element] = tc; });

          // If API doesn't return tolerance_settings, fallback to grade_tc.relaxed_min/relaxed_max
          if (!tolArr.length && gradeTc.length) {
            tolArr = gradeTc.map((tc: any) => ({
              element: tc.element__symbol,
              elementId: tc.element,
              toleranceMin: tc.relaxed_min ?? '',
              toleranceMax: tc.relaxed_max ?? '',
            }));
          }

          const toleranceByElementId: Record<number, { toleranceMin?: number | string; toleranceMax?: number | string }> = {};
          tolArr.forEach((t: any) => { if (t && typeof t.elementId === 'number') toleranceByElementId[t.elementId] = { toleranceMin: t.toleranceMin, toleranceMax: t.toleranceMax }; });

          const allElementIds = Array.from(new Set([...Object.keys(gradeByElementId), ...Object.keys(bathByElementId)].map(Number)));

          if (allElementIds.length) {
            const targetChemistry = allElementIds.map((elementId) => {
              const g = gradeByElementId[elementId];
              const b = bathByElementId[elementId];
              const symbol = (g?.element__symbol || b?.element__symbol || '').toString();
              const name = (g?.name || b?.name || symbol) || '';
              const tol = toleranceByElementId[elementId] || {};

              return {
                element: symbol,
                elementId,
                elementName: name,
                bathMin: gradeData.has_bath_chemistry && b && b.min !== undefined && b.min !== null && b.min !== '' ? parseFloat(b.min) : '',
                bathMax: gradeData.has_bath_chemistry && b && b.max !== undefined && b.max !== null && b.max !== '' ? parseFloat(b.max) : '',
                finalMin: g && g.min !== undefined && g.min !== null && g.min !== '' ? parseFloat(g.min) : '',
                finalMax: g && g.max !== undefined && g.max !== null && g.max !== '' ? parseFloat(g.max) : '',
                toleranceMin: tol.toleranceMin !== undefined && tol.toleranceMin !== null ? tol.toleranceMin : '',
                toleranceMax: tol.toleranceMax !== undefined && tol.toleranceMax !== null ? tol.toleranceMax : '',
                isDefault: symbol === 'C',
              };
            });
            form.setValue('targetChemistry', targetChemistry);

            // Addition elements default to selected for all present elements
            const additionElements = targetChemistry.map((row: any) => ({ element: row.element, selected: true }));
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

          // Normalize and set tolerance settings for edit
          if (Array.isArray(tolArr)) {
            const normalizedTolerance = allElementIds.map((elementId) => {
              const g = gradeByElementId[elementId];
              const symbol = (g?.element__symbol || '').toString();
              const tol = toleranceByElementId[elementId] || {};
              return {
                element: symbol,
                elementId,
                toleranceMin: tol.toleranceMin !== undefined && tol.toleranceMin !== null ? tol.toleranceMin : '',
                toleranceMax: tol.toleranceMax !== undefined && tol.toleranceMax !== null ? tol.toleranceMax : '',
              };
            });
            form.setValue('toleranceSettings', normalizedTolerance);
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
      const result = gradeId
        ? await updateGrade(gradeId, values, customerId)
        : await createGrade(values, customerId);

      if (result.id && result.grade_tag_id) {
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
