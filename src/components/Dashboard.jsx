import React, { useContext, useState, useRef } from 'react';
import { DocumentContext } from '../context/DocumentContext';
import { 
  UploadCloud, FileText, CheckCircle2, AlertTriangle, XCircle, 
  Search, Trash2, Shield, Activity, RefreshCw,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight
} from 'lucide-react';

export default function Dashboard() {
  const { 
    documents, 
    selectedDocId, 
    setSelectedDocId, 
    uploadDocument, 
    deleteDocument 
  } = useContext(DocumentContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Local uploading animation state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const { dataTransfer } = e;
    const { files } = dataTransfer;
    if (files.length > 0) {
      simulateUpload(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const { target } = e;
    const { files } = target;
    if (files.length > 0) {
      simulateUpload(files[0]);
    }
  };

  const simulateUpload = (file) => {
    setIsUploading(true);
    setUploadProgress(10);
    
    // Animate a bit of progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      uploadDocument(file);
      setIsUploading(false);
      setUploadProgress(0);
    }, 1200);
  };

  // KPIs
  const totalDocs = documents.length;
  const verifiedDocs = documents.filter(d => d.status === 'Verified').length;
  const expiredDocs = documents.filter(d => d.status === 'Expired').length;
  const flaggedDocs = documents.filter(d => d.status === 'Altered' || d.status === 'Duplicate').length;

  // Filter & Search
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.metadata.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.metadata.documentNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDocs = filteredDocs.slice(indexOfFirstItem, indexOfLastItem);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Verified':
        return <span className="badge badge-success"><CheckCircle2 size={12} /> Verified</span>;
      case 'Expired':
        return <span className="badge badge-error"><XCircle size={12} /> Expired</span>;
      case 'Altered':
        return <span className="badge badge-error"><AlertTriangle size={12} /> Altered</span>;
      case 'Duplicate':
        return <span className="badge badge-warning"><AlertTriangle size={12} /> Duplicate</span>;
      default:
        return <span className="badge badge-info"><RefreshCw size={12} className="animate-spin" /> Pending</span>;
    }
  };

  const getMatchRateProgress = (rate) => {
    let fillColor = 'var(--status-success)';
    if (rate < 70) fillColor = 'var(--status-error)';
    else if (rate < 90) fillColor = 'var(--status-warning)';

    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${rate}%`, backgroundColor: fillColor }}
          />
        </div>
        <span className="progress-text" style={{ color: fillColor }}>{rate}%</span>
      </div>
    );
  };

  return (
    <>
      {/* KPI Row */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--accent-color-bg)', color: 'var(--accent-color)' }}>
            <FileText size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-title">Total Submissions</span>
            <span className="kpi-value">{totalDocs}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--status-success-bg)', color: 'var(--status-success)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-title">Verified (Valid)</span>
            <span className="kpi-value">{verifiedDocs}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--status-error-bg)', color: 'var(--status-error)' }}>
            <XCircle size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-title">Expired Documents</span>
            <span className="kpi-value">{expiredDocs}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--status-warning-bg)', color: 'var(--status-warning)' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-title">Flagged / Altered</span>
            <span className="kpi-value">{flaggedDocs}</span>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div 
        className="upload-container"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="file-input" 
          onChange={handleFileChange}
          accept=".pdf,.png,.jpg,.jpeg"
        />
        {isUploading ? (
          <>
            <RefreshCw className="upload-icon animate-spin" />
            <div className="upload-title">Analyzing OCR & Checking Integrity...</div>
            <div style={{ width: '200px', backgroundColor: 'var(--border-color)', height: '6px', borderRadius: '3px', overflow: 'hidden', marginTop: '8px' }}>
              <div style={{ width: `${uploadProgress}%`, backgroundColor: 'var(--accent-color)', height: '100%', transition: 'width 0.2s ease' }}></div>
            </div>
          </>
        ) : (
          <>
            <UploadCloud className="upload-icon" />
            <div className="upload-title">Upload a document for verification</div>
            <div className="upload-sub">Supports PDF, PNG, JPG, or JPEG (Max 10MB)</div>
          </>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="table-toolbar">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by filename, owner name, ID..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>

        <select 
          className="filter-select"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
        >
          <option value="All">All Statuses</option>
          <option value="Verified">Verified</option>
          <option value="Expired">Expired</option>
          <option value="Altered">Altered</option>
          <option value="Duplicate">Duplicate</option>
        </select>
      </div>

      {/* Data Table */}
      <div className="table-card">
        <div className="table-header-row">
          <span className="table-title">Verification Dashboard</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredDocs.length)} of {filteredDocs.length} documents
          </span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Document Details</th>
                <th>Type</th>
                <th>Owner Name</th>
                <th>Integrity Match</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentDocs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No matching documents found.
                  </td>
                </tr>
              ) : (
                currentDocs.map(doc => (
                  <tr 
                    key={doc.id} 
                    className={selectedDocId === doc.id ? 'selected' : ''}
                    onClick={() => setSelectedDocId(doc.id)}
                  >
                    <td>
                      <div className="doc-name-cell">
                        <div className="doc-icon">
                          <FileText size={18} />
                        </div>
                        <div>
                          <div className="doc-name">{doc.name}</div>
                          <div className="doc-meta">{doc.size} • {new Date(doc.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        </div>
                      </div>
                    </td>
                    <td>{doc.type}</td>
                    <td>{doc.metadata.fullName || 'N/A'}</td>
                    <td>{getMatchRateProgress(doc.matchRate)}</td>
                    <td>{getStatusBadge(doc.status)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '6px 10px', borderRadius: '6px' }}
                        onClick={() => deleteDocument(doc.id)}
                        title="Delete Document"
                      >
                        <Trash2 size={14} style={{ color: 'var(--status-error)' }} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="pagination">
          <span>Page {currentPage} of {totalPages}</span>
          <div className="pagination-actions">
            <button 
              className="pagination-btn"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft size={16} />
            </button>
            <button 
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => prev - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </button>
            <button 
              className="pagination-btn"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
