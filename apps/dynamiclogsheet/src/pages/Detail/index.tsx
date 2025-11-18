import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchLogSheetDetail } from './api';
import { LogSheet } from './types';
import { formatDate } from './utils';
import './Detail.scss';
import DetailComponent from '../../components/Detail/DetailComponent';

const Detail: React.FC = () => {
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

  const handleBack = () => {
    navigate('/dynamic-log-sheet');
  };

  const handleEdit = () => {
    navigate(`/dynamic-log-sheet/${id}/edit`);
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="detail-container">
          <div className="empty-state">
            <p>Loading log sheet details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !logSheet) {
    return (
      <div className="page-container">
        <div className="detail-container">
          <div className="empty-state">
            <p>{error || 'Log sheet not found'}</p>
            <button onClick={handleBack} className="back-button">
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
        <button onClick={handleBack} className="back-button">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 5L7 10L12 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <h1 className="detail-title">Log Sheet Details</h1>
        <button onClick={handleEdit} className="edit-button">
          Edit
        </button>
      </div>

      <div className="detail-container">
        <div className="detail-card">
          <div className="detail-section">
            <h2 className="section-title">Basic Information</h2>
            <div className="detail-grid">
              <div className="detail-field">
                <label className="field-label">ID</label>
                <div className="field-value">{logSheet.id}</div>
              </div>
              <div className="detail-field">
                <label className="field-label">Name</label>
                <div className="field-value">{logSheet.name || '-'}</div>
              </div>
              <div className="detail-field">
                <label className="field-label">Template</label>
                <div className="field-value">{logSheet.template_name || logSheet.template || '-'}</div>
              </div>
              <div className="detail-field">
                <label className="field-label">Status</label>
                <div className="field-value">
                  <span className={`status-badge status-${logSheet.status?.toLowerCase()}`}>
                    {logSheet.status || '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h2 className="section-title">Additional Details</h2>
            <div className="detail-grid">
              <div className="detail-field">
                <label className="field-label">Created By</label>
                <div className="field-value">{logSheet.created_by || '-'}</div>
              </div>
              <div className="detail-field">
                <label className="field-label">Assigned To</label>
                <div className="field-value">{logSheet.assigned_to || '-'}</div>
              </div>
              <div className="detail-field">
                <label className="field-label">Created At</label>
                <div className="field-value">{logSheet.created_at ? formatDate(logSheet.created_at) : '-'}</div>
              </div>
              <div className="detail-field">
                <label className="field-label">Updated At</label>
                <div className="field-value">{logSheet.updated_at ? formatDate(logSheet.updated_at) : '-'}</div>
              </div>
            </div>
          </div>

          {logSheet.description && (
            <div className="detail-section">
              <h2 className="section-title">Description</h2>
              <div className="field-value">{logSheet.description}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Detail;
