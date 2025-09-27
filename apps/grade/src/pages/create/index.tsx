import React from "react";
import { ConfigurationForm } from "../../components";
import { SkeletonLoader } from "../../../../shared/component";
import { useGradeCreateForm } from "./hooks";

const GradeCreate = () => {
  const { form, sections, handleSubmit, loading, error } = useGradeCreateForm({});
  if ((loading as any).user || (loading as any).gradeCategory || (loading as any).gradeTagId) {
    return <SkeletonLoader />;
  }

  if ((error as any).user || (error as any).gradeCategory || (error as any).gradeTagId) {
    return <div className="error">Error loading data. Please try again.</div>;
  }

  return (
    <ConfigurationForm
      form={form}
      sections={sections}
      handleSubmit={handleSubmit}
      mode="create"
      title="Create New Grade"
      subtitle="Configure parameters for a new grade specification"
      submitButtonText="Create Grade"
    />
  );
};

export default GradeCreate;
