/**
 * 🎯 LAYOUT UTILITIES - Reusable layout and styling utilities
 * 
 * Centralized utility functions for consistent layout behavior across components.
 * This eliminates code duplication and ensures consistent styling patterns.
 */

/**
 * 🎯 GENERIC GRID LAYOUT CALCULATOR - Consolidated layout logic
 * 
 * Calculates CSS grid properties based on layout configuration.
 * Supports 1, 2, and 3 column layouts with customizable gaps.
 * 
 * @param layout - Layout configuration object
 * @returns CSS grid style object
 */
export const getGridStyle = (layout: any) => ({
  display: "grid",
  gridTemplateColumns:
    layout?.columns === 2
      ? "repeat(2, 1fr)"
      : layout?.columns === 3
      ? "repeat(3, 1fr)"
      : "1fr",
  gap: layout?.gap || "1rem",
});

/**
 * 🎯 GENERIC FORM FIELD STYLE CALCULATOR
 * 
 * Calculates consistent styling for form fields based on type and state.
 * 
 * @param fieldType - Type of field (text, number, select, etc.)
 * @param hasError - Whether the field has validation errors
 * @returns CSS style object
 */
export const getFieldStyle = (fieldType: string, hasError: boolean = false) => ({
  width: '100%',
  minWidth: fieldType === 'number' ? '80px' : '120px',
  maxWidth: fieldType === 'number' ? '120px' : '200px',
  borderColor: hasError ? '#dc3545' : undefined,
});

/**
 * 🎯 GENERIC TABLE CELL STYLE CALCULATOR
 * 
 * Calculates consistent styling for table cells based on column type.
 * 
 * @param columnType - Type of column (text, number, readonly, etc.)
 * @returns CSS style object
 */
export const getTableCellStyle = (columnType: string) => ({
  width: '100%',
  minWidth: '80px',
  maxWidth: columnType === 'number' ? '120px' : '150px',
  padding: '4px 8px',
});

/**
 * 🎯 GENERIC SECTION CLASS NAME GENERATOR
 * 
 * Generates consistent CSS class names for form sections.
 * 
 * @param sectionId - Unique identifier for the section
 * @param layout - Layout configuration
 * @param isVisible - Whether the section is visible
 * @returns CSS class name string
 */
export const getSectionClassName = (sectionId: string, layout?: any, isVisible: boolean = true) => {
  const baseClass = `form-section ${sectionId}`;
  const layoutClass = layout?.className ? ` ${layout.className}` : '';
  const visibilityClass = !isVisible ? ' hidden' : '';
  
  return `${baseClass}${layoutClass}${visibilityClass}`;
};

/**
 * 🎯 GENERIC FIELD CLASS NAME GENERATOR
 * 
 * Generates consistent CSS class names for form fields.
 * 
 * @param fieldType - Type of field
 * @param sectionContext - Context of the section
 * @param hasError - Whether the field has validation errors
 * @returns CSS class name string
 */
export const getFieldClassName = (fieldType: string, sectionContext: string, hasError: boolean = false) => {
  const baseClass = `${sectionContext}-${fieldType}-field`;
  const errorClass = hasError ? ' error' : '';
  
  return `${baseClass}${errorClass}`;
};
