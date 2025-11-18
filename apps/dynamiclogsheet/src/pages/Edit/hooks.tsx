import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchLogSheetDetail, updateLogSheet } from './api';
import { LogSheet } from './types';

export interface FormData {
  name: string;
  status: string;
  assigned_to: string;
  description: string;
}

export const useEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
        console.error('Error fetching log sheet detail:', err);
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
      navigate(`/dynamic-log-sheet/${id}`);
    }
  };

  const handleSave = async () => {
    if (!id) return;

    setIsSaving(true);
    setError(null);

    try {
      await updateLogSheet(id, formData);

      // Navigate back to detail page
      navigate(`/dynamic-log-sheet/${id}`);
    } catch (err) {
      console.error('Error saving log sheet:', err);
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

