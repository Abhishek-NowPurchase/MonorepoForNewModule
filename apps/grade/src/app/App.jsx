// 🎨 DESIGN SYSTEM IMPORTS - Load once for the entire app
import 'now-design-tokens/dist/css/variables.css';
import 'now-design-styles/dist/text/text-styles.css';
import 'now-design-styles/dist/color/colorStyles.css';
import 'now-design-styles/dist/fonts/fonts.css';
import 'now-design-styles/dist/effect/effectStyles.css';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import GradeManager from './GradeManager';
import ErrorBoundary from '../components/ErrorBoundary';
import GradeManagerV2 from './GradeManagerV2';

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        {/* <GradeManager /> */}
        <GradeManagerV2/>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;


