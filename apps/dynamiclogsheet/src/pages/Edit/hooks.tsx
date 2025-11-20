import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchLogSheetDetail,
  updateLogSheet,
  LogSheet,
} from '../../../../shared/Api/dynamicLogSheet';

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

  const handleSave = async (structuredFormData?: Record<string, any>) => {
    console.log("=== handleSave CALLED ===");
    console.log("handleSave - ID:", id);
    console.log("handleSave - logSheet exists:", !!logSheet);
    console.log("handleSave - structuredFormData received:", structuredFormData);
    console.log("handleSave - structuredFormData type:", typeof structuredFormData);
    console.log("handleSave - structuredFormData keys:", structuredFormData ? Object.keys(structuredFormData) : "null");
    
    if (!id || !logSheet) {
      console.error("handleSave - Missing ID or logSheet, aborting");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      console.log("handleSave - Original logSheet:", logSheet);
      console.log("handleSave - Original logSheet keys:", Object.keys(logSheet));
      
      // Create the full payload using the GET response as base
      // Only update the form_data field, keep everything else unchanged
      const updateData: any = {
        ...logSheet, // Start with full GET response
        form_data: structuredFormData || logSheet.form_data, // Update only form_data
      };

      console.log("handleSave - updateData before cleanup:", updateData);
      console.log("handleSave - updateData keys before cleanup:", Object.keys(updateData));

      // Ensure we don't send read-only or computed fields that shouldn't be updated
      // Remove fields that shouldn't be in PATCH request
      delete updateData.id; // ID shouldn't be in PATCH
      delete updateData.created_at; // Created timestamp shouldn't change
      delete updateData.created_by; // Created by shouldn't change
      
      // Keep updated_at and modified_at as they might be auto-updated by backend
      // Keep all other fields from GET response

      console.log("handleSave - updateData after cleanup:", updateData);
      console.log("handleSave - updateData keys after cleanup:", Object.keys(updateData));
      console.log("handleSave - Updated form_data:", updateData.form_data);
      console.log("handleSave - form_data keys:", updateData.form_data ? Object.keys(updateData.form_data) : "null");
      
      // Log each section's form_data with detailed field information
      if (updateData.form_data) {
        Object.entries(updateData.form_data).forEach(([sectionId, sectionData]: [string, any]) => {
          console.log(`handleSave - form_data section ${sectionId}:`, sectionData);
          if (sectionData?.data) {
            console.log(`handleSave - Section ${sectionId} data keys:`, Object.keys(sectionData.data));
            Object.entries(sectionData.data).forEach(([key, value]) => {
              console.log(`handleSave - Section ${sectionId} data[${key}]:`, {
                value,
                type: typeof value,
                isDate: value instanceof Date,
                stringified: value instanceof Date ? value.toISOString() : value
              });
            });
          }
        });
      }
      
      console.log("handleSave - Calling updateLogSheet API...");
      console.log("handleSave - Payload to send:", JSON.stringify(updateData, null, 2));
      
      const response = await updateLogSheet(id, updateData);
      
      console.log("handleSave - API response received:", response);
      console.log("handleSave - API response keys:", Object.keys(response));
      
      // Log the returned form_data to verify it matches what we sent
      if (response?.form_data) {
        console.log("handleSave - API response form_data:", response.form_data);
        Object.entries(response.form_data).forEach(([sectionId, sectionData]: [string, any]) => {
          console.log(`handleSave - Response form_data section ${sectionId}:`, sectionData);
          if (sectionData?.data) {
            Object.entries(sectionData.data).forEach(([key, value]) => {
              console.log(`handleSave - Response section ${sectionId} data[${key}]:`, {
                value,
                type: typeof value
              });
            });
          }
        });
      }
      
      console.log("=== handleSave SUCCESS ===");

      // Navigate back to detail page
      navigate(`/dynamic-log-sheet/${id}`);
    } catch (err) {
      console.error("=== handleSave ERROR ===");
      console.error("handleSave - Error saving log sheet:", err);
      console.error("handleSave - Error details:", err instanceof Error ? err.message : String(err));
      console.error("handleSave - Error stack:", err instanceof Error ? err.stack : "No stack");
      setError('Failed to save log sheet');
    } finally {
      setIsSaving(false);
      console.log("handleSave - isSaving set to false");
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

