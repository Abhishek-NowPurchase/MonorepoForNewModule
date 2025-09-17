import { configureStore } from '@reduxjs/toolkit';
import gradeReducer from './gradeSlice';

// 🏗️ REDUX STORE CONFIGURATION
export const store = configureStore({
  reducer: {
    grade: gradeReducer,
  },
  
  // 🚀 ENHANCED MIDDLEWARE FOR DEVELOPMENT
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization checks
        ignoredActions: ['persist/PERSIST'],
        ignoredPaths: ['grade.elements'], // Elements object is complex
      },
    }),
  
  // 🔍 DEVELOPMENT TOOLS
  devTools: process.env.NODE_ENV !== 'production',
});

// 🎯 EXPORT TYPES FOR USE IN COMPONENTS
export const RootState = store.getState;
export const AppDispatch = store.dispatch;
