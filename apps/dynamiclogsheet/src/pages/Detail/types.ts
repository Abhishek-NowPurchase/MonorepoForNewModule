export interface FormDataSection {
  data: Record<string, string | number>;
  order: number;
  section_name: string;
}

export interface LogSheet {
  id: number;
  form_data: Record<string, FormDataSection>;
  html_template: string;
  status: string;
  created_at: string;
  modified_at: string;
}

