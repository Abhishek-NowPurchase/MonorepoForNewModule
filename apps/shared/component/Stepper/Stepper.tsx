import React from 'react';
import './Stepper.css';

export interface StepperStep {
  id: string | number;
  label: string;
}

export interface StepperProps {
  steps: StepperStep[];
  activeStep: number;
  onStepClick?: (index: number) => void;
  maxWidth?: string;
  className?: string;
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  activeStep,
  onStepClick,
  maxWidth = '1200px',
  className = '',
}) => {
  return (
    <div className={`stepper-container ${className}`}>
      <div className="stepper-wrapper" style={{ maxWidth }}>
        {steps.map((step, index) => {
          const isActive = activeStep === index;
          const isCompleted = index < activeStep;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div className="stepper-step">
                {/* Step Circle */}
                <div
                  className={`stepper-circle ${
                    isActive ? 'stepper-circle--active' : ''
                  } ${isCompleted ? 'stepper-circle--completed' : ''} ${
                    onStepClick ? 'stepper-circle--clickable' : ''
                  }`}
                  onClick={onStepClick ? () => onStepClick(index) : undefined}
                >
                  {isCompleted ? (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 20 20"
                      fill="none"
                      className="stepper-checkmark"
                    >
                      <path
                        d="M16.6667 5L7.50004 14.1667L3.33337 10"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <span className="stepper-number">{index + 1}</span>
                  )}
                </div>

                {/* Step Label */}
                <div className="stepper-label-container">
                  <div
                    className={`stepper-label ${
                      isActive ? 'stepper-label--active' : ''
                    } ${isCompleted ? 'stepper-label--completed' : ''}`}
                  >
                    {step.label}
                  </div>
                </div>
              </div>

              {/* Connecting Line */}
              {!isLast && <div className="stepper-connector" />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;

