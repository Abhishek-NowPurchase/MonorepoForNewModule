import React from "react";

interface SectionRendererProps {
  sectionData: any;
  form: any;
}

const SectionRenderer = ({ sectionData, form }: SectionRendererProps) => {
  const { section, fields: sectionFields, isVisible } = sectionData;

  if (!isVisible || sectionFields.length === 0) return null;

  if (section.meta?.customRenderer) {
    const customRenderer = section.meta.customRenderer;
    
    try {
      const CustomComponent = require(`../custom/${customRenderer}`).default;
      return (
        <CustomComponent
          fields={sectionFields}
          form={form}
          section={section}
        />
      );
    } catch (error) {
      console.error(`Custom renderer "${customRenderer}" not found`, error);
      return null;
    }
  }

  console.warn(`Section "${section.id}" is missing customRenderer configuration`);
  return null;
};

export default SectionRenderer;
