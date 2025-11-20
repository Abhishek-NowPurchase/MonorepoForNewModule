import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchLogSheetDetail, LogSheet } from '../../../../shared/Api/dynamicLogSheet';
import { renderHtmlTemplate } from '../../../../shared/utils';

export const useDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [logSheet, setLogSheet] = useState<LogSheet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLogSheetDetail = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchLogSheetDetail(id);
        setLogSheet(data);
      } catch (err) {
        console.error('Error fetching log sheet detail:', err);
        setError('Failed to load log sheet details');
      } finally {
        setIsLoading(false);
      }
    };

    loadLogSheetDetail();
  }, [id]);

  // Render HTML content from template and form data
  const htmlContent = useMemo(() => {
    if (!logSheet?.html_template || !logSheet?.form_data) {
      return null;
    }
    return renderHtmlTemplate(logSheet.html_template, logSheet.form_data);
  }, [logSheet]);

  const handleBack = () => {
    navigate('/dynamic-log-sheet');
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/dynamic-log-sheet/${id}/edit`);
    }
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

