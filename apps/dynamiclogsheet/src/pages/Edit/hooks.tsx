import { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  fetchLogSheetDetail,
  updateLogSheet,
  LogSheet,
} from '../../../../shared/Api/dynamicLogSheet';
import { DataChangeContext } from '../../contexts/DataChangeContext';
import { getCategoryFromPath } from '../../utils/routeUtils';

export interface FormData {
  name: string;
  status: string;
  assigned_to: string;
  description: string;
}

export const useEdit = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const navigate = useNavigate();
  const location = useLocation();
  const category = getCategoryFromPath(location.pathname);
  const onDataChange = useContext(DataChangeContext);
  const hasSentDataRef = useRef<string | null>(null);
  const [logSheet, setLogSheet] = useState<LogSheet | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    status: '',
    assigned_to: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Send data to parent for header enrichment (not for routing - URL is source of truth)
  useEffect(() => {
    if (id && onDataChange && hasSentDataRef.current !== id) {
      onDataChange({ id, action: 'Edit' });
      hasSentDataRef.current = id;
    }
  }, [id, onDataChange]);

  useEffect(() => {
    const loadLogSheetDetail = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchLogSheetDetail(id);
        setLogSheet(data);
        setFormData({
          name: data.name || '',
          status: data.status || '',
          assigned_to: data.assigned_to || '',
          description: data.description || ''
        });
      } catch (err) {
        setError('Failed to load log sheet details');
      } finally {
        setIsLoading(false);
      }
    };

    loadLogSheetDetail();
  }, [id]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCancel = () => {
    if (id) {
      navigate(`/dynamic-log-sheet/${category}/${id}`);
    }
  };

  const handleSave = async (structuredFormData?: Record<string, any>) => {
    if (!id || !logSheet) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Create the full payload using the GET response as base
      // Only update the form_data field, keep everything else unchanged
      const updateData: any = {
        ...logSheet, // Start with full GET response
        form_data: structuredFormData || logSheet.form_data, // Update only form_data
      };

      // Ensure we don't send read-only or computed fields that shouldn't be updated
      // Remove fields that shouldn't be in PATCH request
      delete updateData.id; // ID shouldn't be in PATCH
      delete updateData.created_at; // Created timestamp shouldn't change
      delete updateData.created_by; // Created by shouldn't change
      
      // Keep updated_at and modified_at as they might be auto-updated by backend
      // Keep all other fields from GET response
      
      await updateLogSheet(id, updateData);

      // Navigate back to detail page
      navigate(`/dynamic-log-sheet/${category}/${id}`);
    } catch (err) {
      setError('Failed to save log sheet');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    logSheet,
    formData,
    isLoading,
    isSaving,
    error,
    handleInputChange,
    handleCancel,
    handleSave
  };
};

