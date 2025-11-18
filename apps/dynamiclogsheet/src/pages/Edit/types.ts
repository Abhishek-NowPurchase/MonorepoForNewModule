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

export interface UpdateLogSheetData {
  name?: string;
  status?: string;
  assigned_to?: string;
  description?: string;
}

