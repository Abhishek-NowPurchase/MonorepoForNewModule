import React from "react";
import Button from "now-design-atoms/dist/button";

import { useFormConfig, useSections } from "@dynamic_forms/react";

import "../styles/gradev2.css";
import {
  gradeConfigurationSectionedModel,
  gradeConfigurationModel,
} from "../models/gradeConfigurationModel";

import UniversalFieldRenderer from "../core/UniversalFieldRenderer";
import { getGridStyle } from "../utils/layoutUtils";

const GradeConfigurationForm = () => {
  const form = useFormConfig(gradeConfigurationModel, {
    enableValidation: true,
    enableDependencies: true,
    enableAnalytics: true,
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

  // 🎯 GENERIC FIELD RENDERER - Consolidated field rendering logic
  const renderField = (field: any) => {
    const fieldPath = field.path || field.key;
    const value = form.values[fieldPath];
    const error = form.errors[fieldPath];

    // 🎯 GENERIC VALUE UPDATE HANDLER - Consolidated form update logic
    const handleFieldChange = (newValue: any) => {
      form.setValue(fieldPath, newValue);

      if (form.values[fieldPath] !== newValue) {
        form.handleChange(fieldPath, newValue);
      }

      if (form.values[fieldPath] !== newValue) {
        form.values[fieldPath] = newValue;
        setTimeout(() => form.setValue(fieldPath, newValue), 0);
      }
    };

    return (
      <UniversalFieldRenderer
        key={fieldPath}
        field={field}
        value={value}
        onChange={handleFieldChange}
        error={error}
        fieldPath={fieldPath}
        form={form}
        sectionContext={field.meta?.sectionContext || "default"}
      />
    );
  };

  // 🎯 GENERIC SECTION RENDERER - Consolidated section rendering logic
  const renderSection = (sectionData: any) => {
    const { section, fields: sectionFields, isVisible } = sectionData;

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
          className={`section-fields ${section.layout?.className || ""}`}
          style={getGridStyle(section.layout)}
        >
          {sectionFields.map((field: any) => renderField(field))}
        </div>
      </div>
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
        {sections.sections?.length > 0 ? (
          sections.sections.map(renderSection)
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

export default GradeConfigurationForm;
