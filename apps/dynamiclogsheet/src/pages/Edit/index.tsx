import React, { useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { IFormViewer } from '@react-form-builder/core';
import { FormRenderer, Loader, ErrorDisplay, EmptyState } from '../../../../shared/component';
import { useFormBuilderConfig } from '../../../../shared/hooks';
import { NewPageFooter } from '../../components/NewPage/NewPageFooter';
import { getCategoryFromPath } from '../../utils/routeUtils';
import {
  useLogSheetId,
  useDataChangeNotifier,
  useLogSheetLoader,
  useFormJsonProcessor,
  useInitialFormData,
  useFormValues,
  useFormSubmission,
} from './hooks';

const Edit: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const category = getCategoryFromPath(location.pathname);
  const viewerRef = useRef<IFormViewer | null>(null);

  // Initialize form builder configuration
  const { viewWithCss } = useFormBuilderConfig();

  // Extract log sheet ID from URL
  const logSheetId = useLogSheetId();

  // Load log sheet data
  const { logSheet, isLoading, error } = useLogSheetLoader(logSheetId);

  // Notify Agnipariksha about data changes
  useDataChangeNotifier(logSheetId, logSheet);

  // Process form JSON
  const { formJsonString, getForm, dateFieldKeys, fileUploadFieldKeys } = useFormJsonProcessor(logSheet);

  // Get initial form data (flattened and filtered)
  const initialFormData = useInitialFormData(logSheet, fileUploadFieldKeys);

  // Manage form values
  const { formValues, handleFormDataChange, actions } = useFormValues(initialFormData);

  // Handle form submission
  const {
    isSubmitting,
    error: submissionError,
    handleSubmit,
    handleCancel,
  } = useFormSubmission(
    viewerRef,
    formValues,
    logSheet,
    dateFieldKeys,
    logSheetId,
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

  if (!logSheet || !formJsonString) {
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
          formName={logSheet.template_name || logSheet.name || 'Edit Log Sheet'}
          getForm={getForm}
          initialData={formValues.default || initialFormData}
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

export default Edit;
