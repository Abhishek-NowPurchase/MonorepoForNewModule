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

export interface FormDataSection {
  data: Record<string, string | number | boolean | null>;
  order: number;
  section_name: string;
}

export interface LogSheet {
  id: number;
  name: string;
  template: number;
  template_name?: string;
  status: 'Completed' | 'InProgress' | 'PendingReview' | 'Scheduled' | 'COMPLETED' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'SCHEDULED';
  created_at: string;
  updated_at?: string;
  modified_at?: string;
  created_by?: string;
  assigned_to?: string;
  description?: string;
  form_type?: 'single' | 'multi-step';
  form_json?: string | object;
  sections?: LogSheetSection[];
  form_data?: Record<string, FormDataSection>;
  'from-name'?: string;
}

// UpdateLogSheetData accepts the full LogSheet object for PATCH
// Only form_data will be updated, all other fields remain unchanged
export type UpdateLogSheetData = Partial<Omit<LogSheet, 'id' | 'created_at' | 'created_by'>> & {
  form_data?: Record<string, FormDataSection>;
};

