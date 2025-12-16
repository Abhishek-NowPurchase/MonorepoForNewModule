import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { IFormViewer } from '@react-form-builder/core';
import { fetchDynamicForm } from '../Listing/api';
import { FormRenderer, Loader } from '../../../../shared/component';
import { useFormBuilderConfig } from '../../../../shared/hooks';
import { parseFormJson, stringifyFormJson, convertDatesToISOInObject } from '../../../../shared/utils';
import { createLogSheet } from '../../../../shared/Api/dynamicLogSheet';
import { NewPageFooter } from '../../components/NewPage/NewPageFooter';

const NewPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const viewerRef = useRef<IFormViewer | null>(null);

  // Get template ID from URL query parameter
  const templateId = useMemo(() => {
    const templateParam = searchParams.get('template');
    if (templateParam) {
      const parsed = parseInt(templateParam, 10);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }, [searchParams]);

  // Initialize form builder configuration
  const { viewWithCss } = useFormBuilderConfig();

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

  // Parse and stringify form_json
  const formJsonString = useMemo(() => {
    if (!formData?.form_json) {
      return '';
    }

    const parsed = parseFormJson(formData.form_json);
    if (!parsed) {
      return '';
    }

    // If it's an object, check if it has a 'form' property
    if (typeof parsed === 'object') {
      if ('form' in parsed) {
        return stringifyFormJson(parsed);
      }
      // Otherwise, stringify the whole object
      return stringifyFormJson(parsed);
    }

    return '';
  }, [formData]);

  // Create getForm function - must return the form JSON string
  const getForm = useMemo(() => {
    return () => formJsonString;
  }, [formJsonString]);

  // Handle form data changes - this is called on every form field change
  // Use callback to prevent unnecessary re-renders
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

  // Extract date field keys from form_json for date conversion
  const getDateFieldKeys = useMemo(() => {
    return (): Set<string> => {
      const dateKeys = new Set<string>();
      const DATE_FIELD_TYPES = ["RsDatePicker", "RsCalendar", "RsTimePicker"];

      try {
        if (!formData?.form_json) {
          return dateKeys;
        }

        const formJson = formData.form_json;
        let parsed: any;

        if (typeof formJson === 'string') {
          parsed = JSON.parse(formJson);
        } else {
          parsed = formJson;
        }

        // Handle single form
        const form = parsed?.form || parsed;
        if (form?.children && Array.isArray(form.children)) {
          form.children.forEach((child: any) => {
            if (
              child?.type &&
              DATE_FIELD_TYPES.includes(child.type) &&
              child?.key
            ) {
              dateKeys.add(child.key);
            }
          });
        }
      } catch (error) {
        // Error extracting date fields - continue without date conversion
      }

      return dateKeys;
    };
  }, [formData]);

  // Structure form data for API submission
  const structureFormDataForAPI = useMemo(() => {
    return (): Record<string, any> => {
      const structured: Record<string, any> = {};
      const combinedData: Record<string, any> = {};

      // Combine all formValues (stored under 'default' key for single form)
      Object.values(formValues).forEach((sectionData) => {
        Object.assign(combinedData, sectionData);
      });

      // Convert date strings to ISO strings before saving
      const dateFieldKeys = getDateFieldKeys();
      const convertedFormData = convertDatesToISOInObject(
        combinedData,
        dateFieldKeys
      );

      // Create section structure with "main" key for single forms
      structured["main"] = {
        data: convertedFormData,
        order: 1,
        section_name: formData?.template_name || "Form",
      };

      return structured;
    };
  }, [formValues, formData, getDateFieldKeys]);

  // Handle cancel - navigate back to listing
  const handleCancel = () => {
    navigate('/dynamic-log-sheet');
  };

  // Handle form submission with validation
  const handleSubmit = async () => {
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
      const structuredData = structureFormDataForAPI();

      // Create the log sheet
      // Use template ID from URL query parameter (already validated in useEffect)
      if (!templateId) {
        setError('Template ID is missing. Please go back and select a template.');
        setIsSubmitting(false);
        return;
      }

      await createLogSheet({
        template: templateId,
        form_data: structuredData,
        status: 'COMPLETED',
      });

      // Navigate back to listing on success
      navigate('/dynamic-log-sheet');
    } catch (err: any) {
      setError(err.message || 'Failed to create log sheet');
      setIsSubmitting(false);
    }
  };

  // Actions for form submission - onSubmit is called when form is submitted
  const actions = useMemo(() => ({
    onSubmit: (e: any) => {
      const currentFormData = e.data || {};
      setFormValues((prev) => ({
        ...prev,
        default: currentFormData,
      }));
    },
  }), []);

  if (isLoading) {
    return (
      <Loader size="medium" message="Loading form..." fullScreen={true} />
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px' }}>
        <h1>Error</h1>
        <p>{error}</p>
        <button onClick={() => navigate('/dynamic-log-sheet')}>
          Back to Listing
        </button>
      </div>
    );
  }

  if (!formData || !formJsonString) {
    return (
      <div style={{ padding: '40px' }}>
        <h1>New Log Sheet</h1>
        <p>No form data available.</p>
        <button onClick={() => navigate('/dynamic-log-sheet')}>
          Back to Listing
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 40px 120px 40px' }}>
      <FormRenderer
        formJson={formJsonString}
        formName={formData.template_name || 'New Log Sheet'}
        getForm={getForm}
        initialData={formValues.default || {}}
        viewWithCss={viewWithCss}
        actions={actions}
        handleFormDataChange={handleFormDataChange}
        viewerRef={viewerRef}
        sectionIndex={0}
      />
      <NewPageFooter
        isSubmitting={isSubmitting}
        isLoading={isLoading}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default NewPage;

