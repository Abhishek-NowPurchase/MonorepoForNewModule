export interface Template {
  id: number;
  name: string;
  version: string;
  template_name?: string;
  description?: string;
  platforms?: string[];
  category?: number | null; // 1 = Master, 2 = Operational, null = No category
  category_name?: string; // "Master" or "Operational"
}

export interface LogSheet {
  id: number;
  name: string;
  template: number;
  template_name?: string;
  created_at: string;
  updated_at: string;
  modified_at: string;
  created_by?: string;
  assigned_to?: string;
  description?: string;
  status: string;
}

export interface ApiParams {
  template?: number;
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
  category?: number; // 1 = Master, 2 = Operational
  [key: string]: string | number | boolean | undefined;
}

export interface LogSheetListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: LogSheet[];
}

export interface TemplateListResponse {
  id: number;
  name: string;
  version: string;
  template_name?: string;
}

export interface FieldConfig {
  field_key: string;
  field_type: string;
  label: string;
  is_visible: boolean;
  is_filterable: boolean;
  is_sortable: boolean;
  filter_type: string;
  filter_options: any[];
  order: number;
}

