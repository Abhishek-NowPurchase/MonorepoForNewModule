import { useEffect, useState, useMemo, useRef, useContext, useCallback } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import type { IFormViewer } from '@react-form-builder/core';
import { DataChangeContext } from '../../contexts/DataChangeContext';
import { LogSheet } from '../../../../shared/Api/dynamicLogSheet';
import { fetchLogsheetDetail, fetchDynamicForm, updateLogsheetSubmit } from '../Listing/api';
import { LogsheetDetailResponse, TemplateDetailResponse } from '../Listing/types';
import {
  extractFileUploadFieldKeys,
  extractDateFieldKeys,
  processFormJson,
  flattenFormData,
  structureFormDataForAPI,
} from './utils';

/**
 * Extract and parse log sheet ID from URL params
 * New route structure: /{category}/{template_id}/{logsheet_id}/edit
 */
export const useLogSheetId = () => {
  const params = useParams<{ template_id?: string; logsheet_id?: string; id?: string }>();
  
  return useMemo(() => {
    // Try new route structure first (logsheet_id)
    if (params?.logsheet_id) {
      // logsheet_id is a MongoDB ObjectId (string), but API might expect number
      // Try parsing as number first, fallback to string
      const parsed = parseInt(params.logsheet_id, 10);
      return isNaN(parsed) ? params.logsheet_id : parsed;
    }
    
    // Fallback to old route structure (id) for backward compatibility
    if (params?.id) {
      const parsed = parseInt(params.id, 10);
      return isNaN(parsed) ? null : parsed;
    }
    
    return null;
  }, [params?.logsheet_id, params?.id]);
};

/**
 * Hook to notify Agnipariksha about data changes
 */
export const useDataChangeNotifier = (logSheetId: number | string | null, logSheet: LogSheet | null) => {
  const onDataChange = useContext(DataChangeContext);
  const hasSentDataRef = useRef<string | null>(null);

  useEffect(() => {
    if (logSheetId && onDataChange) {
      const isNewLogSheet = hasSentDataRef.current !== String(logSheetId);
      const hasLogSheetData = logSheet?.id;
      
      if (isNewLogSheet || hasLogSheetData) {
        onDataChange({ 
          id: logSheetId, 
          action: 'Edit' 
        });
        hasSentDataRef.current = String(logSheetId);
      }
    }
  }, [logSheetId, logSheet?.id, onDataChange]);
};

/**
 * Hook to load log sheet data and template data from API (in parallel)
 * New implementation: Fetches logsheet detail and template detail simultaneously
 */
export const useLogSheetLoader = (
  templateId: string | null,
  logSheetId: string | null,
  version?: string
) => {
  const [logSheet, setLogSheet] = useState<LogSheet | null>(null);
  const [templateDetail, setTemplateDetail] = useState<TemplateDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLogSheetData = async () => {
      // If no template_id or logsheet_id in URL, show error
      if (!templateId || !logSheetId) {
        setError('Template ID and Log sheet ID are required. Please select a log sheet from the listing page.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // First fetch logsheet detail to get template_version
        const logsheetData = await fetchLogsheetDetail(templateId, logSheetId);
        
        // Use template_version from logsheet response, or fallback to version from URL query params
        const templateVersion = logsheetData.template_version || version;
        
        // Then fetch template detail using the template_version
        const templateData = await fetchDynamicForm(
          templateId, 
          templateVersion ? { version: templateVersion } : undefined
        );

        // Combine the responses into a LogSheet-like structure
        // Map LogsheetDetailResponse to LogSheet format for compatibility
        const combinedLogSheet: LogSheet = {
          id: logsheetData.id as any, // Keep as string or number based on API
          name: templateData.template_name || '',
          template: templateId as any, // Store template_id
          template_name: templateData.template_name,
          created_at: logsheetData.created_at,
          updated_at: logsheetData.updated_at,
          modified_at: logsheetData.updated_at,
          status: logsheetData.status,
          // Store the new structure in form_data for processing
          form_data: {
            data: logsheetData.data,
            parent_data: logsheetData.parent_data,
            previous_step: logsheetData.previous_step,
          } as any,
          // Store form_json from template detail
          form_json: templateData.form_json,
          // Store template version
          template_version: logsheetData.template_version,
        } as LogSheet;

        setLogSheet(combinedLogSheet);
        setTemplateDetail(templateData);
      } catch (err: any) {
        setError(err.message || `Failed to load log sheet data for ID ${logSheetId}`);
        console.error('Error fetching log sheet detail:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadLogSheetData();
  }, [templateId, logSheetId, version]);

  return { logSheet, templateDetail, isLoading, error, setError };
};

/**
 * Hook to process form JSON for FormRenderer
 */
export const useFormJsonProcessor = (logSheet: LogSheet | null) => {
  const formJsonString = useMemo(() => {
    if (!logSheet?.form_json) {
      return '';
    }
    return processFormJson(logSheet.form_json);
  }, [logSheet?.form_json]);

  const getForm = useMemo(() => {
    return () => formJsonString;
  }, [formJsonString]);

  const dateFieldKeys = useMemo(() => {
    if (!logSheet?.form_json) {
      return new Set<string>();
    }
    return extractDateFieldKeys(logSheet.form_json);
  }, [logSheet?.form_json]);

  const fileUploadFieldKeys = useMemo(() => {
    if (!logSheet?.form_json) {
      return new Set<string>();
    }
    return extractFileUploadFieldKeys(logSheet.form_json);
  }, [logSheet?.form_json]);

  return { formJsonString, getForm, dateFieldKeys, fileUploadFieldKeys };
};

/**
 * Hook to get initial form data (flattened and filtered)
 */
export const useInitialFormData = (
  logSheet: LogSheet | null,
  fileUploadFieldKeys: Set<string>
) => {
  const initialFormData = useMemo(() => {
    if (!logSheet) {
      return {};
    }
    return flattenFormData(logSheet, fileUploadFieldKeys);
  }, [logSheet, fileUploadFieldKeys]);

  return initialFormData;
};

/**
 * Hook to manage form values state
 */
export const useFormValues = (initialData: Record<string, any>) => {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const initialDataStr = useMemo(() => JSON.stringify(initialData), [initialData]);

  // Initialize formValues with existing data when initialData changes
  useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      setFormValues({ default: initialData });
    }
  }, [initialDataStr]);

  const handleFormDataChange = useMemo(() => {
    return (formData: any) => {
      const currentFormData = formData?.data || {};
      
      // Only update if data actually changed
      setFormValues((prev) => {
        const prevData = prev.default || {};
        const prevDataStr = JSON.stringify(prevData);
        const newDataStr = JSON.stringify(currentFormData);
        
        // If data hasn't changed, don't update (prevents re-render)
        if (prevDataStr === newDataStr) {
          return prev;
        }
        
        return {
          ...prev,
          default: currentFormData,
        };
      });
    };
  }, []);

  const actions = useMemo(() => ({
    onSubmit: (e: any) => {
      const currentFormData = e.data || {};
      setFormValues((prev) => ({
        ...prev,
        default: currentFormData,
      }));
    },
  }), []);

  return { formValues, setFormValues, handleFormDataChange, actions };
};

/**
 * Hook to handle form submission (Edit mode)
 */
export const useFormSubmission = (
  viewerRef: React.RefObject<IFormViewer | null>,
  formValues: Record<string, any>,
  logSheet: LogSheet | null,
  dateFieldKeys: Set<string>,
  logSheetId: number | string | null,
  category: string
) => {
  const navigate = useNavigate();
  const params = useParams<{ template_id?: string; logsheet_id?: string }>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!viewerRef.current) {
      setError('Form viewer not available');
      return;
    }

    if (!logSheetId || !logSheet) {
      setError('Log sheet ID or data is missing. Please go back and try again.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Validate the form
      const viewerFormData = viewerRef.current.formData;
      await viewerFormData.validate();

      if (viewerFormData.hasErrors) {
        // Don't set error state - let form show inline validation errors
        // Just prevent submission
        setIsSubmitting(false);
        return;
      }

      // Structure the form data for API
      const structuredData = structureFormDataForAPI(
        formValues,
        logSheet,
        dateFieldKeys
      );

      // Extract template_id and logsheet_id from route params
      const templateId = params?.template_id;
      if (!templateId) {
        setError('Template ID is required for submission.');
        setIsSubmitting(false);
        return;
      }

      // Prepare submit request
      // The structuredData from structureFormDataForAPI returns: { data: { main: {...} }, parent_data: {...}, previous_step: {...} }
      // But the API expects: { status: string, data: { main: {...} } }
      // Extract just the data part (which contains main structure)
      const submitRequest = {
        status: logSheet.status || 'completed', // Use current status or default to completed
        data: structuredData.data || structuredData, // Extract data field which contains { main: { section_name, order, data: {...} } }
      };

      // Call the new submit API
      const submitResponse = await updateLogsheetSubmit(
        templateId,
        logSheetId,
        submitRequest
      );

      // Navigate back to detail page on success
      // Use logsheet_id from response if available, otherwise use the current one
      const finalLogsheetId = submitResponse.logsheet_id || logSheetId;
      navigate(`/dynamic-log-sheet/${category}/${templateId}/${finalLogsheetId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update log sheet');
      setIsSubmitting(false);
    }
  }, [viewerRef, formValues, logSheet, dateFieldKeys, logSheetId, category, navigate]);

  const handleCancel = useCallback(() => {
    if (logSheetId) {
      // Extract template_id from current route if available
      const currentTemplateId = params?.template_id;
      if (currentTemplateId) {
        // Use new route structure
        navigate(`/dynamic-log-sheet/${category}/${currentTemplateId}/${logSheetId}`);
      } else {
        // Fallback to old route structure
        navigate(`/dynamic-log-sheet/${category}/${logSheetId}`);
      }
    } else {
      navigate(`/dynamic-log-sheet/${category}`);
    }
  }, [navigate, category, logSheetId, params?.template_id]);

  return { isSubmitting, error, setError, handleSubmit, handleCancel };
};

