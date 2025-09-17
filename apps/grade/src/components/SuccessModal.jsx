import React from 'react';
import { useDispatch } from 'react-redux';
import { showSuccessModal, resetForm } from '../store/gradeSlice';
import { Button } from 'now-design-atoms';

// 🎉 SUCCESS MODAL COMPONENT
const SuccessModal = () => {
  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(showSuccessModal(false));
  };

  const handleCreateAnother = () => {
    dispatch(showSuccessModal(false));
    dispatch(resetForm());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Grade Created Successfully!
          </h3>
          
          <p className="text-gray-600 mb-6">
            Your grade has been created and is ready for use in production.
          </p>
          
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={handleCreateAnother}
              className="flex-1"
            >
              Create Another
            </Button>
            
            <Button
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
