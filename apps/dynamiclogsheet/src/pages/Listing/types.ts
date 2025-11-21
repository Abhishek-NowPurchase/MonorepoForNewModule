export interface Template {
  id: number;
  name: string;
  version: string;
  template_name?: string;
  description?: string;
}

export interface LogSheet {
  id: number;
  name: string;
  template: number;
  template_name?: string;
  status: 'Completed' | 'InProgress' | 'PendingReview' | 'Scheduled';
  created_at: string;
  updated_at: string;
  created_by?: string;
  assigned_to?: string;
  description?: string;
}

export interface ApiParams {
  template?: number;
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
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

