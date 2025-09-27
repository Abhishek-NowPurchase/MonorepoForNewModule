import React from 'react';
import FieldRenderer from './FieldRenderer';

interface SectionRendererProps {
  sectionData: any;
  form: any;
  key?: string;
}

const SectionRenderer = ({ sectionData, form, key }: SectionRendererProps) => {
  const { section, fields: sectionFields, isVisible } = sectionData;

  if (!isVisible || sectionFields.length === 0) return null;

  return (
    <div
      key={key || section.id}
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
        {sectionFields.map((field: any) => {
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
            <div key={field.id}>
              <FieldRenderer
                field={field}
                value={value}
                onChange={handleFieldChange}
                error={error}
                fieldPath={fieldPath}
                form={form}
                sectionContext={field.meta?.sectionContext || "default"}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SectionRenderer;
