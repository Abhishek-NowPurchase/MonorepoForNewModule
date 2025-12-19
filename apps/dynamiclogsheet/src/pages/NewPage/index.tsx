import React, { useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { IFormViewer } from '@react-form-builder/core';
import { FormRenderer, Loader, ErrorDisplay, EmptyState } from '../../../../shared/component';
import { useFormBuilderConfig } from '../../../../shared/hooks';
import { NewPageFooter } from '../../components/NewPage/NewPageFooter';
import { getCategoryFromPath } from '../../utils/routeUtils';
import {
  useTemplateId,
  useDataChangeNotifier,
  useFormDataLoader,
  useFormJsonProcessor,
  useFormValues,
  useFormSubmission,
} from './hooks';

const NewPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const category = getCategoryFromPath(location.pathname);
  const viewerRef = useRef<IFormViewer | null>(null);

  // Initialize form builder configuration
  const { viewWithCss } = useFormBuilderConfig();

  // Extract template ID from URL
  const templateId = useTemplateId();

  // Load form data
  const { formData, isLoading, error } = useFormDataLoader(templateId);

  // Notify Agnipariksha about data changes
  useDataChangeNotifier(templateId, formData);

  // Process form JSON
  const { formJsonString, getForm, dateFieldKeys } = useFormJsonProcessor(formData);

  // Manage form values
  const { formValues, handleFormDataChange, actions } = useFormValues();

  // Handle form submission
  const {
    isSubmitting,
    error: submissionError,
    handleSubmit,
    handleCancel,
  } = useFormSubmission(
    viewerRef,
    formValues,
    formData,
    dateFieldKeys,
    templateId,
    category
  );

  // Combine errors from loading and submission
  const displayError = error || submissionError;

  if (isLoading) {
    return (
      <Loader size="medium" message="Loading form..." fullScreen={true} />
    );
  }

  if (displayError) {
    return (
      <ErrorDisplay
        title="Error"
        message={displayError}
        onBack={() => navigate(`/dynamic-log-sheet/${category}`)}
        backButtonText="Back to Listing"
      />
    );
  }

  if (!formData || !formJsonString) {
    return (
      <EmptyState
        message="No form data available."
        onBack={() => navigate(`/dynamic-log-sheet/${category}`)}
        backButtonText="Back to Listing"
      />
    );
  }

  return (
    <div style={{padding: '40px'}}>
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

