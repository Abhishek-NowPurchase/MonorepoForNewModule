import React from "react";
import Button from "now-design-atoms/dist/button";

import { useFormConfig, useSections } from "@dynamic_forms/react";

import "../styles/gradev2.css";
import {
  gradeConfigurationSectionedModel,
  gradeConfigurationModel,
} from "../models/gradeConfigurationModel";

import UniversalFieldRenderer from "../core/UniversalFieldRenderer";

const GradeManagementFormCraft = () => {
  const form = useFormConfig(gradeConfigurationModel, {
    enableValidation: true,
    enableDependencies: true,
    enableAnalytics: true,
    validateOnChange: false,
    validateOnBlur: true,
    eventHooks: {
      onFieldChange: (path: string, value: any) => {},
      onFormSubmit: (values: any) => {},
    },
  });
  const sections = useSections(gradeConfigurationSectionedModel, form as any, {
    autoHideEmptySections: true,
  });
  const handleSubmit = form.handleSubmit(async (values: any) => {
    alert("Grade configuration saved successfully!");
  });

  const renderField = (field: any) => {
    const fieldPath = field.path || field.key;
    const value = form.values[fieldPath];
    const error = form.errors[fieldPath];

    return (
      <UniversalFieldRenderer
        key={fieldPath}
        field={field}
        value={value}
        onChange={(newValue: any) => {
          // Try setValue first
          form.setValue(fieldPath, newValue);
          
          // If setValue didn't work, try handleChange
          if (form.values[fieldPath] !== newValue) {
            form.handleChange(fieldPath, newValue);
          }
          
          // If both failed, try direct manipulation with force update
          if (form.values[fieldPath] !== newValue) {
            form.values[fieldPath] = newValue;
            
            // Force form to recognize the change
            if (form.forceUpdate) {
              form.forceUpdate();
            } else if (form.setValue) {
              // Try setValue again after direct manipulation
              setTimeout(() => {
                form.setValue(fieldPath, newValue);
              }, 0);
            }
          }
        }}
        error={error}
        fieldPath={fieldPath}
        form={form}
        sectionContext={field.meta?.sectionContext || "default"}
      />
    );
  };

  return (
    <div className="gradev2-container">
      <div className="form-header">
        <h1 className="form-title">Grade Management</h1>
        <p className="form-subtitle">
          Configure grade parameters and processing options
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grade-form">
        {sections.sections && sections.sections.length > 0 ? (
          sections.sections.map((sectionData: any) => {
            const section = sectionData.section;
            const sectionFields = sectionData.fields;
            const isVisible = sectionData.isVisible;

            if (!isVisible || sectionFields.length === 0) return null;

            return (
              <div
                key={section.id}
                className={`form-section ${section.layout?.className || ""}`}
              >
                <div className="section-header">
                  <h2 className="section-header-title">{section.title}</h2>
                </div>
                {section.description && (
                  <p className="section-description">{section.description}</p>
                )}

                <div
                  className={`section-fields ${section.layout?.className ||
                    ""}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      section.layout?.columns === 2
                        ? "repeat(2, 1fr)"
                        : section.layout?.columns === 3
                        ? "repeat(3, 1fr)"
                        : "1fr",
                    gap: section.layout?.gap || "1rem",
                  }}
                >
                  {sectionFields
                    .filter((field: any) => {
                      return true;
                    })
                    .map((field: any) => renderField(field))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-sections">
            <p>No sections available</p>
          </div>
        )}

        <div className="form-actions">
          <Button type="submit" variant="primary" disabled={!form.isValid}>
            Create Grade
          </Button>
          <Button variant="secondary" onClick={() => form.reset()}>
            Reset Form
          </Button>
        </div>
      </form>
    </div>
  );
};

export default GradeManagementFormCraft;
