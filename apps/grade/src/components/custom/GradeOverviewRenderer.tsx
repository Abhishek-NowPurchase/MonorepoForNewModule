import React from "react";
import { Select as MuiSelect, MenuItem, FormControl } from "@mui/material";
import "../../styles/grade-overview.css";
import { GradeOverviewRendererProps } from "../../pages/create/types";
import { gradeOverviewGetField, gradeOverviewGetMetaValue, gradeOverviewGetFieldError, gradeOverviewValidateTemperatureRange } from "../../pages/create/utils";



const GradeOverviewRenderer: React.FC<GradeOverviewRendererProps> = ({
  fields,
  form,
  section,
}) => {
  const getField = (key: string) => gradeOverviewGetField(fields, key);
  const getMetaValue = (field: any, metaKey: string) => gradeOverviewGetMetaValue(field, metaKey);
  const getFieldError = (fieldKey: string) => gradeOverviewGetFieldError(form.errors, fieldKey);

  const handleFieldChange = (key: string, value: any) => {
    form.setValue(key, value);

    // Cross-field validation for temperature range
    if (key === "tappingTempMin" || key === "tappingTempMax") {
      validateTemperatureRange();
    }
  };

  const validateTemperatureRange = () => {
    const clearError = (key: string) => {
      if (form.errors?.[key]) {
        delete form.errors[key];
      }
    };
    gradeOverviewValidateTemperatureRange(form.values, form.errors, form.setError, clearError);
  };

  const [gradeTypeOptions, setGradeTypeOptions] = React.useState<any[]>([]);
  const gradeTypeField = getField("gradeType");
  const isDIType = form.values.gradeType === "DI";

  React.useEffect(() => {
    const loadGradeTypes = async () => {
      if (gradeTypeField?.options) {
        try {
          const options = await gradeTypeField.options(form.values);
          setGradeTypeOptions(options || []);
        } catch (error) {
          console.error("Failed to load grade types:", error);
          setGradeTypeOptions([]);
        }
      }
    };
    loadGradeTypes();
  }, [gradeTypeField?.options, form.values]);

  // Validate temperature range when component mounts or values change
  React.useEffect(() => {
    if (isDIType) {
      validateTemperatureRange();
    }
  }, [form.values.tappingTempMin, form.values.tappingTempMax, isDIType]);

  const selectedGradeTypeOption = gradeTypeOptions.find(
    (opt) => opt.value === form.values.gradeType
  );

  const renderTextField = (fieldKey: string) => {
    const field = getField(fieldKey);
    if (!field) return null;

    const isMonospace = getMetaValue(field, "fontFamily") === "monospace";
    const inputClassName = `grade-overview-input${isMonospace ? " grade-overview-input-mono" : ""
      }`;

    const helpText = getMetaValue(field, "helpText");
    const placeholder = getMetaValue(field, "placeholder");
    const error = getFieldError(fieldKey);

    return (
      <div className="grade-overview-field">
        <label htmlFor={fieldKey} className="grade-overview-label">
          {field.label}{" "}
          {field.validators?.required && (
            <span className="grade-overview-required">*</span>
          )}
        </label>
        <input
          id={fieldKey}
          type={field.type === "number" ? "number" : "text"}
          className={`${inputClassName}${error ? " grade-overview-input-error" : ""
            }`}
          placeholder={placeholder}
          value={form.values[fieldKey] || ""}
          onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldKey}-error` : undefined}
        />
        {error && (
          <p id={`${fieldKey}-error`} className="grade-overview-error-text">
            {error}
          </p>
        )}
        {helpText && <p className="grade-overview-help-text">{helpText}</p>}
      </div>
    );
  };

  const renderRangeField = (minKey: string, maxKey: string, label?: string) => {
    const minField = getField(minKey);
    const maxField = getField(maxKey);
    if (!minField || !maxField) return null;

    const displayLabel =
      label || getMetaValue(minField, "rangeLabel") || minField.label;

    const minPlaceholder = getMetaValue(minField, "placeholder");
    const maxPlaceholder = getMetaValue(maxField, "placeholder");
    const minError = getFieldError(minKey);
    const maxError = getFieldError(maxKey);
    const helpText = getMetaValue(minField, "helpText");

    return (
      <div className="grade-overview-field">
        <label className="grade-overview-label">
          {displayLabel}{" "}
          {minField.validators?.required && (
            <span className="grade-overview-required">*</span>
          )}
        </label>
        <div className="grade-overview-range-inputs">
          <input
            id={minKey}
            type="number"
            className={`grade-overview-input${minError ? " grade-overview-input-error" : ""
              }`}
            placeholder={minPlaceholder}
            value={form.values[minKey] || ""}
            onChange={(e) => handleFieldChange(minKey, e.target.value)}
            aria-invalid={!!minError}
            aria-describedby={minError ? `${minKey}-error` : undefined}
          />
          <span className="grade-overview-range-separator">-</span>
          <input
            id={maxKey}
            type="number"
            className={`grade-overview-input${maxError ? " grade-overview-input-error" : ""
              }`}
            placeholder={maxPlaceholder}
            value={form.values[maxKey] || ""}
            onChange={(e) => handleFieldChange(maxKey, e.target.value)}
            aria-invalid={!!maxError}
            aria-describedby={maxError ? `${maxKey}-error` : undefined}
          />
        </div>
        {(minError || maxError) && (
          <p className="grade-overview-error-text">{minError || maxError}</p>
        )}
        {helpText && <p className="grade-overview-help-text">{helpText}</p>}
      </div>
    );
  };

  const renderSelectField = () => {
    if (!gradeTypeField) return null;

    const error = getFieldError("gradeType");

    return (
      <div className="grade-overview-field">
        <label htmlFor="gradeType" className="grade-overview-label">
          {gradeTypeField.label}{" "}
          {gradeTypeField.validators?.required && (
            <span className="grade-overview-required">*</span>
          )}
        </label>
        <FormControl fullWidth error={!!error}>
          <MuiSelect
            id="gradeType"
            value={form.values.gradeType || ""}
            onChange={(e) => handleFieldChange("gradeType", e.target.value)}
            displayEmpty
            className={`grade-overview-select${error ? " grade-overview-select-error" : ""
              }`}
            aria-invalid={!!error}
            aria-describedby={error ? "gradeType-error" : undefined}
            renderValue={(selected) => {
              if (!selected || !selectedGradeTypeOption) {
                return (
                  <span className="grade-overview-placeholder">
                    Select grade type...
                  </span>
                );
              }
              return (
                <div className="grade-overview-select-display">
                  <div className="grade-overview-select-title">
                    {selectedGradeTypeOption.value}
                    {` - `}
                    {selectedGradeTypeOption.label}
                  </div>
                  {/* <div className="grade-overview-select-description">
                    {selectedGradeTypeOption.value}
                  </div> */}
                </div>
              );
            }}
          >
            {gradeTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <div className="grade-overview-select-option">
                  <div className="grade-overview-select-option-title">
                    {option.value}
                    {` - `}
                    {option.label}
                  </div>
                  <div className="grade-overview-select-option-description">
                    {/* {option.value} */}
                  </div>
                </div>
              </MenuItem>
            ))}
          </MuiSelect>
        </FormControl>
        {error && (
          <p id="gradeType-error" className="grade-overview-error-text">
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="grade-overview-card">
      <div className="grade-overview-card-header">
        <h3 className="grade-overview-card-title">{section.title}</h3>
        <p className="grade-overview-card-description">{section.description}</p>
      </div>

      <div className="grade-overview-card-body">
        <div className="grade-overview-grid">
          {renderTextField("tagId")}
          {renderTextField("gradeName")}
          {renderTextField("gradeCode")}
          {renderSelectField()}
        </div>

        {isDIType && (
          <div className="grade-overview-di-section">
            <div className="grade-overview-di-header">
              <div className="grade-overview-badge">DI Specific Parameters</div>
            </div>
            <div className="grade-overview-grid">
              {renderRangeField(
                "tappingTempMin",
                "tappingTempMax",
                "Tapping Temperature Range (°C)"
              )}
              {renderTextField("mgTreatmentTime")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradeOverviewRenderer;
