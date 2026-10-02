import React, { useContext, useState, useEffect } from 'react';
import { DocumentContext } from '../context/DocumentContext';
import { Key, Copy, Terminal, Plus, Trash2, Check, Code, RefreshCw } from 'lucide-react';

export default function ApiConsole() {
  const { apiKeys, generateApiKey, revokeApiKey, documents, selectedDocId } = useContext(DocumentContext);
  
  const [keyName, setKeyName] = useState('');
  const [activeLangTab, setActiveLangTab] = useState('curl');
  const [copiedKey, setCopiedKey] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Interactive console states
  const [sandboxDocId, setSandboxDocId] = useState('example');
  const [payloadText, setPayloadText] = useState(
`{
  "document_type": "Passport",
  "document_name": "passport_smith.pdf",
  "image_base64": "data:image/pdf;base64,JVBERi0xLjQKJ..."
}`
  );
  
  const [apiResponse, setApiResponse] = useState(null);
  const [isSending, setIsSending] = useState(false);

  // Sync sandbox with selected document context
  useEffect(() => {
    if (selectedDocId) {
      setSandboxDocId(selectedDocId);
      const doc = documents.find(d => d.id === selectedDocId);
      if (doc) {
        setPayloadText(JSON.stringify({
          document_type: doc.type,
          document_name: doc.name,
          image_base64: `data:image/pdf;base64,${doc.hash.substring(0, 20)}...`
        }, null, 2));
      }
    }
  }, [selectedDocId, documents]);

  const handleSelectDoc = (docId) => {
    setSandboxDocId(docId);
    if (docId === 'example') {
      setPayloadText(
`{
  "document_type": "Passport",
  "document_name": "passport_smith.pdf",
  "image_base64": "data:image/pdf;base64,JVBERi0xLjQKJ..."
}`
      );
    } else {
      const doc = documents.find(d => d.id === docId);
      if (doc) {
        setPayloadText(JSON.stringify({
          document_type: doc.type,
          document_name: doc.name,
          image_base64: `data:image/pdf;base64,${doc.hash.substring(0, 20)}...`
        }, null, 2));
      }
    }
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    generateApiKey(keyName.trim());
    setKeyName('');
  };

  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSendRequest = () => {
    setIsSending(true);
    setApiResponse(null);

    // Parse payload safely
    let parsedPayload;
    try {
      parsedPayload = JSON.parse(payloadText);
    } catch (err) {
      setTimeout(() => {
        setApiResponse({
          status: 400,
          statusText: 'Bad Request',
          error: 'Invalid JSON payload structure'
        });
        setIsSending(false);
      }, 500);
      return;
    }

    // Simulate API network latency
    setTimeout(() => {
      const matchedDoc = documents.find(d => d.name === parsedPayload.document_name);
      
      if (matchedDoc) {
        setApiResponse({
          status: 200,
          statusText: 'OK',
          data: {
            id: matchedDoc.id,
            fileName: matchedDoc.name,
            documentType: matchedDoc.type,
            scannedAt: matchedDoc.uploadedAt,
            integrityScore: matchedDoc.matchRate,
            hash: matchedDoc.hash,
            ocrResult: {
              fullName: matchedDoc.metadata.fullName,
              documentNumber: matchedDoc.metadata.documentNumber,
              expiryDate: matchedDoc.metadata.expiryDate,
              issuer: matchedDoc.metadata.issuer
            },
            checks: {
              expiryCheck: { status: matchedDoc.checks.expiryCheck.status, value: matchedDoc.checks.expiryCheck.message },
              registryMatch: { status: matchedDoc.checks.registryCheck.status, value: matchedDoc.checks.registryCheck.message },
              integrityCheck: { status: matchedDoc.checks.integrityCheck.status, value: matchedDoc.checks.integrityCheck.message },
              duplicateCheck: { status: matchedDoc.checks.duplicateCheck.status, value: matchedDoc.checks.duplicateCheck.message }
            },
            recommendation: matchedDoc.status === 'Verified' ? 'VERIFIED_CONFIRMED' : `FLAGGED_${matchedDoc.status.toUpperCase()}`
          }
        });
      } else {
        const mockResultId = `doc-api-${Math.floor(100000 + Math.random() * 900000)}`;
        const generatedHash = Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');

        setApiResponse({
          status: 201,
          statusText: 'Created',
          data: {
            id: mockResultId,
            fileName: parsedPayload.document_name || 'unknown.pdf',
            documentType: parsedPayload.document_type || 'Passport',
            scannedAt: new Date().toISOString(),
            integrityScore: 92,
            hash: generatedHash,
            ocrResult: {
              fullName: 'ALEX SMITH',
              documentNumber: 'A20938481',
              expiryDate: '2032-11-18',
              issuer: 'Dept of Foreign Affairs'
            },
            checks: {
              expiryCheck: { status: 'pass', value: 'Active (Expires 2032)' },
              registryMatch: { status: 'pass', value: 'Confirmed Official Record' },
              integrityCheck: { status: 'pass', value: 'No alterations' },
              duplicateCheck: { status: 'pass', value: 'Unique Checksum' }
            },
            recommendation: 'VERIFIED_CONFIRMED'
          }
        });
      }
      setIsSending(false);
    }, 1000);
  };

  const getCodeSnippet = () => {
    const key = apiKeys[0]?.key || 'doc_live_your_api_key_goes_here';
    
    let docType = 'Passport';
    let docName = 'passport_smith.pdf';
    let docBase64 = 'data:image/pdf;base64,JVBERi0xLjQKJ...';

    try {
      const parsed = JSON.parse(payloadText);
      docType = parsed.document_type || docType;
      docName = parsed.document_name || docName;
      docBase64 = parsed.image_base64 || docBase64;
    } catch (e) {
      // Ignore parse issues during active typing
    }
    
    switch (activeLangTab) {
      case 'js':
        return `const myHeaders = new Headers();
myHeaders.append("Authorization", "Bearer ${key}");
myHeaders.append("Content-Type", "application/json");

const raw = JSON.stringify({
  "document_type": "${docType}",
  "document_name": "${docName}",
  "image_base64": "${docBase64}"
});

const requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: raw,
  redirect: 'follow'
};

fetch("https://api.verifydoc.org/v1/verify", requestOptions)
  .then(response => response.json())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));`;
      
      case 'python':
        return `import requests
import json

url = "https://api.verifydoc.org/v1/verify"

payload = json.dumps({
  "document_type": "${docType}",
  "document_name": "${docName}",
  "image_base64": "${docBase64}"
})
headers = {
  'Authorization': 'Bearer ${key}',
  'Content-Type': 'application/json'
}

response = requests.request("POST", url, headers=headers, data=payload)

print(response.json())`;

      case 'curl':
      default:
        return `curl --location --request POST 'https://api.verifydoc.org/v1/verify' \\
--header 'Authorization: Bearer ${key}' \\
--header 'Content-Type: application/json' \\
--data-raw '{
    "document_type": "${docType}",
    "document_name": "${docName}",
    "image_base64": "${docBase64}"
}'`;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Introduction */}
      <div className="api-card">
        <div className="api-section-header">
          <h2>API & Developer Portal</h2>
          <p>Integrate our verification engine directly into your HR, onboarding, or invoicing pipelines.</p>
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Our simple REST API allows you to upload document files (as raw bytes or base64 data) and receive 
          instant JSON payloads with extracted metadata, authenticity flags, and integrity verification reports.
        </div>
      </div>

      {/* Key Management */}
      <div className="api-card">
        <div className="api-section-header">
          <h2>API Key Management</h2>
          <p>Generate secure credentials to authenticate your server-side requests.</p>
        </div>

        <form onSubmit={handleGenerate} className="key-generator-box">
          <input 
            type="text" 
            placeholder="Key Name (e.g. Production Mobile App)" 
            className="search-input"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            style={{ paddingLeft: '14px' }}
          />
          <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
            <Plus size={16} /> Generate Key
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
          {apiKeys.map(k => (
            <div key={k.key} className="api-key-display">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{k.name}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{k.key}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '6px 8px', borderRadius: '6px' }}
                  onClick={() => handleCopyKey(k.key)}
                >
                  {copiedKey === k.key ? <Check size={14} style={{ color: 'var(--status-success)' }} /> : <Copy size={14} />}
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '6px 8px', borderRadius: '6px' }}
                  onClick={() => revokeApiKey(k.key)}
                >
                  <Trash2 size={14} style={{ color: 'var(--status-error)' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Documentation & Code Blocks */}
      <div className="api-card">
        <div className="api-section-header">
          <h2>SDK & Integration Code</h2>
          <p>Client examples showing how to parse files and trigger checks.</p>
        </div>

        <div className="code-tabs">
          <button 
            className={`code-tab-btn ${activeLangTab === 'curl' ? 'active' : ''}`}
            onClick={() => setActiveLangTab('curl')}
          >
            cURL (Bash)
          </button>
          <button 
            className={`code-tab-btn ${activeLangTab === 'js' ? 'active' : ''}`}
            onClick={() => setActiveLangTab('js')}
          >
            Node.js (Fetch)
          </button>
          <button 
            className={`code-tab-btn ${activeLangTab === 'python' ? 'active' : ''}`}
            onClick={() => setActiveLangTab('python')}
          >
            Python (Requests)
          </button>
        </div>

        <div className="code-block-container">
          <button className="copy-badge" onClick={handleCopyCode}>
            {copiedCode ? <Check size={12} style={{ color: 'var(--status-success)' }} /> : 'Copy Code'}
          </button>
          <pre>
            <code>{getCodeSnippet()}</code>
          </pre>
        </div>
      </div>

      {/* Interactive API Console */}
      <div className="api-card">
        <div className="api-section-header">
          <h2>Interactive API Sandbox</h2>
          <p>Send a test JSON payload to the mock endpoint `/v1/verify` to explore outputs.</p>
        </div>

        <div className="api-console-interactive">
          {/* Document selection helper */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
            <span className="console-label" style={{ fontSize: '0.7rem' }}>Quick Load Submitted Document Data</span>
            <select 
              className="filter-select" 
              value={sandboxDocId}
              onChange={(e) => handleSelectDoc(e.target.value)}
              style={{ maxWidth: '400px' }}
            >
              <option value="example">Static Mock Example (Passport)</option>
              {documents.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.type} — {d.status})</option>
              ))}
            </select>
          </div>

          <div className="console-grid">
            <div className="console-col">
              <span className="console-label">Request Body (JSON)</span>
              <textarea 
                className="console-textarea"
                value={payloadText}
                onChange={(e) => setPayloadText(e.target.value)}
              />
            </div>
            
            <div className="console-col">
              <span className="console-label">Response Panel</span>
              
              {/* Endpoint target indicator */}
              <div style={{
                backgroundColor: 'rgba(37, 99, 235, 0.08)',
                border: '1px solid rgba(37, 99, 235, 0.2)',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)'
              }}>
                <div>
                  <span style={{ color: '#2563eb', fontWeight: 'bold', marginRight: '8px' }}>POST</span>
                  <span style={{ color: 'var(--text-primary)' }}>https://api.verifydoc.org/v1/verify</span>
                </div>
                <span className="badge badge-info" style={{ textTransform: 'none', fontSize: '0.65rem' }}>Active Endpoint</span>
              </div>

              <div className="console-response">
                {isSending ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <RefreshCw className="animate-spin" size={24} style={{ color: 'var(--accent-color)' }} />
                    <span style={{ marginLeft: '12px' }}>Waiting for verification...</span>
                  </div>
                ) : apiResponse ? (
                  `HTTP/1.1 ${apiResponse.status} ${apiResponse.statusText}\nContent-Type: application/json\n\n${JSON.stringify(apiResponse.data || apiResponse, null, 2)}`
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>Configure payload and click "Send Request" to test.</span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              className="btn btn-primary" 
              onClick={handleSendRequest}
              disabled={isSending}
            >
              <Terminal size={16} /> Send API Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
