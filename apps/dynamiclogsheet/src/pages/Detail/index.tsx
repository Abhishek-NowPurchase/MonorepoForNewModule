import React from 'react';
import { useDetail } from './hooks';
import DetailComponent from '../../components/Detail/DetailComponent';

const Detail: React.FC = () => {
  const {
    logSheet,
    htmlContent,
    isLoading,
    error,
    handleBack,
    handleEdit
  } = useDetail();

  return (
    <DetailComponent
      htmlContent={htmlContent}
      isLoading={isLoading}
      error={error}
      onBack={handleBack}
      onEdit={handleEdit}
    />
  );
};

export default Detail;
