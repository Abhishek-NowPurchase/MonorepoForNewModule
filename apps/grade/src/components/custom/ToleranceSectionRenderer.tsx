import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { SystemSettings2Line } from 'now-design-icons';
import "../../styles/tolerance-section.css";

const TriangleAlertIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="#f59f0a" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path>
    <path d="M12 9v4"></path>
    <path d="M12 17h.01"></path>
  </svg>
);

interface ToleranceSectionRendererProps {
  field: any;
  value: any;
  onChange: (value: any) => void;
  error?: string[];
  form: any;
}

// Tolerance Section Renderer - Comprehensive tolerance management
const ToleranceSectionRenderer = ({ 
  field, 
  form 
}: ToleranceSectionRendererProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<{[key: number]: string}>({});
  const targetChemistry = form.values["targetChemistry"] || [];
  const elementsWithData = targetChemistry.filter((el: any) => 
    el.element && typeof el.element === 'string' && el.element.trim() !== ''
  );

  // Populate toleranceSettings array with tolerance data from targetChemistry
  React.useEffect(() => {
    const toleranceSettings = elementsWithData.map((element: any) => ({
      element: element.element,
      elementId: element.elementId,
      toleranceMin: element.toleranceMin || 0,
      toleranceMax: element.toleranceMax || 0
    }));
    
    // Only update if the array has changed
    const currentToleranceSettings = form.values.toleranceSettings || [];
    const hasChanged = JSON.stringify(toleranceSettings) !== JSON.stringify(currentToleranceSettings);
    
    if (hasChanged) {
      form.setValue("toleranceSettings", toleranceSettings);
    }
  }, [elementsWithData, form]);

  // Validation function for tolerance range
  const validateToleranceRange = (elementIndex: number, minValue: number | undefined, maxValue: number | undefined) => {
    // Only validate when both values are provided
    if (minValue !== undefined && minValue !== null && maxValue !== undefined && maxValue !== null) {
      if (maxValue <= minValue) {
        setValidationErrors(prev => ({
          ...prev,
          [elementIndex]: "Max tolerance must be greater than min tolerance"
        }));
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[elementIndex];
          return newErrors;
        });
      }
    } else {
      // Clear error if either value is missing
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[elementIndex];
        return newErrors;
      });
    }
  };

  const updateElementTolerance = (
    elementIndex: number,
    toleranceType: "toleranceMin" | "toleranceMax",
    value: number | undefined
  ) => {
    const updatedElements = [...targetChemistry];
    updatedElements[elementIndex] = {
      ...updatedElements[elementIndex],
      [toleranceType]: value,
    };
    form.setValue("targetChemistry", updatedElements);
    
    // Also update the toleranceSettings array
    const updatedToleranceSettings = elementsWithData.map((element: any, idx: number) => ({
      element: element.element,
      elementId: element.elementId,
      toleranceMin: idx === elementIndex && toleranceType === "toleranceMin" ? value : element.toleranceMin || 0,
      toleranceMax: idx === elementIndex && toleranceType === "toleranceMax" ? value : element.toleranceMax || 0
    }));
    form.setValue("toleranceSettings", updatedToleranceSettings);

    // Validate the tolerance range after update
    const currentElement = updatedElements[elementIndex];
    validateToleranceRange(elementIndex, currentElement.toleranceMin, currentElement.toleranceMax);
  };

  const getToleranceRange = (element: any) => {
    const finalMin = element.finalMin || 0;
    const finalMax = element.finalMax || 0;
    const toleranceMin = element.toleranceMin || 0.05;
    const toleranceMax = element.toleranceMax || 0.05;

    return {
      targetMin: finalMin,
      targetMax: finalMax,
      toleranceMin: Math.max(0, finalMin - toleranceMin),
      toleranceMax: finalMax + toleranceMax,
    };
  };


  return (
    <div className="tolerance-section">
      <div
        className={`tolerance-section-header ${isExpanded ? 'expanded' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="tolerance-section-chevron">
          <FontAwesomeIcon 
            icon={isExpanded ? faChevronDown : faChevronRight} 
            style={{ color: '#1d2530' }} 
          />
        </span>
        <span className="tolerance-section-icon">
          <SystemSettings2Line width={18} height={18} />
        </span>
        <h3 className="tolerance-section-title">{field.label}</h3>
      </div>

      {isExpanded && (
        <div className="tolerance-section-content">
          {/* Tolerance Information */}
          <div className="tolerance-section-info">
            <h4>What is Tolerance?</h4>
            <p>
              Tolerance is like a "safety margin" for your final chemistry
              values. It allows small variations from your target ranges without
              affecting quality. If your target is 3.45-3.55 and you set
              tolerance to ±0.05, the acceptable range becomes 3.40-3.60.
            </p>

            {/* Example Section */}
            {elementsWithData.length > 0 && (
              <div className="tolerance-section-example-container">
                <h5>Example: {(elementsWithData[0].element && typeof elementsWithData[0].element === 'string') ? elementsWithData[0].element : 'C'} Reading vs Target</h5>
                <div className="tolerance-section-example-items">
                  <div className="tolerance-section-target-range">
                    <span>
                      Target: {elementsWithData[0].finalMin} - {elementsWithData[0].finalMax} | Tolerance: {getToleranceRange(elementsWithData[0]).toleranceMin.toFixed(2)} - {getToleranceRange(elementsWithData[0]).toleranceMax.toFixed(2)}
                    </span>
                  </div>

                  <div className="tolerance-section-example-item within-target">
                    <span>
                      Reading: {((elementsWithData[0].finalMin + elementsWithData[0].finalMax) / 2).toFixed(2)}
                    </span>
                    <div className="tolerance-section-status-indicator">
                      <div className="tolerance-section-status-dot"></div>
                      <span className="tolerance-section-status-text">Within Target</span>
                    </div>
                  </div>

                  <div className="tolerance-section-example-item within-tolerance">
                    <span>
                      Reading: {(elementsWithData[0].finalMin - 0.03).toFixed(2)}
                    </span>
                    <div className="tolerance-section-status-indicator">
                      <div className="tolerance-section-status-dot"></div>
                      <span className="tolerance-section-status-text">Within Tolerance</span>
                    </div>
                  </div>

                  <div className="tolerance-section-example-item out-of-range">
                    <span>
                      Reading: {(elementsWithData[0].finalMin - 0.1).toFixed(2)}
                    </span>
                    <div className="tolerance-section-status-indicator">
                      <div className="tolerance-section-status-dot"></div>
                      <span className="tolerance-section-status-text">Out of Range</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Information Note */}
          <div className="tolerance-section-note">
            <p>Tolerance affects Final chemistry only. Bath ranges remain unchanged.</p>
            <p>26% of grades use custom tolerance settings.</p>
          </div>

          {/* Individual Element Tolerance Controls */}
          {elementsWithData.length > 0 && (
            <div className="tolerance-section-cards">
              {elementsWithData.map((element: any, index: number) => (
                <div key={element.element || `element-${index}`} className="tolerance-section-card">
                  <div className="tolerance-section-card-left">
                    <div className="tolerance-section-element-badge">
                      <span className="tolerance-section-element-symbol">
                        {(element.element && typeof element.element === 'string') ? element.element : 'Unknown'}
                      </span>
                    </div>
                    <div className="tolerance-section-element-info">
                      <label className="tolerance-section-element-label">
                        {(element.element && typeof element.element === 'string') ? element.element : 'Unknown'} Tolerance
                      </label>
                      <p className="tolerance-section-element-base">
                        Base: {element.finalMin} - {element.finalMax}
                      </p>
                    </div>
                  </div>

                  <div className="tolerance-section-card-right">
                    <div className={validationErrors[index] ? "tolerance-section-error-tooltip" : ""}>
                      <input
                        type="number"
                        className={`tolerance-section-input ${validationErrors[index] ? "tolerance-section-input-error" : ""}`}
                        step="0.01"
                        placeholder="Min"
                        value={element.toleranceMin !== undefined && element.toleranceMin !== null ? element.toleranceMin : ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateElementTolerance(index, "toleranceMin", val === "" ? undefined : parseFloat(val));
                        }}
                      />
                      {validationErrors[index] && (
                        <div className="tolerance-section-tooltip-content">
                          <span className="tolerance-section-tooltip-icon">
                            <TriangleAlertIcon />
                          </span>
                          <span className="tolerance-section-tooltip-message">
                            {validationErrors[index]}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="tolerance-section-separator">-</span>
                    <div className={validationErrors[index] ? "tolerance-section-error-tooltip" : ""}>
                      <input
                        type="number"
                        className={`tolerance-section-input ${validationErrors[index] ? "tolerance-section-input-error" : ""}`}
                        step="0.01"
                        placeholder="Max"
                        value={element.toleranceMax !== undefined && element.toleranceMax !== null ? element.toleranceMax : ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateElementTolerance(index, "toleranceMax", val === "" ? undefined : parseFloat(val));
                        }}
                      />
                      {validationErrors[index] && (
                        <div className="tolerance-section-tooltip-content">
                          <span className="tolerance-section-tooltip-icon">
                            <TriangleAlertIcon />
                          </span>
                          <span className="tolerance-section-tooltip-message">
                            {validationErrors[index]}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {elementsWithData.length === 0 && (
            <div className="tolerance-section-empty">
              <p>
                Add elements to the chemistry table to configure their tolerance
                settings.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ToleranceSectionRenderer;
