import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchLogSheetDetail } from './api';
import { LogSheet } from './types';

/**
 * Renders HTML template by replacing placeholders with form data values
 * @param htmlTemplate - HTML template string with placeholders like {{key}}
 * @param formData - Form data object with sections containing data
 * @returns Rendered HTML string
 */
const renderHtmlTemplate = (htmlTemplate: string, formData: Record<string, any>): string => {
  if (!htmlTemplate || !formData) return htmlTemplate;

  // Flatten all form data from all sections into a single object
  const flattenedData: Record<string, string | number> = {};
  
  Object.values(formData).forEach((section: any) => {
    if (section?.data) {
      Object.entries(section.data).forEach(([key, value]) => {
        flattenedData[key] = value as string | number;
      });
    }
  });

  // Replace all {{key}} placeholders with actual values
  let renderedHtml = htmlTemplate;
  Object.entries(flattenedData).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    renderedHtml = renderedHtml.replace(regex, String(value || ''));
  });

  // Replace any remaining placeholders with empty string
  renderedHtml = renderedHtml.replace(/\{\{[\w-]+\}\}/g, '');

  return renderedHtml;
};

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

