import React, { useContext, useEffect, useState } from 'react';
import { DocumentProvider, DocumentContext } from './context/DocumentContext';
import Dashboard from './components/Dashboard';
import DetailPanel from './components/DetailPanel';
import ApiConsole from './components/ApiConsole';
import AuditLog from './components/AuditLog';
import { 
  ShieldCheck, LayoutDashboard, Terminal, Activity, 
  Sun, Moon, ShieldAlert
} from 'lucide-react';

function AppContent() {
  const { activeTab, setActiveTab, selectedDocId } = useContext(DocumentContext);
  
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true; // Default to dark mode for rich developer aesthetics
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="split-container">
            <div className="split-left">
              <Dashboard />
            </div>
            {selectedDocId && <DetailPanel />}
          </div>
        );
      case 'api':
        return <ApiConsole />;
      case 'audit':
        return <AuditLog />;
      default:
        return <Dashboard />;
    }
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Document Verification Dashboard';
      case 'api': return 'Developer API & Integration';
      case 'audit': return 'Verification Audit Trail';
      default: return 'Document Verification Platform';
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <ShieldCheck size={24} className="logo-icon" />
          <span className="logo-text">VerifyDoc AI</span>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard className="nav-item-icon" />
            <span>Dashboard</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'api' ? 'active' : ''}`}
            onClick={() => setActiveTab('api')}
          >
            <Terminal className="nav-item-icon" />
            <span>Developer APIs</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            <Activity className="nav-item-icon" />
            <span>Audit Trail</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
            <ShieldCheck size={12} style={{ color: 'var(--status-success)' }} />
            <span>Verification Status: Active</span>
          </div>
          <span style={{ fontSize: '0.7rem' }}>Version 1.0.0 (Stable)</span>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="main-wrapper">
        <header className="header">
          <div className="header-title-container">
            <h1>{getHeaderTitle()}</h1>
          </div>
          
          <div className="header-actions">
            {/* Theme Toggle */}
            <button 
              className="theme-toggle-btn"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* User Indicator */}
            <div className="user-badge">
              <div className="user-dot"></div>
              <span>Secured Admin Session</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="content-body">
          {renderActiveComponent()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <DocumentProvider>
      <AppContent />
    </DocumentProvider>
  );
}
