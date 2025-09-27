import React from "react";
import Button from "now-design-atoms/dist/button";

import "../../styles/configuration-form.css";
import SectionRenderer from "./SectionRenderer";

// 🎯 Generic props interface
interface ConfigurationFormProps {
  form: any;
  sections: any;
  handleSubmit: (values: any) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit' | 'view';
  title?: string;
  subtitle?: string;
  submitButtonText?: string;
  showResetButton?: boolean;
}

const ConfigurationForm = ({
  form,
  sections,
  handleSubmit,
  onCancel,
  mode = 'create',
  title = "Configuration",
  subtitle = "Configure parameters and options",
  submitButtonText = "Submit",
  showResetButton = false
}: ConfigurationFormProps) => {


  return (
    <div className="configuration-form-container">
      <div className="form-header">
        <h1 className="form-title">{title}</h1>
        <p className="form-subtitle">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="grade-form">
        {sections.sections?.length > 0 ? (
          sections.sections.map((section: any) => (
            <SectionRenderer
              key={section.id}
              sectionData={section}
              form={form}
            />
          ))
        ) : (
          <div className="no-sections">
            <p>No sections available</p>
          </div>
        )}

        <div className="form-actions">
          <Button type="submit" variant="primary" disabled={!form.isValid}>
            {submitButtonText}
          </Button>
          {showResetButton && (
            <Button variant="secondary" onClick={() => form.reset()}>
              Reset Form
            </Button>
          )}
          {onCancel && (
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ConfigurationForm;
