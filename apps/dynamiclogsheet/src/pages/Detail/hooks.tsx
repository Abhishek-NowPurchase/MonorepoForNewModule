import { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { fetchTemplatePreview } from '../Listing/api';
import { DataChangeContext } from '../../contexts/DataChangeContext';
import { getCategoryFromPath } from '../../utils/routeUtils';

export const useDetail = () => {
  const { template_id, logsheet_id } = useParams<{ template_id: string; logsheet_id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const category = getCategoryFromPath(location.pathname);
  const onDataChange = useContext(DataChangeContext);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const hasSentDataRef = useRef<string | null>(null);

  // Get version from query params (optional)
  const version = searchParams.get('version') || undefined;

  // Send Preview data to Agnipariksha when detail page loads
  useEffect(() => {
    if (logsheet_id && onDataChange && hasSentDataRef.current !== logsheet_id) {
      onDataChange({ id: logsheet_id, action: 'Preview' });
      hasSentDataRef.current = logsheet_id;
    }
  }, [logsheet_id, onDataChange]);

  // Load template preview HTML
  useEffect(() => {
    if (!template_id) {
      setError('Template ID is required');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetchTemplatePreview(template_id, { 
      version, 
      remove_headers: true,
      logsheet_id: logsheet_id 
    })
      .then(setHtmlContent)
      .catch((err) => {
        console.error('Error fetching template preview:', err);
        setError('Failed to load template preview');
        setHtmlContent(null);
      })
      .finally(() => setIsLoading(false));
  }, [template_id, logsheet_id, version]);

  const handleBack = () => {
    navigate(`/dynamic-log-sheet/${category}`);
  };

  const handleEdit = () => {
    if (!template_id || !logsheet_id) return;
    if (onDataChange) {
      onDataChange({ id: logsheet_id, action: 'Edit' });
    }
    // Build edit URL with version if available
    let editUrl = `/dynamic-log-sheet/${category}/${template_id}/${logsheet_id}/edit`;
    if (version) {
      editUrl += `?version=${version}`;
    }
    navigate(editUrl);
  };

  return {
    htmlContent,
    isLoading,
    error,
    handleBack,
    handleEdit
  };
};

