import { useEffect, useState, useMemo, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchLogSheetDetail, LogSheet } from '../../../../shared/Api/dynamicLogSheet';
import { renderHtmlTemplate } from '../../../../shared/utils';
import { DataChangeContext } from '../../contexts/DataChangeContext';

export const useDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const onDataChange = useContext(DataChangeContext);
  const [logSheet, setLogSheet] = useState<LogSheet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const hasSentDataRef = useRef<string | null>(null);

  // Send Preview data to Agnipariksha when detail page loads
  useEffect(() => {
    if (id && onDataChange && hasSentDataRef.current !== id) {
      onDataChange({ id, action: 'Preview' });
      hasSentDataRef.current = id;
    }
  }, [id, onDataChange]);

  // Load log sheet detail
  useEffect(() => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    fetchLogSheetDetail(id)
      .then(setLogSheet)
      .catch(() => setError('Failed to load log sheet details'))
      .finally(() => setIsLoading(false));
  }, [id]);

  // Render HTML content from template and form data
  const htmlContent = useMemo(() => {
    if (!logSheet?.html_template || !logSheet?.form_data) return null;
    return renderHtmlTemplate(logSheet.html_template, logSheet.form_data);
  }, [logSheet]);

  const handleBack = () => navigate('/dynamic-log-sheet');

  const handleEdit = () => {
    if (!id) return;
    if (onDataChange) {
      onDataChange({ id, action: 'Edit' });
    }
    navigate(`/dynamic-log-sheet/${id}/edit`);
  };

  return {
    logSheet,
    htmlContent,
    isLoading,
    error,
    handleBack,
    handleEdit
  };
};

