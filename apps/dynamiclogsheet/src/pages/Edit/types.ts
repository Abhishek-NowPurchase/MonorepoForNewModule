export interface LogSheetSection {
  order: number;
  form_json: {
    form: any;
    version: string;
    errorType: string;
    languages: any[];
    localization: any;
    defaultLanguage: string;
  } | string | object;
  section_id: string;
  section_name: string;
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
  form_type?: 'single' | 'multi-step';
  form_json?: string | object;
  sections?: LogSheetSection[];
  'from-name'?: string;
}

export interface UpdateLogSheetData {
  name?: string;
  status?: string;
  assigned_to?: string;
  description?: string;
}

