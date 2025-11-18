import React from 'react'
import {
  formEngineRsuiteCssLoader,
  ltrCssLoader,
  rsAutoComplete,
  rsBreadcrumb,
  rsButton,
  rsCalendar,
  rsCard,
  rsCheckbox,
  rsContainer,
  rsDatePicker,
  rsDivider,
  rsDropdown,
  rsErrorMessage,
  rsHeader,
  rsImage,
  rsInput,
  rsLabel,
  rsLink,
  rsMenu,
  rsMessage,
  rsModal,
  rsModalLayout,
  rsNumberFormat,
  rsPatternFormat,
  rsPlaceholderGraph,
  rsPlaceholderGrid,
  rsPlaceholderParagraph,
  rsProgressCircle,
  rsProgressLine,
  rsRadioGroup,
  rsSearch,
  rsStaticContent,
  rsTab,
  rsTagPicker,
  rsTextArea,
  rsTimePicker,
  rsToggle,
  rsTooltip,
  rsUploader,
  rsWizard,
  rsWizardStep,
  RsLocalizationWrapper,
} from "@react-form-builder/components-rsuite";
import {
  BiDi,
  buildForm,
  createView,
  FormViewer,
} from "@react-form-builder/core";
import { useMemo, useState, useEffect } from "react";
import { LogSheet, LogSheetSection } from '../../pages/Edit/types';
import { FormData } from '../../pages/Edit/hooks';

const components = [
  rsAutoComplete,
  rsBreadcrumb,
  rsButton,
  rsCalendar,
  rsCard,
  rsCheckbox,
  rsContainer,
  rsDatePicker,
  rsDivider,
  rsDropdown,
  rsErrorMessage,
  rsHeader,
  rsImage,
  rsInput,
  rsLabel,
  rsLink,
  rsMenu,
  rsMessage,
  rsModal,
  rsModalLayout,
  rsNumberFormat,
  rsPatternFormat,
  rsPlaceholderGraph,
  rsPlaceholderGrid,
  rsPlaceholderParagraph,
  rsProgressCircle,
  rsProgressLine,
  rsRadioGroup,
  rsSearch,
  rsStaticContent,
  rsTab,
  rsTagPicker,
  rsTextArea,
  rsTimePicker,
  rsToggle,
  rsTooltip,
  rsUploader,
  rsWizard,
  rsWizardStep,
].map((def) => def.build().model);

const viewWithCss = createView(components)
  .withViewerWrapper(RsLocalizationWrapper)
  .withCssLoader(BiDi.LTR, ltrCssLoader)
  .withCssLoader("common", formEngineRsuiteCssLoader);

interface EditComponentProps {
  logSheet: LogSheet | null;
  formData: FormData;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  onInputChange: (field: keyof FormData, value: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

const EditComponent: React.FC<EditComponentProps> = ({
  logSheet,
  formData,
  isLoading,
  isSaving,
  error,
  onInputChange,
  onCancel,
  onSave,
}) => {
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number>(0);
  
  // Debug logging
  useEffect(() => {
    console.log('=== EditComponent Debug ===');
    console.log('logSheet:', logSheet);
    console.log('logSheet?.form_type:', logSheet?.form_type);
    console.log('logSheet?.form_json:', logSheet?.form_json);
    console.log('logSheet?.form_json type:', typeof logSheet?.form_json);
    if (logSheet?.form_json && typeof logSheet.form_json === 'object') {
      console.log('form_json keys:', Object.keys(logSheet.form_json));
      console.log('form_json.sections:', (logSheet.form_json as any)?.sections);
      console.log('form_json.form:', (logSheet.form_json as any)?.form);
    }
  }, [logSheet]);

  // Get all sections sorted by order - check form_json.sections first, then logSheet.sections
  const getAllSectionsJson = useMemo((): LogSheetSection[] => {
    // Check if sections are in form_json.sections (multi-step form structure)
    const formJson = logSheet?.form_json;
    if (formJson && typeof formJson === 'object' && 'sections' in formJson) {
      const sections = (formJson as any).sections;
      console.log('getAllSectionsJson - Found sections in form_json.sections:', sections);
      if (Array.isArray(sections) && sections.length > 0) {
        const sorted = [...sections].sort((a: LogSheetSection, b: LogSheetSection) => a.order - b.order);
        console.log('getAllSectionsJson - Sorted sections from form_json:', sorted);
        return sorted;
      }
    }
    
    // Fallback to logSheet.sections if it exists
    if (logSheet?.sections && Array.isArray(logSheet.sections)) {
      console.log('getAllSectionsJson - Found sections in logSheet.sections:', logSheet.sections);
      const sorted = [...logSheet.sections].sort((a, b) => a.order - b.order);
      console.log('getAllSectionsJson - Sorted sections from logSheet:', sorted);
      return sorted;
    }
    
    console.log('getAllSectionsJson - No sections found, returning empty array');
    return [];
  }, [logSheet]);

  // Reset selected section index when sections change
  useEffect(() => {
    if (getAllSectionsJson.length > 0 && selectedSectionIndex >= getAllSectionsJson.length) {
      setSelectedSectionIndex(0);
    }
  }, [getAllSectionsJson.length, selectedSectionIndex]);

  // Get form JSON for single form - extract the actual form definition
  const getFormJson = useMemo(() => {
    try {
      const formJson = logSheet?.form_json;
      console.log('getFormJson - formJson:', formJson);
      console.log('getFormJson - formJson type:', typeof formJson);
      
      if (!formJson) {
        console.log('getFormJson - No form_json, returning empty string');
        return '';
      }
      
      // If it's already a string, try to parse it first to validate
      if (typeof formJson === 'string') {
        if (formJson.trim() === '') {
          console.log('getFormJson - Empty string, returning empty string');
          return '';
        }
        try {
          // Validate it's valid JSON
          JSON.parse(formJson);
          console.log('getFormJson - Valid JSON string, returning as is');
          return formJson;
        } catch (e) {
          console.error('getFormJson - Invalid JSON string:', e);
          return '';
        }
      }
      
      // If it's an object, check if it has a 'form' property (single form) or 'sections' (multi-step)
      if (typeof formJson === 'object') {
        // For single form, the form definition is in form_json.form
        if ('form' in formJson) {
          const formDefinition = (formJson as any).form;
          console.log('getFormJson - Found form property, extracting form definition');
          try {
            const stringified = JSON.stringify(formJson); // Return the whole form_json object
            console.log('getFormJson - Stringified form_json with form property, length:', stringified.length);
            return stringified;
          } catch (e) {
            console.error('getFormJson - Error stringifying form object:', e);
            return '';
          }
        }
        
        // If it has sections, it's a multi-step form, so we shouldn't use this for single form
        if ('sections' in formJson) {
          console.log('getFormJson - form_json has sections (multi-step), returning empty for single form');
          return '';
        }
        
        // Otherwise, stringify the whole object
        try {
          const stringified = JSON.stringify(formJson);
          console.log('getFormJson - Stringified object, length:', stringified.length);
          return stringified;
        } catch (e) {
          console.error('getFormJson - Error stringifying object:', e);
          return '';
        }
      }
      
      return '';
    } catch (error) {
      console.error('getFormJson - Unexpected error:', error);
      return '';
    }
  }, [logSheet]);

  // Get form JSON for a specific section
  const getSectionFormJson = useMemo(() => {
    return (section: LogSheetSection): string => {
      try {
        console.log('getSectionFormJson - section:', section);
        if (!section?.form_json) {
          console.log('getSectionFormJson - No form_json in section');
          return '';
        }
        
        const formJson = section.form_json;
        console.log('getSectionFormJson - formJson type:', typeof formJson);
        
        // If it's already a string, validate it
        if (typeof formJson === 'string') {
          if (formJson.trim() === '') {
            return '';
          }
          try {
            JSON.parse(formJson);
            return formJson;
          } catch (e) {
            console.error('getSectionFormJson - Invalid JSON string:', e);
            return '';
          }
        }
        
        // If it's an object, stringify it
        try {
          return JSON.stringify(formJson);
        } catch (e) {
          console.error('getSectionFormJson - Error stringifying:', e);
          return '';
        }
      } catch (error) {
        console.error('getSectionFormJson - Unexpected error:', error);
        return '';
      }
    };
  }, []);

  // Get form function for single form
  const getForm = useMemo(() => {
    return () => {
      const form = getFormJson;
      console.log('getForm called - returning form, length:', form.length);
      return form;
    };
  }, [getFormJson]);

  // Get form function for current section
  const getCurrentSectionForm = useMemo(() => {
    return () => {
      const sections = getAllSectionsJson;
      console.log('getCurrentSectionForm called - selectedSectionIndex:', selectedSectionIndex);
      console.log('getCurrentSectionForm - sections.length:', sections.length);
      
      if (sections.length > 0 && sections[selectedSectionIndex]) {
        const section = sections[selectedSectionIndex];
        console.log('getCurrentSectionForm - section:', section);
        const sectionForm = getSectionFormJson(section);
        console.log('getCurrentSectionForm - sectionForm length:', sectionForm.length);
        return sectionForm;
      }
      console.log('getCurrentSectionForm - No section found, returning empty string');
      return '';
    };
  }, [getAllSectionsJson, selectedSectionIndex, getSectionFormJson]);
  
  const onSubmit = (e: any) => {
    // Handle form submission
    console.log("Form data: ", e.data);
    onSave();
  };
  
  const actions = useMemo(() => ({ onSubmit }), [onSave]);

  // Detect multi-step: check if form_json has sections array, or form_type is 'multi-step'
  const isMultiStep = useMemo(() => {
    const formJson = logSheet?.form_json;
    const hasSectionsInFormJson = formJson && typeof formJson === 'object' && 'sections' in formJson && Array.isArray((formJson as any).sections) && (formJson as any).sections.length > 0;
    const hasFormType = logSheet?.form_type === 'multi-step';
    const hasSections = getAllSectionsJson.length > 0;
    
    const result = (hasFormType || hasSectionsInFormJson) && hasSections;
    console.log('=== Form Type Detection ===');
    console.log('form_type:', logSheet?.form_type);
    console.log('hasSectionsInFormJson:', hasSectionsInFormJson);
    console.log('hasFormType:', hasFormType);
    console.log('hasSections:', hasSections);
    console.log('sections length:', getAllSectionsJson.length);
    console.log('isMultiStep:', result);
    
    return result;
  }, [logSheet?.form_type, logSheet?.form_json, getAllSectionsJson.length]);
  
  const currentSection = getAllSectionsJson[selectedSectionIndex];

  // Debug logging for current section
  useEffect(() => {
    console.log('currentSection:', currentSection);
    console.log('selectedSectionIndex:', selectedSectionIndex);
  }, [currentSection, selectedSectionIndex]);

  return (
    <div style={{ 
      padding: '24px', 
      width: '100%', 
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%',
      backgroundColor: '#f5f5f5'
    }}>
      {isMultiStep ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          gap: '24px'
        }}>
          {/* Horizontal Stepper */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '32px 24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              maxWidth: '1200px',
              position: 'relative'
            }}>
              {getAllSectionsJson.map((section, index) => {
                const isActive = selectedSectionIndex === index;
                const isCompleted = index < selectedSectionIndex;
                const isLast = index === getAllSectionsJson.length - 1;
                
                return (
                  <React.Fragment key={section.section_id}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      flex: 1,
                      position: 'relative',
                      zIndex: 1
                    }}>
                      {/* Step Circle */}
                      <div
                        onClick={() => setSelectedSectionIndex(index)}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: isActive || isCompleted ? '#1976d2' : '#e0e0e0',
                          color: isActive || isCompleted ? '#fff' : '#999',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          fontSize: '16px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          border: isActive ? '3px solid #1976d2' : '3px solid transparent',
                          boxShadow: isActive ? '0 0 0 4px rgba(25, 118, 210, 0.1)' : 'none'
                        }}
                      >
                        {isCompleted ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
                              d="M16.6667 5L7.50004 14.1667L3.33337 10"
              stroke="currentColor"
                              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
                        ) : (
                          index + 1
                        )}
      </div>

                      {/* Step Label */}
                      <div style={{
                        marginTop: '12px',
                        textAlign: 'center',
                        maxWidth: '150px'
                      }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? '#1976d2' : isCompleted ? '#666' : '#999',
                          transition: 'all 0.3s ease',
                          lineHeight: '1.4'
                        }}>
                      {section.section_name}
                    </div>
                  </div>
              </div>
                    
                    {/* Connecting Line */}
                    {!isLast && (
                      <div style={{
                        flex: 1,
                        height: '2px',
                        backgroundColor: index < selectedSectionIndex ? '#1976d2' : '#e0e0e0',
                        margin: '0 8px',
                        marginTop: '-60px',
                        marginBottom: '20px',
                        position: 'relative',
                        zIndex: 0,
                        backgroundImage: index < selectedSectionIndex 
                          ? 'none' 
                          : 'repeating-linear-gradient(90deg, transparent, transparent 8px, #e0e0e0 8px, #e0e0e0 16px)',
                        transition: 'all 0.3s ease'
                      }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Section Content Area */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            minHeight: 0,
            overflowY: 'auto'
          }}>
            {currentSection && (
              <>
                <div style={{
                  flex: 1,
                  overflowY: 'auto'
                }}>
                  {(() => {
                    const formData = getCurrentSectionForm();
                    console.log('Rendering FormViewer for section - formData length:', formData?.length || 0);
                    if (!formData || formData.trim() === '') {
                      return (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
                          <p>No form data available for this section.</p>
                  </div>
                      );
                    }
                    try {
                      // Validate JSON before rendering
                      JSON.parse(formData);
                      return (
                    <FormViewer
                      view={viewWithCss}
                          formName={currentSection.section_name}
                          getForm={getCurrentSectionForm}
                      actions={actions}
                    />
                      );
                    } catch (e) {
                      console.error('Invalid JSON in section form:', e);
                      return (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#d32f2f' }}>
                          <p>Error: Invalid form data format.</p>
                          <pre style={{ marginTop: '16px', fontSize: '12px', textAlign: 'left' }}>
                            {String(e)}
                          </pre>
                  </div>
                      );
                    }
                  })()}
                </div>
              </>
              )}
            </div>
        </div>
      ) : (
        <div style={{
          flex: 1,
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {(() => {
            const formData = getFormJson;
            console.log('Rendering FormViewer for single form - formData length:', formData?.length || 0);
            if (!formData || formData.trim() === '') {
              return (
                <div style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
                  <p>No form data available.</p>
          </div>
            );
            }
            try {
              // Validate JSON before rendering
              JSON.parse(formData);
              return (
                <FormViewer
                  view={viewWithCss}
                  formName={logSheet?.['from-name'] || logSheet?.name || 'Form'}
                  getForm={getForm}
                  actions={actions}
                />
              );
            } catch (e) {
              console.error('Invalid JSON in single form:', e);
              return (
                <div style={{ padding: '24px', textAlign: 'center', color: '#d32f2f' }}>
                  <p>Error: Invalid form data format.</p>
                  <pre style={{ marginTop: '16px', fontSize: '12px', textAlign: 'left' }}>
                    {String(e)}
                  </pre>
                </div>
              );
            }
          })()}
        </div>
      )}
      
      {/* Footer with buttons */}
      <div style={{ 
        marginTop: '24px',
        paddingTop: '24px',
        borderTop: '1px solid #e5e5e5',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px'
      }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          style={{
            padding: '10px 24px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#333',
            backgroundColor: '#fff',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.6 : 1,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!isSaving) {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fff';
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || isLoading}
          style={{
            padding: '10px 24px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#fff',
            backgroundColor: '#1976d2',
            border: 'none',
            borderRadius: '4px',
            cursor: (isSaving || isLoading) ? 'not-allowed' : 'pointer',
            opacity: (isSaving || isLoading) ? 0.6 : 1,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!isSaving && !isLoading) {
              e.currentTarget.style.backgroundColor = '#1565c0';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1976d2';
          }}
        >
          {isSaving ? 'Saving...' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default EditComponent;
