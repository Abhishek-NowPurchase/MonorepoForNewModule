export interface Template {
  id: string | number; // Can be string (from API) or number (for backward compatibility)
  template_id?: string; // Store the template_id from API response (used for detail API calls)
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

// New API response structure from /api/v1/templates
export interface TemplateListResponse {
  id: string;
  template_id: string;
  collection_name_slug: string;
  customer_id: number;
  customer_name: string;
  template_name: string;
  description: string;
  category: "master" | "operational" | string; // Category from API: "master" or "operational"
  status: string;
  version: string;
  sheet_url: string;
  platforms: string[];
  is_active: boolean;
  allow_new_submissions: boolean;
  created_at: string;
}

// Query parameters for template list API
export interface TemplateListParams {
  status?: "draft" | "completed";
  is_active?: boolean;
  platform?: "web" | "kiosk" | "mobile";
  page_no?: number;
  page_size?: number;
}

// Template detail response from /api/v1/templates/{template_id}
export interface TemplateDetailResponse {
  id: string;
  template_id: string;
  collection_name_slug: string;
  customer_id: number;
  customer_name: string;
  template_name: string;
  description: string;
  status: string;
  version: string;
  sheet_url: string;
  config: Record<string, any>;
  form_json: Record<string, any> | string;
  platforms: string[];
  is_active: boolean;
  allow_new_submissions: boolean;
  created_at: string;
  updated_at: string;
}

// Parameters for fetching template by ID
export interface TemplateDetailParams {
  version?: string; // Optional version query parameter
}

// Template logsheets response from /api/v1/templates/{template_id}/logsheets
export interface TemplateLogSheetsResponse {
  logsheets: Record<string, any>[]; // Array of logsheets with label-value pairs
  total: number;
  page_no: number;
  page_size: number;
}

// Parameters for fetching template logsheets
export interface TemplateLogSheetsParams {
  status?: "pending" | "completed"; // Filter by status
  platform?: "web" | "kiosk"; // Platform type (default: "web")
  page_no?: number; // Page number (starts from 1, default: 1)
  page_size?: number; // Number of results per page (default: 100, max: 1000)
}

// Logsheet detail response from /api/v1/templates/{template_id}/logsheets/{logsheet_id}
export interface LogsheetDetailResponse {
  id: string;
  template_id: string;
  template_version: string;
  status: string;
  data: Record<string, any>; // Form data values
  parent_data: Record<string, any>; // Parent form data
  previous_step: Record<string, any>; // Previous step data
  created_at: string;
  updated_at: string;
}

// Submit request for updating logsheet
export interface LogsheetSubmitRequest {
  status: string; // "pending" or "completed"
  data: Record<string, any>; // Form data in structure: { main: { section_name, order, data: {...} } }
}

// Submit response from /api/v1/templates/{template_id}/submit/{logsheet_id}
export interface LogsheetSubmitResponse {
  status: string;
  message: string;
  logsheet_id: string;
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

