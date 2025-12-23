import React, { useRef } from 'react';
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import type { IFormViewer } from '@react-form-builder/core';
import { FormRenderer, Loader, ErrorDisplay, EmptyState } from '../../../../shared/component';
import { useFormBuilderConfig } from '../../../../shared/hooks';
import { NewPageFooter } from '../../components/NewPage/NewPageFooter';
import { getCategoryFromPath } from '../../utils/routeUtils';
import {
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
  const params = useParams<{ template_id?: string; logsheet_id?: string }>();
  const [searchParams] = useSearchParams();
  const category = getCategoryFromPath(location.pathname);
  const viewerRef = useRef<IFormViewer | null>(null);

  // Initialize form builder configuration
  const { viewWithCss } = useFormBuilderConfig();

  // Extract template_id, logsheet_id, and version from URL
  const templateId = params?.template_id || null;
  const logsheetId = params?.logsheet_id || null;
  const version = searchParams.get('version') || undefined;

  // Load log sheet data and template data (in parallel)
  const { logSheet, isLoading, error } = useLogSheetLoader(templateId, logsheetId, version);

  // Notify Agnipariksha about data changes
  useDataChangeNotifier(logsheetId, logSheet);

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
    logsheetId,
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
    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',width: '100%'}}>
      <div className="new-page-container">
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
  </div>
  );
};

export default Edit;
