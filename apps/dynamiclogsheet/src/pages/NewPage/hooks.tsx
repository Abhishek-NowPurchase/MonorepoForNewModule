import { useEffect, useState, useMemo, useRef, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { IFormViewer } from '@react-form-builder/core';
import { DataChangeContext } from '../../contexts/DataChangeContext';
import { fetchDynamicForm, createLogsheetSubmit } from '../Listing/api';
import { extractDateFieldKeys, processFormJson, structureFormDataForAPI } from './utils';

/**
 * Extract template ID from URL params (can be string or number)
 */
export const useTemplateId = () => {
  const params = useParams<{ template_id: string }>();
  
  return useMemo(() => {
    const templateParam = params?.template_id;
    if (templateParam) {
      // Return as string to support both string IDs (from API) and numeric IDs
      return templateParam;
    }
    return null;
  }, [params?.template_id]);
};

/**
 * Hook to notify Agnipariksha about data changes
 */
export const useDataChangeNotifier = (templateId: string | number | null, formData: any) => {
  const onDataChange = useContext(DataChangeContext);
  const hasSentDataRef = useRef<string | null>(null);

  useEffect(() => {
    if (templateId && onDataChange) {
      // Update if templateId changed (first time) OR if formData loaded with template_name
      const isNewTemplate = hasSentDataRef.current !== String(templateId);
      const hasTemplateName = formData?.template_name;
      
      if (isNewTemplate || hasTemplateName) {
        onDataChange({ 
          template: templateId, 
          template_name: formData?.template_name,
          action: 'New' 
        });
        hasSentDataRef.current = String(templateId);
      }
    }
  }, [templateId, formData?.template_name, onDataChange]);
};

/**
 * Hook to load form data from API
 * Fetches template detail directly (API returns active version by default if version not provided)
 */
export const useFormDataLoader = (templateId: string | number | null) => {
  const [formData, setFormData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFormData = async () => {
      // If no template ID in URL, show error
      if (!templateId) {
        setError('Template ID is required. Please select a template from the listing page.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch template detail directly without version parameter
        // API will return the active version by default
        const response = await fetchDynamicForm(templateId);
        setFormData(response);
      } catch (err) {
        setError(`Failed to load form data for template ${templateId}`);
        console.error('Error fetching dynamic form:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadFormData();
  }, [templateId]);

  return { formData, isLoading, error, setError };
};

/**
 * Hook to process form JSON for FormRenderer
 */
export const useFormJsonProcessor = (formData: any) => {
  const formJsonString = useMemo(() => {
    if (!formData?.form_json) {
      return '';
    }
    return processFormJson(formData.form_json);
  }, [formData]);

  const getForm = useMemo(() => {
    return () => formJsonString;
  }, [formJsonString]);

  const dateFieldKeys = useMemo(() => {
    if (!formData?.form_json) {
      return new Set<string>();
    }
    return extractDateFieldKeys(formData.form_json);
  }, [formData?.form_json]);

  return { formJsonString, getForm, dateFieldKeys };
};

/**
 * Hook to manage form values state
 */
export const useFormValues = () => {
  const [formValues, setFormValues] = useState<Record<string, any>>({});

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
 * Hook to handle form submission
 */
export const useFormSubmission = (
  viewerRef: React.RefObject<IFormViewer | null>,
  formValues: Record<string, any>,
  formData: any,
  dateFieldKeys: Set<string>,
  templateId: string | number | null,
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
        formData,
        dateFieldKeys
      );

      // Create the log sheet using new submit API
      // Use template ID from URL params (already validated in useEffect)
      if (!templateId) {
        setError('Template ID is missing. Please go back and select a template.');
        setIsSubmitting(false);
        return;
      }

      // Prepare submit request
      // structuredData returns: { main: { section_name, order, data: {...} } }
      // API expects: { status: string, data: { main: {...} } }
      const submitRequest = {
        status: 'completed', // Default status for new logsheets
        data: structuredData, // Contains { main: { section_name, order, data: {...} } }
      };

      // Call the new submit API
      const submitResponse = await createLogsheetSubmit(
        templateId,
        submitRequest
      );

      // Navigate to detail page on success using template_id and logsheet_id from response
      const logsheetId = submitResponse.logsheet_id;
      if (logsheetId) {
        navigate(`/dynamic-log-sheet/${category}`);
        // navigate(`/dynamic-log-sheet/${category}/${templateId}/${logsheetId}`);
      } else {
        // Fallback to listing if logsheet_id not in response
        navigate(`/dynamic-log-sheet/${category}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create log sheet');
      setIsSubmitting(false);
    }
  }, [viewerRef, formValues, formData, dateFieldKeys, templateId, category, navigate]);

  const handleCancel = useCallback(() => {
    navigate(`/dynamic-log-sheet/${category}`);
  }, [navigate, category]);

  return { isSubmitting, error, setError, handleSubmit, handleCancel };
};

