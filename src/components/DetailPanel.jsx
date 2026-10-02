import React, { useContext, useEffect, useState } from 'react';
import { DocumentContext } from '../context/DocumentContext';
import { 
  X, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, 
  Calendar, User, CreditCard, Landmark, Edit3, Trash2
} from 'lucide-react';

export default function DetailPanel() {
  const { 
    documents, 
    selectedDocId, 
    setSelectedDocId, 
    updateDocumentMetadata, 
    updateDocumentStatus 
  } = useContext(DocumentContext);

  const doc = documents.find(d => d.id === selectedDocId);

  // Local editing states
  const [fullName, setFullName] = useState('');
  const [docNum, setDocNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [issuer, setIssuer] = useState('');

  // Sync editing fields with selected document changes
  useEffect(() => {
    if (doc) {
      setFullName(doc.metadata.fullName || '');
      setDocNum(doc.metadata.documentNumber || '');
      setExpiry(doc.metadata.expiryDate || '');
      setIssuer(doc.metadata.issuer || '');
    }
  }, [selectedDocId, doc]);

  if (!doc) return null;

  const handleFieldBlur = (field, val) => {
    updateDocumentMetadata(doc.id, { [field]: val });
  };

  const getCheckIcon = (status) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 size={16} style={{ color: 'var(--status-success)' }} />;
      case 'fail':
        return <XCircle size={16} style={{ color: 'var(--status-error)' }} />;
      case 'warn':
        return <AlertTriangle size={16} style={{ color: 'var(--status-warning)' }} />;
      default:
        return null;
    }
  };

  return (
    <div className="split-right">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">{doc.type} Analysis</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            ID: {doc.id}
          </span>
        </div>
        <button className="panel-close-btn" onClick={() => setSelectedDocId(null)}>
          <X size={20} />
        </button>
      </div>

      <div className="panel-content">
        {/* OCR Scanning Simulation Area */}
        <div>
          <span className="panel-section-title">Visual OCR Scanner Preview</span>
          <div className="ocr-visualizer">
            <div className="ocr-scanner-line"></div>
            
            {/* Draw Simulated Document Box */}
            <div style={{
              width: '80%',
              height: '75%',
              border: '2px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              position: 'relative',
              padding: '10px'
            }}>
              {/* Document Header in preview */}
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                OFFICIAL {doc.type} DOCUMENT
              </div>
              
              {/* Draw bounding boxes mapped to metadata */}
              {doc.ocrBoxes.map((box, idx) => (
                <div 
                  key={idx} 
                  className="ocr-overlay-box"
                  style={{
                    top: `${box.top}%`,
                    left: `${box.left}%`,
                    width: `${box.width}%`,
                    height: '14px',
                    fontSize: '0.55rem'
                  }}
                >
                  {box.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Validation Checks */}
        <div>
          <span className="panel-section-title">Automated Verification Checks</span>
          <div className="checks-list">
            {Object.entries(doc.checks).map(([key, check]) => (
              <div key={key} className={`check-item ${check.status}`}>
                <div className="check-icon-wrapper">
                  {getCheckIcon(check.status)}
                </div>
                <div className="check-details">
                  <span className="check-name">{check.name}</span>
                  <span className="check-desc">{check.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Extracted Fields Metadata */}
        <div>
          <span className="panel-section-title">Parsed Metadata (Review & Edit)</span>
          <div className="field-group">
            <div className="meta-field">
              <span className="meta-field-label">
                <User size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Full Name / Owner
              </span>
              <input 
                type="text" 
                className="meta-field-input" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onBlur={() => handleFieldBlur('fullName', fullName)}
              />
            </div>

            <div className="meta-field">
              <span className="meta-field-label">
                <CreditCard size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Document Number
              </span>
              <input 
                type="text" 
                className="meta-field-input" 
                value={docNum}
                onChange={(e) => setDocNum(e.target.value)}
                onBlur={() => handleFieldBlur('documentNumber', docNum)}
              />
            </div>

            {doc.metadata.expiryDate !== 'N/A' && (
              <div className="meta-field">
                <span className="meta-field-label">
                  <Calendar size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Expiry Date
                </span>
                <input 
                  type="date" 
                  className="meta-field-input" 
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  onBlur={() => handleFieldBlur('expiryDate', expiry)}
                />
              </div>
            )}

            <div className="meta-field">
              <span className="meta-field-label">
                <Landmark size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Authority Issuer
              </span>
              <input 
                type="text" 
                className="meta-field-input" 
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                onBlur={() => handleFieldBlur('issuer', issuer)}
              />
            </div>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
            * Modifying values will automatically rerun validation algorithms.
          </p>
        </div>
      </div>

      {/* manual action buttons */}
      <div className="panel-footer">
        <button 
          className="btn btn-success"
          onClick={() => updateDocumentStatus(doc.id, 'Verified')}
          disabled={doc.status === 'Verified'}
        >
          Approve
        </button>
        <button 
          className="btn btn-danger"
          onClick={() => updateDocumentStatus(doc.id, 'Altered')}
          disabled={doc.status === 'Altered'}
        >
          Reject
        </button>
        <button 
          className="btn btn-warning"
          onClick={() => updateDocumentStatus(doc.id, 'Duplicate')}
          disabled={doc.status === 'Duplicate'}
        >
          Flag Duplicate
        </button>
      </div>
    </div>
  );
}
