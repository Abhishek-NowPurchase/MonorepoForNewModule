import React from "react";
import { Button } from 'now-design-atoms';
import { MinMax } from 'now-design-molecules';

interface ToleranceSectionRendererProps {
  field: any;
  value: any;
  onChange: (value: any) => void;
  error?: string[];
  form: any;
}

// Tolerance Section Renderer - Comprehensive tolerance management
const ToleranceSectionRenderer: React.FC<ToleranceSectionRendererProps> = ({ 
  field, 
  form 
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const targetChemistry = form.values["targetChemistry"] || [];
  const elementsWithData = targetChemistry.filter((el: any) => el.element);

  const updateElementTolerance = (
    elementIndex: number,
    toleranceType: "toleranceMin" | "toleranceMax",
    value: number
  ) => {
    const updatedElements = [...targetChemistry];
    updatedElements[elementIndex] = {
      ...updatedElements[elementIndex],
      [toleranceType]: value,
    };
    form.setValue("targetChemistry", updatedElements);
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
        className="tolerance-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="tolerance-icon">⚙️</span>
        <h3 className="tolerance-title">{field.label}</h3>
        <Button 
          type="button" 
          variant="ghost" 
          size="small"
          className="tolerance-toggle"
        >
          {isExpanded ? "▼" : "▶"}
        </Button>
      </div>

      {isExpanded && (
        <div className="tolerance-content">
          {/* Tolerance Information */}
          <div className="tolerance-info">
            <h4>What is Tolerance?</h4>
            <p>
              Tolerance is like a "safety margin" for your final chemistry
              values. It allows small variations from your target ranges without
              affecting quality. If your target is 3.45-3.55 and you set
              tolerance to ±0.05, the acceptable range becomes 3.40-3.60.
            </p>
          </div>

          {/* Example Section */}
          {elementsWithData.length > 0 && (
            <div className="tolerance-examples">
              <h4>Example: {elementsWithData[0].element} Reading vs Target</h4>
              <div className="example-info">
                <p>
                  <strong>Target:</strong> {elementsWithData[0].finalMin} -{" "}
                  {elementsWithData[0].finalMax} |<strong> Tolerance:</strong>{" "}
                  {getToleranceRange(elementsWithData[0]).toleranceMin.toFixed(
                    2
                  )}{" "}
                  -{" "}
                  {getToleranceRange(elementsWithData[0]).toleranceMax.toFixed(
                    2
                  )}
                </p>
              </div>

              {/* Example readings */}
              <div className="tolerance-example within-target">
                <span>
                  Reading:{" "}
                  {(
                    (elementsWithData[0].finalMin +
                      elementsWithData[0].finalMax) /
                    2
                  ).toFixed(2)}
                </span>
                <span className="tolerance-status within-target">
                  Within Target
                </span>
              </div>

              <div className="tolerance-example within-tolerance">
                <span>
                  Reading: {(elementsWithData[0].finalMin - 0.03).toFixed(2)}
                </span>
                <span className="tolerance-status within-tolerance">
                  Within Tolerance
                </span>
              </div>

              <div className="tolerance-example out-of-range">
                <span>
                  Reading: {(elementsWithData[0].finalMin - 0.1).toFixed(2)}
                </span>
                <span className="tolerance-status out-of-range">
                  Out of Range
                </span>
              </div>
            </div>
          )}

          {/* Information Note */}
          <div className="tolerance-note">
            <p>
              <strong>
                Tolerance affects Final chemistry only. Bath ranges remain
                unchanged.
              </strong>
            </p>
            <p>
              <em>26% of grades use custom tolerance settings.</em>
            </p>
          </div>

          {/* Individual Element Tolerance Controls */}
          {elementsWithData.length > 0 && (
            <div className="tolerance-cards">
              {elementsWithData.map((element: any, index: number) => (
                <div key={element.element} className="tolerance-card">
                  <div className="tolerance-card-header">
                    <div
                      className={`element-symbol ${element.element.toLowerCase()}`}
                    >
                      {element.element}
                    </div>
                    <div className="element-info">
                      <h4>{element.element} Tolerance</h4>
                      <p className="tolerance-base">
                        Base: {element.finalMin} - {element.finalMax}
                      </p>
                    </div>
                  </div>

                  <div className="tolerance-inputs">
                    <MinMax
                      id={`tolerance-${element.element}-${index}`}
                      label="Tolerance Range"
                      value={{
                        min: element.toleranceMin || 0.05,
                        max: element.toleranceMax || 0.05
                      }}
                      onChange={(range) => {
                        if (range.min !== undefined) {
                          updateElementTolerance(index, "toleranceMin", range.min);
                        }
                        if (range.max !== undefined) {
                          updateElementTolerance(index, "toleranceMax", range.max);
                        }
                      }}
                      min={0}
                      max={1}
                      step={0.01}
                      unit="%"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {elementsWithData.length === 0 && (
            <div className="tolerance-empty">
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
