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
  rSuiteTableComponents,
} from "@react-form-builder/components-rsuite-table";
import { BiDi, createView } from "@react-form-builder/core";
import { useMemo } from "react";

/**
 * Hook to initialize form builder configuration with all RSuite components
 * 
 * @returns { viewWithCss } - Configured form builder view with CSS loaders
 * 
 * @example
 * ```typescript
 * const { viewWithCss } = useFormBuilderConfig();
 * ```
 */
export const useFormBuilderConfig = () => {
  const viewWithCss = useMemo(() => {
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
      // Table components for dynamic rows
      ...rSuiteTableComponents,
    ].map((def) => def.build().model);

    return createView(components)
      .withViewerWrapper(RsLocalizationWrapper)
      .withCssLoader(BiDi.LTR, ltrCssLoader)
      .withCssLoader("common", formEngineRsuiteCssLoader);
  }, []);

  return { viewWithCss };
};

