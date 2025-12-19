import { useEffect, useState, useMemo, useRef, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { IFormViewer } from '@react-form-builder/core';
import { DataChangeContext } from '../../contexts/DataChangeContext';
import { fetchLogSheetDetail, updateLogSheet, LogSheet } from '../../../../shared/Api/dynamicLogSheet';
import {
  extractFileUploadFieldKeys,
  extractDateFieldKeys,
  processFormJson,
  flattenFormData,
  structureFormDataForAPI,
} from './utils';

/**
 * Extract and parse log sheet ID from URL params
 */
export const useLogSheetId = () => {
  const params = useParams<{ id: string }>();
  
  return useMemo(() => {
    const idParam = params?.id;
    if (idParam) {
      const parsed = parseInt(idParam, 10);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }, [params?.id]);
};

/**
 * Hook to notify Agnipariksha about data changes
 */
export const useDataChangeNotifier = (logSheetId: number | null, logSheet: LogSheet | null) => {
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
 * Hook to load log sheet data from API
 */
export const useLogSheetLoader = (logSheetId: number | null) => {
  const [logSheet, setLogSheet] = useState<LogSheet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLogSheetData = async () => {
      // If no log sheet ID in URL, show error
      if (!logSheetId) {
        setError('Log sheet ID is required. Please select a log sheet from the listing page.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchLogSheetDetail(logSheetId);
        setLogSheet(data);
      } catch (err) {
        setError(`Failed to load log sheet data for ID ${logSheetId}`);
        console.error('Error fetching log sheet detail:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadLogSheetData();
  }, [logSheetId]);

  return { logSheet, isLoading, error, setError };
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
  logSheetId: number | null,
  category: string
) => {
  const navigate = useNavigate();
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

      // Update the log sheet
      // Create the full payload using the GET response as base
      // Only update the form_data field, keep everything else unchanged
      const updateData: any = {
        ...logSheet, // Start with full GET response
        form_data: structuredData, // Update only form_data
      };

      // Ensure we don't send read-only or computed fields that shouldn't be updated
      delete updateData.id; // ID shouldn't be in PATCH
      delete updateData.created_at; // Created timestamp shouldn't change
      delete updateData.created_by; // Created by shouldn't change

      await updateLogSheet(logSheetId, updateData);

      // Navigate back to detail page on success
      navigate(`/dynamic-log-sheet/${category}/${logSheetId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update log sheet');
      setIsSubmitting(false);
    }
  }, [viewerRef, formValues, logSheet, dateFieldKeys, logSheetId, category, navigate]);

  const handleCancel = useCallback(() => {
    if (logSheetId) {
      navigate(`/dynamic-log-sheet/${category}/${logSheetId}`);
    } else {
      navigate(`/dynamic-log-sheet/${category}`);
    }
  }, [navigate, category, logSheetId]);

  return { isSubmitting, error, setError, handleSubmit, handleCancel };
};

