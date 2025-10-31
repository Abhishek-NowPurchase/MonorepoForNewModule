export interface MaterialRecoveryRate {
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

export interface MaterialGrade {
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

export interface MaterialItem {
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

export interface TargetChemistryFormItem {
    elementId: number;
    element: string;
    elementName: string;
    bathMin?: number | string | null;
    bathMax?: number | string | null;
    finalMin?: number | string | null;
    finalMax?: number | string | null;
}

export interface TargetChemistryElement {
    element: number;
    name: string;
    element__symbol: string;
    losses: string;
    min: string | null;
    relaxed_min: string | null;
    max: string | null;
    relaxed_max: string | null;
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
    bath_tc?: TargetChemistryElement[];
    grade_item: MaterialItem[];
    grade_cms: MaterialItem[];
    customer: number;
    has_nodularization: boolean;
    carbon_loss: string;
    inventory_item: any[];
    addition_tc: any[];
    tolerance_settings: ToleranceSettingsItem[];
}

export interface GradeFormData {
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
    toleranceSettings?: ToleranceSettingsItem[];
}

export interface TargetChemistryFormItem {
    elementId: number;
    elementName: string;
    element: string;
    bathMin?: number | string;
    bathMax?: number | string;
    finalMin?: number | string;
    finalMax?: number | string;
}

export interface MaterialFormItem {
    material: string;
    materialId: number;
    materialSlug: string;
    minPercent: number;
    maxPercent: number;
    fullMaterialData?: MaterialItem;
}

export interface ToleranceSettingsItem {
    element: string;
    elementId: number;
    toleranceMin: number;
    toleranceMax: number;
}
export interface GradeOverviewRendererProps {
    fields: any[];
    form: any;
    section: any;
}
export interface ChemistryElement {
    element: string;
    elementId: number;
    elementName: string;
    bathMin: number | string;
    bathMax: number | string;
    finalMin: number | string;
    finalMax: number | string;
    isDefault: boolean;
}

export interface ElementOption {
    value: number;
    label: string;
}

export interface FormField {
    key: string;
    label: string;
    options?: (values: any) => Promise<ElementOption[]>;
    meta?: {
        searchPlaceholder?: string;
        autoSelectFirst?: boolean;
    };
}

export interface FormValues {
    targetChemistry: ChemistryElement[];
    selectedElement: number | string;
    toleranceSettings?: any;
    bathChemistry?: string;
}

export interface TargetChemistryRendererProps {
    form: {
        fields: FormField[];
        values: FormValues;
        setValue: (key: string, value: any) => void;
        setError: (key: string, errors: string[]) => void;
        errors?: Record<string, string[]>;
    };
    section: {
        title: string;
    };
}
export interface ChemistryInputProps {
    value: number | string;
    placeholder?: string;
    required?: boolean;
    onChange: (value: string) => void;
    error?: string;
}
export interface BathChemistryDecisionRendererProps {
    fields: any[];
    form: any;
    section: any;
}
export interface ToleranceSectionRendererProps {
    field: any;
    value: any;
    onChange: (value: any) => void;
    error?: string[];
    form: any;
}

export interface AdditionDilutionElement {
    element: string;
    elementId: string | number;
    minPercent: number | string;
    maxPercent: number | string;
    category: string; // ADDITIVES, LADLE, or NODULARIZER
    fullMaterialData?: any;
}

export interface AdditionDilutionElementOption {
    value: string | number;
    label: string;
}

export interface AdditionDilutionFormField {
    key: string;
    type: string;
    options?: (values: any, inputValue?: string) => Promise<AdditionDilutionElementOption[]>;
    meta?: {
        autoSelectFirst?: boolean;
    };
    validators?: {
        required?: boolean;
    };
}

export interface AdditionDilutionFormValues {
    targetChemistry: Array<{
        element: string;
        symbol?: string;
    }>;
    additionElements: AdditionDilutionElement[];
    selectedAdditionElement: string | number;
    elementMinPercent: number | string;
    elementMaxPercent: number | string;
    includeCarbon?: boolean;
    includeSilicon?: boolean;
    rawMaterials?: AdditionDilutionElement[];
    [key: string]: any;
}

export interface AdditionDilutionProps {
    fields: AdditionDilutionFormField[];
    form: {
        values: AdditionDilutionFormValues;
        setValue: (key: string, value: any) => void;
        errors?: Record<string, string[]>;
    };
    section: {
        title: string;
        collapsed?: boolean;
    };
}

export interface AdditionDilutionInputProps {
    value: number | string;
    placeholder?: string;
    onChange: (value: string) => void;
    className?: string;
    hasError?: boolean;
}

export interface AdditionDilutionElementCheckboxProps {
    elementSymbol: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export interface AdditionDilutionRowProps {
    element: AdditionDilutionElement;
    index: number;
    onUpdate: (index: number, field: string, value: any) => void;
    onDelete: (index: number) => void;
    validationError?: string;
}

// ================= Chargemix types (prefixed) =================
export interface ChargemixMaterial {
    material: string;
    materialId: string | number;
    minPercent: number | string;
    maxPercent: number | string;
    fullMaterialData?: {
        cm_type?: string;
        name?: string;
        slug?: string;
    };
}

export interface ChargemixMaterialOption {
    value: string | number;
    label: string;
}

export interface ChargemixFormField {
    key: string;
    type: string;
    options?: (values: any, inputValue?: string) => Promise<ChargemixMaterialOption[]>;
    meta?: { autoSelectFirst?: boolean };
    validators?: { required?: boolean };
}

export interface ChargemixFormValues {
    chargemixMaterials: ChargemixMaterial[];
    selectedChargemixMaterial: string | number;
    chargemixMaterialMinPercent: number | string;
    chargemixMaterialMaxPercent: number | string;
    [key: string]: any;
}

export interface ChargemixDataRendererProps {
    fields: ChargemixFormField[];
    form: {
        values: ChargemixFormValues;
        setValue: (key: string, value: any) => void;
        errors?: Record<string, string[]>;
    };
    section: {
        title: string;
        description: string;
        collapsed?: boolean;
    };
}

export interface ChargemixInputProps {
    value: number | string;
    placeholder?: string;
    onChange: (value: string) => void;
    className?: string;
    hasError?: boolean;
}

export interface ChargemixMaterialRowProps {
    material: ChargemixMaterial;
    index: number;
    onUpdate: (index: number, field: keyof ChargemixMaterial, value: any) => void;
    onDelete: (index: number) => void;
    validationError?: string;
    isMinRequired?: boolean;
    isMaxRequired?: boolean;
}