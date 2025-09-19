# Grade Module Development Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Form Craft Integration](#form-craft-integration)
4. [UI Design System](#ui-design-system)
5. [Development Standards](#development-standards)
6. [Validation System](#validation-system)
7. [Field Types & Renderers](#field-types--renderers)
8. [Best Practices](#best-practices)
9. [Migration Guide](#migration-guide)

---

## Overview

The Grade Module is a comprehensive form management system built using **Form Craft** (a configuration-first form builder) and **NOW Design System** components. This module demonstrates best practices for creating maintainable, consistent, and accessible forms in a React application.

### Key Principles
- **Configuration-First**: All form behavior is defined in the form model
- **Single Source of Truth**: Form model is the authoritative source for validation, dependencies, and UI
- **Component Consistency**: Standardized UI components across all forms
- **Accessibility First**: Built-in accessibility features through design system
- **Developer Experience**: Clear patterns for maintainability and extensibility

---

## Architecture

### High-Level Structure
```
apps/grade/src/
├── models/                 # Form model definitions
│   ├── gradeFormModel.ts   # Main form configuration
│   └── mockData.ts         # Centralized data arrays
├── core/                   # Core rendering logic
│   └── UniversalFieldRenderer.tsx  # Unified field renderer
├── components/             # Custom business components
│   └── ToleranceSectionRenderer.tsx
├── app/                    # Main application components
│   └── GradeConfigurationForm.tsx
└── styles/                 # Module-specific styles
    └── gradev2.css
```

### Data Flow
```
Form Model → Form Craft → UniversalFieldRenderer → NOW Design Components → UI
```

---

## Form Craft Integration

### Core Concepts

#### 1. Form Model as Single Source of Truth
The form model (`gradeFormModel.ts`) defines:
- Field types and properties
- Validation rules
- Dependencies and conditional logic
- Layout and styling
- Dynamic options

#### 2. Configuration-First Approach
```typescript
// Example field definition
{
  key: 'tagId',
  type: 'text',
  label: 'Tag ID',
  defaultValue: 'DI-001',
  validators: {
    required: true,
    min: 6,
    max: 6,
    pattern: /^[A-Za-z]{2}-\d{3}$/
  },
  section: { sectionId: 'gradeOverview', order: 1 },
  meta: { 
    helpText: 'Unique alphanumeric identifier',
    analyticsId: 'tag-id-field'
  }
}
```

#### 3. Form Craft Hooks
```typescript
// Main form configuration
const form = useFormConfig(gradeFormModel, {
  enableValidation: true,
  enableDependencies: true,
  validateOnChange: false,
  validateOnBlur: true,
  eventHooks: {
    onFieldChange: (path, value) => {},
    onFormSubmit: (values) => {}
  }
});

// Section management
const sections = useSections(gradeFormSectionedModel, form, {
  autoHideEmptySections: true
});
```

---

## UI Design System

### NOW Design System Integration

We use **NOW Design System** components for consistent UI:

#### Core Components
- **TextInput**: All text, number, email, password, tel, url inputs
- **Select**: Dropdown selections
- **Checkbox**: Boolean inputs
- **Button**: Actions and submissions
- **MinMax**: Range inputs
- **RadioGroup**: Single selection from options

#### Design Token Integration
```typescript
// Required imports for proper styling
import 'now-design-tokens/dist/css/variables.css';
import 'now-design-styles/dist/text/text-styles.css';
import 'now-design-styles/dist/color/colorStyles.css';
import 'now-design-styles/dist/fonts/fonts.css';
import 'now-design-styles/dist/effect/effectStyles.css';
```

#### Component Usage Pattern
```typescript
<TextInput
  label={field.label}
  value={value}
  onChange={handleChange}
  status={error ? 'error' : undefined}
  helperText={field.meta?.helpText}
  required={field.validators?.required}
  validator={field.validators?.custom}
  validateOn="blur"
/>
```

---

## Development Standards

### 1. Field Definition Standards

#### Required Properties
```typescript
{
  key: string,           // Unique field identifier
  type: FieldType,       // Standard field type
  label: string,         // Display label
  section: SectionRef,   // Section assignment
  validators?: Validators // Validation rules
}
```

#### Optional Properties
```typescript
{
  defaultValue?: any,    // Initial value
  hidden?: boolean,      // Visibility control
  disabled?: boolean,    // Interaction control
  meta?: FieldMeta,      // Additional metadata
  dependencies?: Dependency[] // Conditional logic
}
```

### 2. Validation Standards

#### Standard Validators
```typescript
validators: {
  required: boolean,           // Required field
  min: number,                // Minimum value/length
  max: number,                // Maximum value/length
  pattern: RegExp,            // Regex validation
  custom: (value) => string[] // Custom validation
}
```

#### Validation Timing
- **validateOnChange**: false (performance)
- **validateOnBlur**: true (user experience)
- **validateOnSubmit**: true (form integrity)

### 3. Section Organization
```typescript
sections: [
  {
    id: 'gradeOverview',
    title: 'Grade Overview',
    description: 'Basic grade information',
    layout: { columns: 2, gap: '1rem' }
  }
]
```

---

## Validation System

### Built-in Validation Types

#### 1. Text Fields
```typescript
// Length validation
validators: {
  required: true,
  min: 2,
  max: 100
}

// Pattern validation
validators: {
  pattern: /^[A-Za-z]{2}-\d{3}$/
}

// Custom validation
validators: {
  custom: (value) => {
    if (value.length < 3) return ['Too short'];
    return [];
  }
}
```

#### 2. Number Fields
```typescript
validators: {
  required: true,
  min: 0,
  max: 1000
}
```

#### 3. Select Fields
```typescript
validators: {
  required: true
}
// Options validation handled by options array
```

### Error Handling
- Errors are automatically displayed by NOW Design components
- Error states are managed by Form Craft
- Custom error messages through validator functions

---

## Field Types & Renderers

### Standard Field Types

#### 1. Text Inputs (Unified Handler)
```typescript
case 'text':
case 'number':
case 'email':
case 'password':
case 'tel':
case 'url':
  // Single TextInput component handles all types
  return <TextInput type={field.type} ... />
```

#### 2. Select Fields
```typescript
case 'select':
  return <Select options={selectOptions} ... />
```

#### 3. Checkbox Fields
```typescript
case 'checkbox':
  return <Checkbox checked={value} ... />
```

#### 4. Array Fields
```typescript
case 'array':
  return <ArrayFieldWrapper items={value} ... />
```

### Custom Renderers

#### When to Use Custom Renderers
- Complex business logic (e.g., ToleranceSectionRenderer)
- Multi-field interactions
- Specialized UI requirements

#### Custom Renderer Pattern
```typescript
const handleCustomRenderer = () => {
  if (customRenderer === 'ToleranceSection') {
    return <ToleranceSectionRenderer field={field} form={form} />;
  }
  return null;
};
```

---

## Best Practices

### 1. Form Model Design
- **Keep it declarative**: Define what, not how
- **Use standard types**: Prefer built-in field types
- **Centralize data**: Use mockData.ts for large arrays
- **Consistent naming**: Use clear, descriptive field keys

### 2. Component Development
- **Single responsibility**: One component, one purpose
- **Reusable patterns**: Use UniversalFieldRenderer for standard fields
- **Error boundaries**: Wrap custom renderers in error boundaries
- **Accessibility**: Leverage NOW Design's built-in accessibility

### 3. Performance Optimization
- **Lazy loading**: Load options dynamically
- **Memoization**: Use React.memo for expensive components
- **Validation timing**: Validate on blur, not on change
- **Dependency optimization**: Minimize dependency chains

### 4. Code Organization
- **Separation of concerns**: Model, renderer, and business logic
- **Consistent imports**: Group imports by type
- **Clear interfaces**: Define TypeScript interfaces for all props
- **Documentation**: Comment complex business logic

---

## Migration Guide

### Phase 1: Form Model Standardization
1. Move all validation logic to form model
2. Standardize field definitions
3. Remove custom validation from components

### Phase 2: Replace Custom Renderers
1. Identify custom renderers that can use standard types
2. Replace with built-in Form Craft components
3. Keep only truly unique business logic renderers

### Phase 3: Implement Dependencies
1. Convert conditional logic to dependencies
2. Use dynamic options for dependent dropdowns
3. Implement proper field visibility controls

### Phase 4: Add Analytics & Accessibility
1. Add analytics IDs to all fields
2. Implement proper ARIA attributes
3. Add keyboard navigation support
4. Test with screen readers

### Phase 5: Optimization & Cleanup
1. Remove unused code and styles
2. Optimize bundle size
3. Add performance monitoring
4. Complete documentation

---

## Conclusion

This guide establishes the foundation for consistent, maintainable form development in the Grade Module. By following these patterns and using Form Craft with NOW Design System, developers can create robust, accessible, and performant forms that scale with the application.

### Key Takeaways
- **Form model is king**: All behavior defined in configuration
- **Use standard components**: Leverage built-in functionality
- **Consistency matters**: Follow established patterns
- **Accessibility first**: Built-in features, not afterthoughts
- **Performance conscious**: Optimize for user experience

For questions or clarifications, refer to the Form Craft documentation and NOW Design System guidelines.
