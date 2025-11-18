import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchLogSheetDetail, updateLogSheet } from './api';
import { LogSheet } from './types';
import './Edit.scss';

interface FormData {
  name: string;
  status: string;
  assigned_to: string;
  description: string;
}

const Edit: React.FC = () => {
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
    navigate(`/dynamic-log-sheet/${id}`);
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

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="detail-container">
          <div className="empty-state">
            <p>Loading log sheet...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !logSheet) {
    return (
      <div className="page-container">
        <div className="detail-container">
          <div className="empty-state">
            <p>{error}</p>
            <button onClick={() => navigate('/dynamic-log-sheet')} className="back-button">
              Back to List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="detail-header">
        <button onClick={handleCancel} className="back-button">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 5L7 10L12 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Cancel
        </button>
        <h1 className="detail-title">Edit Log Sheet</h1>
        <button
          onClick={handleSave}
          className="save-button"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="detail-container">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="detail-card">
          <div className="detail-section">
            <h2 className="section-title">Basic Information</h2>
            <div className="form-grid">
              <div className="form-field">
                <label className="field-label">Name</label>
                <input
                  type="text"
                  className="field-input"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter log sheet name"
                />
              </div>

              <div className="form-field">
                <label className="field-label">Status</label>
                <select
                  className="field-input"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <option value="">Select status</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="InProgress">In Progress</option>
                  <option value="PendingReview">Pending Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="form-field">
                <label className="field-label">Assigned To</label>
                <input
                  type="text"
                  className="field-input"
                  value={formData.assigned_to}
                  onChange={(e) => handleInputChange('assigned_to', e.target.value)}
                  placeholder="Enter assignee name"
                />
              </div>

              <div className="form-field full-width">
                <label className="field-label">Description</label>
                <textarea
                  className="field-textarea"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter description"
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h2 className="section-title">Read-Only Information</h2>
            <div className="detail-grid">
              <div className="detail-field">
                <label className="field-label">ID</label>
                <div className="field-value">{logSheet?.id}</div>
              </div>
              <div className="detail-field">
                <label className="field-label">Template</label>
                <div className="field-value">{logSheet?.template_name || logSheet?.template || '-'}</div>
              </div>
              <div className="detail-field">
                <label className="field-label">Created By</label>
                <div className="field-value">{logSheet?.created_by || '-'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Edit;
