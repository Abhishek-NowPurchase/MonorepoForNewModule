import React from "react";
import { useEdit } from "./hooks";
import EditComponent from "../../components/Edit/EditComponent";

const Edit: React.FC = () => {
  const {
    logSheet,
    formData,
    isLoading,
    isSaving,
    error,
    handleInputChange,
    handleCancel,
    handleSave,
  } = useEdit();
  return (
    <EditComponent
      logSheet={logSheet}
      formData={formData}
      isLoading={isLoading}
      isSaving={isSaving}
      error={error}
      onInputChange={handleInputChange}
      onCancel={handleCancel}
      onSave={handleSave}
    />
  );
};

export default Edit;
