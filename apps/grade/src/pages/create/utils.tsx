import { MaterialFormItem, MaterialItem, TargetChemistryElement, TargetChemistryFormItem, GradeFormData, GradeCreationPayload, ChemistryElement, AdditionDilutionElement, ChargemixMaterial } from './types';
import React, { useState, useEffect } from 'react';

export const validateMaterialData = (materials: MaterialFormItem[], type: string): void => {

    // Try to fix materials with missing fullMaterialData by looking up inventory data
    const itemInventoryData = (window as any).itemInventoryData;

    if (itemInventoryData?.results) {
        materials.forEach((item, index) => {
            if (!item.fullMaterialData && item.materialId) {
                const materialObj = itemInventoryData.results.find((m: any) => m.id == item.materialId);
                if (materialObj) {
                    // Update the material with full data
                    materials[index] = {
                        ...item,
                        material: materialObj.name,
                        materialSlug: materialObj.slug || "",
                        fullMaterialData: materialObj,
                    };
                }
            }
        });
    }

    const missingData = materials.filter(item => {
        // Check if fullMaterialData is still missing after the fix attempt
        return !item.fullMaterialData || item.fullMaterialData === null;
    });

    if (missingData.length > 0) {
        console.warn(`Missing fullMaterialData for ${type} materials after fix attempt:`, missingData);
        throw new Error(
            `Some ${type} materials are missing required inventory data. Please refresh and try again.`
        );
    }
};



export const transformTargetChemistry = (
    targetChemistry: TargetChemistryFormItem[] = []
): TargetChemistryElement[] => {
    return targetChemistry
        .filter((item) => item.elementId && item.elementId > 0)
        .map((item) => {
            const min = parseFloat(item.finalMin?.toString() || '0');
            const max = parseFloat(item.finalMax?.toString() || '0');

            let validMin = min;
            let validMax = max;

            if (min > max && max > 0) {
                validMin = max;
            }

            return {
                element: item.elementId,
                name: item.elementName || '',
                element__symbol: item.element || '',
                losses: '',
                min: validMin >= 0 ? validMin.toString() : null,
                relaxed_min: null,
                max: validMax >= 0 ? validMax.toString() : null,
                relaxed_max: null
            };
        });
};


export const transformBathTargetChemistry = (
    targetChemistry: TargetChemistryFormItem[] = []
): TargetChemistryElement[] => {
    return targetChemistry
        .filter((item) => item.elementId && item.elementId > 0)
        .map((item) => {
            const min = parseFloat(item.bathMin?.toString() || '0');
            const max = parseFloat(item.bathMax?.toString() || '0');

            let validMin = min;
            let validMax = max;

            if (min > max && max > 0) {
                validMin = max;
            }

            return {
                element: item.elementId,
                name: item.elementName || '',
                element__symbol: item.element || '',
                losses: '',
                min: validMin >= 0 ? validMin.toString() : null,
                relaxed_min: null,
                max: validMax >= 0 ? validMax.toString() : null,
                relaxed_max: null
            };
        });
};

// Convert AdditionElement to MaterialFormItem format
export const convertAdditionElementToMaterialFormItem = (additionElement: any): MaterialFormItem => {
    return {
        material: additionElement.element,
        materialId: typeof additionElement.elementId === 'string' ? parseInt(additionElement.elementId) : additionElement.elementId,
        materialSlug: additionElement.fullMaterialData?.slug || '',
        minPercent: typeof additionElement.minPercent === 'string' ? parseFloat(additionElement.minPercent) : additionElement.minPercent,
        maxPercent: typeof additionElement.maxPercent === 'string' ? parseFloat(additionElement.maxPercent) : additionElement.maxPercent,
        fullMaterialData: additionElement.fullMaterialData,
    };
};

export const transformMaterials = (
    materials: MaterialFormItem[] = [],
    materialType: string
): MaterialItem[] => {
    return materials
        .map((item, index) => {
            if (item.fullMaterialData) {
                // Destructure to remove 'id' and spread the rest
                const { id, ...materialDataWithoutId } = item.fullMaterialData;

                const transformed = {
                    ...materialDataWithoutId,
                    item: item.materialId || id, // Use materialId, fallback to id from fullMaterialData
                    min_qty: parseFloat(item.minPercent?.toString() || '0') || null,
                    max_qty: parseFloat(item.maxPercent?.toString() || '0') || null,
                };


                return transformed;
            }

            console.warn(`⚠️ [transformMaterials] ${materialType}[${index}]: Missing fullMaterialData`);
            return null;
        })
        .filter((item): item is MaterialItem => item !== null);
};

export const transformFormDataToPayload = (formData: GradeFormData, customerId: number): GradeCreationPayload => {
    // Convert AdditionElement objects to MaterialFormItem format
    const convertedRawMaterials = formData.rawMaterials?.map(convertAdditionElementToMaterialFormItem) || [];
    const convertedChargemixMaterials = formData.chargemixMaterials?.map(convertAdditionElementToMaterialFormItem) || [];

    if (convertedRawMaterials.length > 0) {
        validateMaterialData(convertedRawMaterials, 'Raw');
    }

    if (convertedChargemixMaterials.length > 0) {
        validateMaterialData(convertedChargemixMaterials, 'Chargemix');
    }

    const gradeItems = transformMaterials(convertedRawMaterials, 'raw material');
    const gradeCms = transformMaterials(convertedChargemixMaterials, 'chargemix material');

    // Map tolerance settings by elementId for relaxed_min/relaxed_max
    const toleranceByElementId: Record<number, { min?: number | string; max?: number | string }> = {};
    (formData.toleranceSettings || []).forEach((t: any) => {
        if (t && typeof t.elementId === 'number') {
            toleranceByElementId[t.elementId] = { min: t.toleranceMin, max: t.toleranceMax };
        }
    });

    const withTolerance = (arr: TargetChemistryElement[] = []): TargetChemistryElement[] =>
        arr.map((e) => {
            const tol = toleranceByElementId[e.element as unknown as number];
            return {
                ...e,
                relaxed_min: tol?.min !== undefined && tol?.min !== null ? String(tol.min) : '',
                relaxed_max: tol?.max !== undefined && tol?.max !== null ? String(tol.max) : '',
            };
        });


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
        grade_tc: withTolerance(transformTargetChemistry(formData.targetChemistry)),
        ...(formData.bathChemistry === 'with' ? { bath_tc: withTolerance(transformBathTargetChemistry(formData.targetChemistry)) } : {}),

        grade_item: gradeItems,
        grade_cms: gradeCms,
        carbon_loss: '0.00',
        inventory_item: [],
        addition_tc: [],
        add_dil_inactive_elements: [],
        tolerance_settings: formData.toleranceSettings || [],
    };
};
export const loadElementsAsync = async (
    formValues: any
): Promise<{ value: any; label: string }[]> => {
    const elementsData = (window as any).elementsData;
    const targetChemistry = formValues?.targetChemistry || [];

    if (!elementsData || !Array.isArray(elementsData)) {
        return [];
    }

    const selectedElements = targetChemistry.map((item: any) => ({
        symbol: item.element || item.symbol,
        id: item.elementId || item.id,
    }));

    const options = elementsData
        .filter((element: any) => {
            const isSelectedBySymbol = selectedElements.some(
                (selected) => selected.symbol === element.symbol
            );
            const isSelectedById = selectedElements.some(
                (selected) => selected.id === element.id
            );
            return !(isSelectedBySymbol || isSelectedById);
        })
        .map((element: any) => ({
            value: element.id,
            label: element.symbol,
        }));

    return options;
};

export const searchChargemixMaterialsAsync = async (
    formValues: any,
    searchQuery: string = ""
): Promise<{ value: any; label: string }[]> => {
    const itemInventoryData = (window as any).itemInventoryData;
    const chargemixMaterials = formValues?.chargemixMaterials || [];

    if (
        !itemInventoryData?.results ||
        !Array.isArray(itemInventoryData.results)
    ) {
        return [];
    }

    const selectedMaterialIds = chargemixMaterials.map(
        (item: any) => item.materialId || item.material
    );

    const options = itemInventoryData.results
        .filter((material: any) => !selectedMaterialIds.includes(material.id))
        .filter((material: any) => {
            if (searchQuery) {
                return material.name.toLowerCase().includes(searchQuery.toLowerCase());
            }
            return true;
        })
        .map((material: any) => ({
            value: material.id,
            label: material.cm_type
                ? `${material.name} (${material.cm_type})`
                : material.name,
        }));

    return options;
};

export const autoSelectFirstOption = (
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

export const fixExistingMaterials = (items: any[], inventoryData: any, fieldName: string, form: any) => {
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
export const fixExistingElements = (items: any[], elementsData: any[], form: any) => {
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

export const createApiOptions = (
    apiKey: string,
    valueField: string,
    labelField: string,
    fallbackData?: any[]
) => {
    return async () => {
        const waitForData = async (timeoutMs: number = 5000): Promise<any> => {
            return new Promise((resolve) => {
                const startTime = Date.now();

                const checkData = () => {
                    const windowData = (window as any)[`${apiKey}Data`];

                    if (windowData && windowData.results && Array.isArray(windowData.results) && windowData.results.length > 0) {
                        resolve(windowData);
                        return;
                    }

                    if (windowData && Array.isArray(windowData) && windowData.length > 0) {
                        resolve(windowData);
                        return;
                    }

                    if (Date.now() - startTime > timeoutMs) {
                        resolve(null);
                        return;
                    }

                    setTimeout(checkData, 100);
                };

                checkData();
            });
        };

        const windowData = await waitForData();

        if (windowData) {
            if (windowData.results && Array.isArray(windowData.results)) {
                return windowData.results.map((item: any) => ({
                    value: item[valueField],
                    label: item[labelField]
                }));
            }

            if (Array.isArray(windowData)) {
                return windowData.map((item: any) => ({
                    value: item[valueField],
                    label: item[labelField]
                }));
            }
        }

        if (fallbackData) {
            return fallbackData;
        }

        return [];
    };
};

export const useApiDataManager = (apiConfigs: Array<{
    key: string;
    apiFunction: () => Promise<any>;
    autoSelect?: boolean;
    selectField?: string;
}>) => {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState({});
    const [error, setError] = useState({});
    const [hasFetched, setHasFetched] = useState({});

    apiConfigs.forEach(config => {
        if (loading[config.key] === undefined) {
            loading[config.key] = true;
            hasFetched[config.key] = false;
        }
    });

    useEffect(() => {
        const fetchAllData = async () => {
            const promises = apiConfigs.map(async (config) => {
                if (hasFetched[config.key]) return;

                try {
                    const result = await config.apiFunction();

                    setData(prev => ({ ...prev, [config.key]: result }));
                    setLoading(prev => ({ ...prev, [config.key]: false }));
                    setHasFetched(prev => ({ ...prev, [config.key]: true }));

                    if (typeof window !== 'undefined') {
                        (window as any)[`${config.key}Data`] = result;
                    }
                } catch (err) {
                    setError(prev => ({ ...prev, [config.key]: err }));
                    setLoading(prev => ({ ...prev, [config.key]: false }));
                    setHasFetched(prev => ({ ...prev, [config.key]: false }));
                }
            });

            await Promise.all(promises);
        };

        fetchAllData();
    }, []);

    return { data, loading, error };
};
export const TriangleAlertIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#f59f0a"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path>
        <path d="M12 9v4"></path>
        <path d="M12 17h.01"></path>
    </svg>
);



export const FIELD_KEYS = {
    TARGET_CHEMISTRY: "targetChemistry",
    SELECTED_ELEMENT: "selectedElement",
    TOLERANCE_SETTINGS: "toleranceSettings",
} as const;

export const INPUT_CONFIG = {
    STEP: 0.01,
    PLACEHOLDER_BATH_MIN: "",
    PLACEHOLDER_BATH_MAX: "",
} as const;

export const MESSAGES = {
    SELECT_ELEMENT: "Please select an element",
    INVALID_ELEMENT: "Invalid element selected",
    DUPLICATE_ELEMENT: (symbol: string) =>
        `Element "${symbol}" already exists in the table`,
} as const;

export const getInputValue = (value: number | string | null | undefined): string => {
    return value !== undefined && value !== null && value !== ""
        ? String(value)
        : "";
};

export const isElementDuplicate = (
    elements: ChemistryElement[],
    symbol: string
): boolean => {
    return elements.some((el) => String(el.element) === String(symbol));
};

export const createNewElement = (
    symbol: string,
    id: number,
    name: string
): ChemistryElement => {
    return {
        element: symbol,
        elementId: id,
        elementName: name,
        bathMin: "",
        bathMax: "",
        finalMin: "",
        finalMax: "",
        isDefault: false,
    };
};

export const getElementName = (elementId: number, fallback: string): string => {
    const elementsData = (window as any).elementsData || [];
    const elementData = elementsData.find((el: any) => el.id === elementId);
    return elementData?.name || fallback;
};

// ================= Addition/Dilution helpers and constants =================

export const ADDITION_DILUTION_FIELD_KEYS = {
    ADDITION_ELEMENTS: "additionElements",
    RAW_MATERIALS: "rawMaterials",
    SELECTED_ADDITION_ELEMENT: "selectedAdditionElement",
    ELEMENT_MIN_PERCENT: "elementMinPercent",
    ELEMENT_MAX_PERCENT: "elementMaxPercent",
    INCLUDE_CARBON: "includeCarbon",
    INCLUDE_SILICON: "includeSilicon",
} as const;

export const ADDITION_DILUTION_INPUT_CONFIG = {
    STEP: 0.01,
    MIN: 0,
    MAX: 100,
    PLACEHOLDER: "0.0",
} as const;

export const ADDITION_DILUTION_MESSAGES = {
    SELECT_ELEMENT: "Please select an element",
    MAX_MUST_BE_GREATER: "Maximum percentage must be greater than minimum percentage",
} as const;

export const ADDITION_DILUTION_TRANSITION_MS = 300;

export const ADDITION_DILUTION_CATEGORY_STYLES = {
    ADDITIVES: "addition-dilution-category-badge additives",
    LADLE: "addition-dilution-category-badge ladle",
    NODULARIZER: "addition-dilution-category-badge nodularizer",
    DEFAULT: "addition-dilution-category-badge",
} as const;

export const additionDilutionIsEmpty = (value: any): boolean => {
    return value === "" || value === null || value === undefined;
};

export const additionDilutionGetInputValue = (value: number | string | null | undefined): string => {
    return !additionDilutionIsEmpty(value) ? String(value) : "";
};

export const additionDilutionParseNumericValue = (value: string): number | string => {
    return value === "" ? "" : parseFloat(value);
};

export const additionDilutionCreateElement = (
    element: string | number,
    minPercent: number | string,
    maxPercent: number | string,
    category: string,
    fullMaterialData?: any
): AdditionDilutionElement => {
    return {
        element: String(element),
        elementId: element,
        minPercent: typeof minPercent === "string" ? parseFloat(minPercent) : minPercent,
        maxPercent: typeof maxPercent === "string" ? parseFloat(maxPercent) : maxPercent,
        category: category,
        fullMaterialData: fullMaterialData,
    };
};

export const additionDilutionGetCategoryBadgeClass = (category: string): string => {
    return ADDITION_DILUTION_CATEGORY_STYLES[category as keyof typeof ADDITION_DILUTION_CATEGORY_STYLES] || ADDITION_DILUTION_CATEGORY_STYLES.DEFAULT;
};

export const additionDilutionValidateInputs = (
    selectedElement: string | number,
    minPercent: number | string,
    maxPercent: number | string,
    category: string
): string | null => {
    if (!selectedElement) return ADDITION_DILUTION_MESSAGES.SELECT_ELEMENT;

    if (category === "LADLE") {
        if (additionDilutionIsEmpty(minPercent)) return "Min % is required for LADLE materials";
        if (additionDilutionIsEmpty(maxPercent)) return "Max % is required for LADLE materials";
    } else if (category === "NODULARIZER") {
        if (additionDilutionIsEmpty(minPercent)) return "Min % is required for NODULARIZER materials";
    }

    if (!additionDilutionIsEmpty(minPercent)) {
        const minValue = typeof minPercent === "string" ? parseFloat(minPercent) : minPercent;
        if (isNaN(minValue)) return "Please enter a valid Min %";
        if (minValue < 0) return "Min % must be positive";
    }

    if (!additionDilutionIsEmpty(maxPercent)) {
        const maxValue = typeof maxPercent === "string" ? parseFloat(maxPercent) : maxPercent;
        if (isNaN(maxValue)) return "Please enter a valid Max %";
        if (maxValue < 0) return "Max % must be positive";
    }

    if (!additionDilutionIsEmpty(minPercent) && !additionDilutionIsEmpty(maxPercent)) {
        const minValue = typeof minPercent === "string" ? parseFloat(minPercent) : minPercent;
        const maxValue = typeof maxPercent === "string" ? parseFloat(maxPercent) : maxPercent;
        if (minValue > maxValue) return "Min % cannot be greater than Max %";
    }

    return null;
};

export const additionDilutionValidateCategories = (rawMaterials: AdditionDilutionElement[]): string | null => {
    const categories = rawMaterials.map(material => material.category);
    const hasAdditives = categories.includes("ADDITIVES");
    const hasLadle = categories.includes("LADLE");
    const hasNodularizer = categories.includes("NODULARIZER");

    const missing: string[] = [];
    if (!hasAdditives) missing.push("Please select at least one ADDITIVES item");
    if (!hasLadle) missing.push("Please select at least one LADLE item");
    if (!hasNodularizer) missing.push("Please select at least one NODULARIZER item");

    return missing.length > 0 ? missing.join("\n") : null;
};

export const additionDilutionValidateForm = (rawMaterials: AdditionDilutionElement[]): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const categoryError = additionDilutionValidateCategories(rawMaterials);
    if (categoryError) errors.push(categoryError);

    rawMaterials.forEach((material, index) => {
        const materialError = additionDilutionValidateInputs(
            material.element,
            material.minPercent,
            material.maxPercent,
            material.category
        );
        if (materialError) errors.push(`Material ${index + 1} (${material.element}): ${materialError}`);
    });

    return { isValid: errors.length === 0, errors };
};

// ================= Chargemix helpers and constants =================

export const CHARGEMIX_FIELD_KEYS = {
    CHARGEMIX_MATERIALS: "chargemixMaterials",
    SELECTED_CHARGEMIX_MATERIAL: "selectedChargemixMaterial",
    CHARGEMIX_MATERIAL_MIN_PERCENT: "chargemixMaterialMinPercent",
    CHARGEMIX_MATERIAL_MAX_PERCENT: "chargemixMaterialMaxPercent",
} as const;

export const CHARGEMIX_INPUT_CONFIG = {
    STEP: 0.1,
    MIN: 0,
    MAX: 100,
    PLACEHOLDER: "0.0",
} as const;

export const CHARGEMIX_MESSAGES = {
    SELECT_MATERIAL: "Please select a raw material",
    ENTER_MIN_PERCENT: "Please enter a minimum percentage",
    ENTER_MAX_PERCENT: "Please enter a maximum percentage",
    MAX_MUST_BE_GREATER: "Maximum percentage must be greater than minimum percentage",
} as const;

export const CHARGEMIX_TRANSITION_MS = 300;

export const chargemixGetInputValue = (value: number | string | null | undefined): string => {
    return value !== undefined && value !== null && value !== "" ? String(value) : "";
};

export const chargemixParseNumericValue = (value: string): number | string => {
    return value === "" ? "" : parseFloat(value);
};

export const chargemixCreateMaterial = (
    material: string | number,
    minPercent: number | string,
    maxPercent: number | string,
    fullMaterialData?: any
): ChargemixMaterial => {
    return {
        material: String(material),
        materialId: material,
        minPercent: typeof minPercent === "string" ? parseFloat(minPercent) : minPercent,
        maxPercent: typeof maxPercent === "string" ? parseFloat(maxPercent) : maxPercent,
        fullMaterialData: fullMaterialData || undefined,
    };
};

export const chargemixValidateInputs = (
    selectedMaterial: string | number,
    minPercent: number | string,
    maxPercent: number | string
): string | null => {
    if (!selectedMaterial) return CHARGEMIX_MESSAGES.SELECT_MATERIAL;
    if (minPercent !== null && minPercent !== undefined && minPercent !== "" &&
        maxPercent !== null && maxPercent !== undefined && maxPercent !== "") {
        const minValue = typeof minPercent === "string" ? parseFloat(minPercent) : minPercent;
        const maxValue = typeof maxPercent === "string" ? parseFloat(maxPercent) : maxPercent;
        if (!isNaN(minValue) && !isNaN(maxValue) && maxValue < minValue) {
            return CHARGEMIX_MESSAGES.MAX_MUST_BE_GREATER;
        }
    }
    return null;
};

// ================= Grade Overview helpers =================

export const gradeOverviewGetField = (fields: any[], key: string) => {
    return fields.find((f) => f.key === key);
};

export const gradeOverviewGetMetaValue = (field: any, metaKey: string): any => {
    return field?.meta?.[metaKey] || field?.dependencies?.overrides?.meta?.[metaKey];
};

export const gradeOverviewGetFieldError = (
    errors: Record<string, string[] | string> | undefined,
    fieldKey: string
): string | undefined => {
    const err = errors?.[fieldKey];
    if (!err) return undefined;
    return Array.isArray(err) ? err[0] : err;
};

export const gradeOverviewValidateTemperatureRange = (
    values: any,
    errors: any,
    setError: (key: string, messages: string[]) => void,
    clearError: (key: string) => void
) => {
    const minValue = Number(values.tappingTempMin);
    const maxValue = Number(values.tappingTempMax);

    if (
        !isNaN(minValue) &&
        !isNaN(maxValue) &&
        values.tappingTempMin &&
        values.tappingTempMax
    ) {
        if (minValue > maxValue) {
            if (!errors?.tappingTempMin?.includes("Minimum temperature must be less than or equal to maximum temperature")) {
                setError("tappingTempMin", [
                    "Minimum temperature must be less than or equal to maximum temperature",
                ]);
            }
            if (!errors?.tappingTempMax?.includes("Maximum temperature must be greater than or equal to minimum temperature")) {
                setError("tappingTempMax", [
                    "Maximum temperature must be greater than or equal to minimum temperature",
                ]);
            }
        } else {
            // clear specific errors if present
            if (errors?.tappingTempMin?.includes("Minimum temperature must be less than or equal to maximum temperature")) {
                clearError("tappingTempMin");
            }
            if (errors?.tappingTempMax?.includes("Maximum temperature must be greater than or equal to minimum temperature")) {
                clearError("tappingTempMax");
            }
        }
    }
};




