import React, { useContext, useState } from 'react';
import { DocumentContext } from '../context/DocumentContext';
import { Clock, Search, Download, ShieldCheck, Activity } from 'lucide-react';

export default function AuditLog() {
  const { history, setActiveTab, setSelectedDocId } = useContext(DocumentContext);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = history.filter(log => {
    return log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
           log.actor.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `verification_audit_log_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleLogDocClick = (e, docId) => {
    e.preventDefault();
    setSelectedDocId(docId);
    setActiveTab('dashboard');
  };

  const getNodeClass = (status) => {
    switch (status) {
      case 'success': return 'audit-node success';
      case 'error': return 'audit-node error';
      case 'warning': return 'audit-node warning';
      default: return 'audit-node';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div className="table-toolbar">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input 
            type="text" 
            placeholder="Search logs by keyword, action, or user..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className="btn btn-secondary" onClick={handleExport}>
          <Download size={16} /> Export Logs (JSON)
        </button>
      </div>

      {/* Timeline Card */}
      <div className="table-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Activity size={20} style={{ color: 'var(--accent-color)' }} />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: '700', fontSize: '1.25rem' }}>
            System Audit Trail
          </h2>
        </div>

        <div className="audit-timeline">
          {filteredLogs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>
              No audit records matching criteria.
            </div>
          ) : (
            filteredLogs.map(log => (
              <div key={log.id} className={getNodeClass(log.status)}>
                <div className="audit-meta">
                  <span className="audit-time">
                    {new Date(log.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                  <span>•</span>
                  <span className="audit-actor">{log.actor}</span>
                </div>
                <div className="audit-message">{log.message}</div>
                {log.docId && (
                  <a 
                    href="#" 
                    className="audit-doc"
                    onClick={(e) => handleLogDocClick(e, log.docId)}
                  >
                    Inspect Document →
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
