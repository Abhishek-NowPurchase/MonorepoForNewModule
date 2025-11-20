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

// Re-export shared types for convenience
export {
  LogSheet,
  LogSheetSection,
  FormDataSection,
  UpdateLogSheetData,
} from "../../../../shared/Api/dynamicLogSheet";

// Edit-specific types (if any)

