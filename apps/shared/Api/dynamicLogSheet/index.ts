import { authenticatedApiCall } from "../apiUtils";

const ENDPOINT = "/api/admin/dynamic_logsheet/";

export interface FormDataSection {
  data: Record<string, string | number | boolean | null>;
  order: number;
  section_name: string;
}

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
  name?: string;
  template?: number;
  template_name?: string;
  status:
    | "Completed"
    | "InProgress"
    | "PendingReview"
    | "Scheduled"
    | "COMPLETED"
    | "IN_PROGRESS"
    | "PENDING_REVIEW"
    | "SCHEDULED"
    | string;
  created_at: string;
  updated_at?: string;
  modified_at?: string;
  created_by?: string;
  assigned_to?: string;
  description?: string;
  form_type?: "single" | "multi-step";
  form_json?: string | object;
  sections?: LogSheetSection[];
  form_data?: Record<string, FormDataSection>;
  html_template?: string;
  "from-name"?: string;
}

// UpdateLogSheetData accepts the full LogSheet object for PATCH
// Only form_data will be updated, all other fields remain unchanged
export type UpdateLogSheetData = Partial<
  Omit<LogSheet, "id" | "created_at" | "created_by">
> & {
  form_data?: Record<string, FormDataSection>;
};

/**
 * Fetches the detail of a log sheet from the API endpoint.
 *
 * @param id - ID of the log sheet to be fetched.
 * @returns Response from the API.
 */
export async function fetchLogSheetDetail(
  id: number | string
): Promise<LogSheet> {
  const response = await authenticatedApiCall(`${ENDPOINT}${id}/`, {
    method: "GET",
  });

  return response;
}

/**
 * Updates a log sheet with the provided data.
 *
 * @param id - ID of the log sheet to be updated.
 * @param data - Data to update the log sheet with.
 * @returns Response from the API.
 */
export async function updateLogSheet(
  id: number | string,
  data: UpdateLogSheetData
): Promise<LogSheet> {
  const response = await authenticatedApiCall(`${ENDPOINT}${id}/`, {
    method: "PATCH",
    body: data,
  });

  return response;
}

