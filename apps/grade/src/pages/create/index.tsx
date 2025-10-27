import React from "react";
import { ConfigurationForm } from "../../components";
import { SkeletonLoader } from "../../../../shared/component";
import { useGradeCreateForm } from "./hooks";

const GradeCreate = ({ id }: { id?: string }) => {
  const { form, sections, handleSubmit, loading, error, isSubmitting } = useGradeCreateForm(
    {},
    id
  );
  if ((loading as any).gradeCategory || (loading as any).gradeTagId) {
    return <SkeletonLoader />;
  }

  if ((error as any).gradeCategory || (error as any).gradeTagId) {
    return <div className="error">Error loading data. Please try again.</div>;
  }
  return (
    <ConfigurationForm
      form={form}
      sections={sections}
      handleSubmit={handleSubmit}
      submitButtonText={id ? "Update Grade" : "Create Grade"}
      isSubmitting={isSubmitting}
    />
  );
};

export default GradeCreate;
