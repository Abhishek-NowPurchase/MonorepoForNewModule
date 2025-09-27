// 🎯 Data exports - Organized by category
import rawMaterials from './rawMaterials.json';
import chemistryElements from './chemistryElements.json';
import addOptions from './addOptions.json';
import gradeTypes from './gradeTypes.json';
import moduleTypes from './moduleTypes.json';
import chargemixMaterials from './chargemixMaterials.json';

// 🎯 Individual exports
export { rawMaterials };
export { chemistryElements };
export { addOptions };
export { gradeTypes };
export { moduleTypes };
export { chargemixMaterials };

// 🎯 Combined mockData object for backward compatibility
export const mockData = {
  rawMaterials,
  chemistryElements,
  addOptions,
  gradeTypes,
  moduleTypes,
  chargemixMaterials
};

// 🎯 Default export
export default mockData;
