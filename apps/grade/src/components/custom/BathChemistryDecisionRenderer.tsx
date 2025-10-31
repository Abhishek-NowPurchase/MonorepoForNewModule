import React from "react";
import Checkbox from "now-design-atoms/dist/checkbox";
import "../../styles/bath-chemistry-decision.css";
import { HealthMedicalFlaskLine } from "now-design-icons";
import { SystemInformation2Line } from "now-design-icons";
import { TriangleAlertIcon } from "../../pages/create/utils";
import { BathChemistryDecisionRendererProps } from "../../pages/create/types";



const BathChemistryDecisionRenderer = ({
  fields,
  form,
  section,
}: BathChemistryDecisionRendererProps) => {
  const bathChemistryField = fields.find((f) => f.key === "bathChemistry");
  const value = form.values.bathChemistry;
  const rememberChoice = form.values.rememberChoice || false;
  const error = form.errors.bathChemistry;

  const getOptions = async () => {
    if (bathChemistryField?.options) {
      const optionsResult = bathChemistryField.options(form.values);
      let baseOptions: any[] = [];

      if (optionsResult && typeof optionsResult.then === "function") {
        baseOptions = await optionsResult;
      } else if (Array.isArray(optionsResult)) {
        baseOptions = optionsResult;
      }

      return baseOptions.map((option: any) => {
        if (option.value === "with") {
          return {
            ...option,
            description:
              "Enable bath range controls and advanced melt correction (Recommended for DI grades)",
            impact: "High Impact",
          };
        } else if (option.value === "without") {
          return {
            ...option,
            description:
              "Use target chemistry only with standard correction algorithms",
          };
        }
        return option;
      });
    }
    return [];
  };

  const [options, setOptions] = React.useState<any[]>([]);

  React.useEffect(() => {
    getOptions().then(setOptions);
  }, []);

  const handleRadioChange = (optionValue: string) => {
    form.setValue("bathChemistry", optionValue);
    if (form.errors?.bathChemistry && form.errors.bathChemistry.length > 0) {
      delete form.errors.bathChemistry;
    }
  };

  const handleRememberChoiceChange = (checked: boolean) => {
    form.setValue("rememberChoice", checked);
  };

  return (
    <div className="bath-chemistry-decision">
      <div className="bath-chemistry-header">
        <div className="bath-chemistry-title-section">
          <span className="bath-chemistry-warning-icon">
            <TriangleAlertIcon />
          </span>
          <h3 className="bath-chemistry-title">{section.title}</h3>
        </div>
        <p className="bath-chemistry-description">{section.description}</p>
      </div>

      {/* Error Display - Moved to top */}
      {error && error.length > 0 && (
        <div className="bath-chemistry-error">
          <span className="bath-chemistry-error-icon">
            <TriangleAlertIcon />
          </span>
          {error.map((err, index) => (
            <span key={index} className="bath-chemistry-error-message">
              {err}
            </span>
          ))}
        </div>
      )}

      <div className="bath-chemistry-info-card">
        <span className="bath-chemistry-info-icon">
          <SystemInformation2Line width={18} height={18} />
        </span>
        <div className="bath-chemistry-info-content">
          <p>
            <strong>72% of customers</strong> use Bath Chemistry for enhanced
            accuracy. <strong>28%</strong> prefer traditional target-only
            chemistry.
          </p>
        </div>
      </div>

      <div className="bath-chemistry-options">
        <div className="bath-chemistry-radio-options">
          {options.map((option) => (
            <div key={option.value} className="bath-chemistry-radio-option">
              <input
                type="radio"
                name="bathChemistry"
                id={`btc-${option.value}`}
                value={option.value}
                checked={value === option.value}
                onChange={() => handleRadioChange(option.value)}
                className="bath-chemistry-radio-input"
              />
              <label
                htmlFor={`btc-${option.value}`}
                className="bath-chemistry-radio-label"
              >
                <div className="bath-chemistry-radio-content">
                  <div className="bath-chemistry-radio-title">
                    {option.label}
                  </div>
                  <div className="bath-chemistry-radio-description">
                    {option.description}
                  </div>
                </div>
              </label>
              {option.impact && (
                <div className="bath-chemistry-impact-badge">
                  {option.impact}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bath-chemistry-remember-choice-section">
        <div className="bath-chemistry-checkbox-container">
          <input
            type="checkbox"
            id="remember-choice"
            checked={rememberChoice}
            onChange={(e) => handleRememberChoiceChange(e.target.checked)}
            disabled={!value}
            className="bath-chemistry-checkbox"
          />
          <label
            htmlFor="remember-choice"
            className="bath-chemistry-checkbox-label"
          >
            Remember my choice for new grades
          </label>
        </div>
      </div>
    </div>
  );
};

export default BathChemistryDecisionRenderer;
