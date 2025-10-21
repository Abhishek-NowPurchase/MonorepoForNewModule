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
import { getGradeTagId, createGrade } from "./api";
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
    if (typeof item.material === "number" || /^\d+$/.test(item.material)) {
      const materialObj = inventoryData.results.find((m: any) => m.id == item.material);
      if (materialObj) {
        return {
          ...item,
          material: materialObj.name,
          materialId: item.material,
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

export const useGradeCreateForm = (initialValues: any = {}) => {
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
    {
      key: "gradeTagId",
      apiFunction: getGradeTagId,
    },
  ]);


  useEffect(() => {
    autoSelectFirstOption(data, "gradeCategory", "gradeType", "symbol", form);
  }, [(data as any).gradeCategory]);

  useEffect(() => {
    if ((data as any).gradeTagId && (data as any).gradeTagId.new_tag_id) {
      form.setValue("tagId", (data as any).gradeTagId.new_tag_id);
    }
  }, [(data as any).gradeTagId]);

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

  const handleSubmit = form.handleSubmit(async (values: any) => {
    console.log('🚀 Form submitted with values:', values);
    console.log('📊 Tolerance Settings:', values.toleranceSettings);
    
    // 🔍 DEBUG LOG: Addition/Dilution Fields
    console.log('🔍 [SUBMIT] Addition/Dilution Fields:', {
      additionElements: values.additionElements,
      rawMaterials: values.rawMaterials,
      selectedAdditionElement: values.selectedAdditionElement,
      elementMinPercent: values.elementMinPercent,
      elementMaxPercent: values.elementMaxPercent,
      // These should NOT exist:
      rawMaterialMinPercent: values.rawMaterialMinPercent,
      rawMaterialMaxPercent: values.rawMaterialMaxPercent,
    });
    
    setIsSubmitting(true);
    try {
      const result = await createGrade(values, customerId);
      console.log('✅ Grade created successfully:', result);
      
      // ✅ SUCCESS INDICATOR: Check for id and grade_tag_id
      if (result.id && result.grade_tag_id) {
        console.log('🎉 Grade created successfully!');
        console.log(`   Grade ID: ${result.id}`);
        console.log(`   Tag ID: ${result.grade_tag_id}`);
        console.log(`   Name: ${result.name}`);
        
        // Redirect to /grades
        window.location.href = '/grades';
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error creating grade:', error);
      
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
