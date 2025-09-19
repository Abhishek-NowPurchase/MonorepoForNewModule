// 🎨 DESIGN SYSTEM IMPORTS - Load once for the entire app
import 'now-design-tokens/dist/css/variables.css';
import 'now-design-styles/dist/text/text-styles.css';
import 'now-design-styles/dist/color/colorStyles.css';
import 'now-design-styles/dist/fonts/fonts.css';
import 'now-design-styles/dist/effect/effectStyles.css';

import React from 'react';

import GradeConfigurationForm from './GradeConfigurationForm';

function App() {
  return (
   <> <GradeConfigurationForm /></>
  );
}

export default App;


