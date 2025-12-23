import React from 'react';
import { useDetail } from './hooks';
import DetailComponent from '../../components/Detail/DetailComponent';
import './Detail.scss';

const Detail: React.FC = () => {
  const {
    htmlContent,
    isLoading,
    error,
    handleBack,
    handleEdit
  } = useDetail();

  return (
    <div className="detail-page-wrapper">
      <DetailComponent
        htmlContent={htmlContent}
        isLoading={isLoading}
        error={error}
        onBack={handleBack}
        onEdit={handleEdit}
      />
  </div>
  );
};

export default Detail;
