import React, { createContext, useState, useEffect } from 'react';

export const DocumentContext = createContext();

const initialMockDocuments = [
  {
    id: 'doc-101',
    name: 'passport_john_doe.pdf',
    type: 'Passport',
    size: '1.2 MB',
    uploadedAt: '2026-08-08T09:15:30Z',
    status: 'Verified', // Verified, Expired, Altered, Duplicate, Pending
    matchRate: 98,
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    metadata: {
      documentNumber: 'A9283941',
      fullName: 'JOHN DOE',
      dateOfBirth: '1988-11-23',
      expiryDate: '2031-05-12',
      issuer: 'US Dept of State',
    },
    checks: {
      expiryCheck: { status: 'pass', name: 'Validity Check', message: 'Document is active. Expiry: May 12, 2031' },
      formatCheck: { status: 'pass', name: 'Format Validation', message: 'Passport MRZ machine-readable zones are valid' },
      registryCheck: { status: 'pass', name: 'Authority Match', message: 'Matches US Dept of State database record' },
      integrityCheck: { status: 'pass', name: 'Integrity Check', message: 'No physical alterations or font anomalies detected' },
      duplicateCheck: { status: 'pass', name: 'Duplicate Check', message: 'Unique document checksum' }
    },
    ocrBoxes: [
      { text: 'PASSPORT', top: 12, left: 10, width: 25 },
      { text: 'JOHN DOE', top: 38, left: 15, width: 40 },
      { text: 'A9283941', top: 58, left: 60, width: 30 },
      { text: '23 NOV 1988', top: 72, left: 15, width: 25 }
    ]
  },
  {
    id: 'doc-102',
    name: 'drivers_license_expired.png',
    type: 'Driver License',
    size: '840 KB',
    uploadedAt: '2026-08-08T10:30:15Z',
    status: 'Expired',
    matchRate: 85,
    hash: '5891b5b522d5df086d0ff0b110fbd9d21bb4fc7163af34d08286a2e846f6be03',
    metadata: {
      documentNumber: 'DL-882941-CA',
      fullName: 'SARAH CONNOR',
      dateOfBirth: '1965-02-28',
      expiryDate: '2025-02-14', // Expired in 2025
      issuer: 'California DMV',
    },
    checks: {
      expiryCheck: { status: 'fail', name: 'Validity Check', message: 'Document expired on Feb 14, 2025' },
      formatCheck: { status: 'pass', name: 'Format Validation', message: 'License format matches CA standard templates' },
      registryCheck: { status: 'pass', name: 'Authority Match', message: 'Matches CA DMV database record' },
      integrityCheck: { status: 'pass', name: 'Integrity Check', message: 'Visual elements are consistent' },
      duplicateCheck: { status: 'pass', name: 'Duplicate Check', message: 'Unique document checksum' }
    },
    ocrBoxes: [
      { text: 'DRIVER LICENSE', top: 15, left: 20, width: 45 },
      { text: 'SARAH CONNOR', top: 42, left: 10, width: 35 },
      { text: 'DL-882941-CA', top: 56, left: 10, width: 40 },
      { text: 'EXP 02/14/2025', top: 76, left: 60, width: 30 }
    ]
  },
  {
    id: 'doc-103',
    name: 'invoice_altered.pdf',
    type: 'Invoice',
    size: '412 KB',
    uploadedAt: '2026-08-08T11:45:00Z',
    status: 'Altered',
    matchRate: 42,
    hash: 'a12c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b1122',
    metadata: {
      documentNumber: 'INV-2026-904',
      fullName: 'ACME CORPORATION',
      dateOfBirth: 'N/A',
      expiryDate: 'N/A',
      issuer: 'ACME Corp Supplier',
    },
    checks: {
      expiryCheck: { status: 'pass', name: 'Validity Check', message: 'Document is not time-restricted' },
      formatCheck: { status: 'pass', name: 'Format Validation', message: 'Standard invoice format match' },
      registryCheck: { status: 'fail', name: 'Authority Match', message: 'Amount mismatch: Issuer database shows $1,000, but file shows $2,500' },
      integrityCheck: { status: 'fail', name: 'Integrity Check', message: 'Metadata modification date is after visual date. Font size differences in totals.' },
      duplicateCheck: { status: 'pass', name: 'Duplicate Check', message: 'Unique document checksum' }
    },
    ocrBoxes: [
      { text: 'INVOICE', top: 10, left: 70, width: 20 },
      { text: 'INV-2026-904', top: 22, left: 70, width: 20 },
      { text: 'ACME CORP', top: 30, left: 10, width: 30 },
      { text: 'TOTAL: $2,500.00', top: 82, left: 60, width: 30 }
    ]
  },
  {
    id: 'doc-104',
    name: 'certificate_duplicate.jpg',
    type: 'Certificate',
    size: '2.1 MB',
    uploadedAt: '2026-08-08T12:10:00Z',
    status: 'Duplicate',
    matchRate: 92,
    hash: 'c891b5b522d5df086d0ff0b110fbd9d21bb4fc7163af34d08286a2e846f6be03',
    metadata: {
      documentNumber: 'CERT-STN-9021',
      fullName: 'ALEX SMITH',
      dateOfBirth: 'N/A',
      expiryDate: 'N/A',
      issuer: 'Stanford Online University',
    },
    checks: {
      expiryCheck: { status: 'pass', name: 'Validity Check', message: 'Certificate has no expiration date' },
      formatCheck: { status: 'pass', name: 'Format Validation', message: 'Valid digital certificate layout' },
      registryCheck: { status: 'pass', name: 'Authority Match', message: 'Credential matches Stanford registry' },
      integrityCheck: { status: 'pass', name: 'Integrity Check', message: 'Digital signature is valid' },
      duplicateCheck: { status: 'fail', name: 'Duplicate Check', message: 'Conflict: Document with matching content hash already submitted (ID: doc-105)' }
    },
    ocrBoxes: [
      { text: 'STANFORD UNIVERSITY', top: 15, left: 25, width: 50 },
      { text: 'ALEX SMITH', top: 45, left: 30, width: 40 },
      { text: 'WEB DEVELOPMENT', top: 60, left: 20, width: 60 },
      { text: 'CERT-STN-9021', top: 85, left: 40, width: 20 }
    ]
  },
  {
    id: 'doc-105',
    name: 'stanford_web_dev_original.pdf',
    type: 'Certificate',
    size: '1.9 MB',
    uploadedAt: '2026-08-08T08:05:00Z',
    status: 'Verified',
    matchRate: 97,
    hash: 'c891b5b522d5df086d0ff0b110fbd9d21bb4fc7163af34d08286a2e846f6be03',
    metadata: {
      documentNumber: 'CERT-STN-9021',
      fullName: 'ALEX SMITH',
      dateOfBirth: 'N/A',
      expiryDate: 'N/A',
      issuer: 'Stanford Online University',
    },
    checks: {
      expiryCheck: { status: 'pass', name: 'Validity Check', message: 'Certificate has no expiration date' },
      formatCheck: { status: 'pass', name: 'Format Validation', message: 'Valid digital certificate layout' },
      registryCheck: { status: 'pass', name: 'Authority Match', message: 'Credential matches Stanford registry' },
      integrityCheck: { status: 'pass', name: 'Integrity Check', message: 'Digital signature is valid' },
      duplicateCheck: { status: 'pass', name: 'Duplicate Check', message: 'First submission of this document hash' }
    },
    ocrBoxes: [
      { text: 'STANFORD UNIVERSITY', top: 15, left: 25, width: 50 },
      { text: 'ALEX SMITH', top: 45, left: 30, width: 40 },
      { text: 'WEB DEVELOPMENT', top: 60, left: 20, width: 60 },
      { text: 'CERT-STN-9021', top: 85, left: 40, width: 20 }
    ]
  }
];

const initialHistory = [
  { id: 'log-1', timestamp: '2026-08-08T08:05:12Z', actor: 'System', message: 'Document stanford_web_dev_original.pdf uploaded and verified', status: 'success', docId: 'doc-105' },
  { id: 'log-2', timestamp: '2026-08-08T09:16:05Z', actor: 'System', message: 'Document passport_john_doe.pdf uploaded and verified', status: 'success', docId: 'doc-101' },
  { id: 'log-3', timestamp: '2026-08-08T10:30:45Z', actor: 'System', message: 'Document drivers_license_expired.png flagged as EXPIRED', status: 'error', docId: 'doc-102' },
  { id: 'log-4', timestamp: '2026-08-08T11:45:55Z', actor: 'System', message: 'Document invoice_altered.pdf flagged as ALTERATION DETECTED due to registry mismatch', status: 'error', docId: 'doc-103' },
  { id: 'log-5', timestamp: '2026-08-08T12:10:32Z', actor: 'System', message: 'Document certificate_duplicate.jpg flagged as DUPLICATE of stanford_web_dev_original.pdf', status: 'warning', docId: 'doc-104' }
];

export const DocumentProvider = ({ children }) => {
  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem('doc_verification_docs');
    return saved ? JSON.parse(saved) : initialMockDocuments;
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('doc_verification_history');
    return saved ? JSON.parse(saved) : initialHistory;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDocId, setSelectedDocId] = useState(null);
  
  const [apiKeys, setApiKeys] = useState(() => {
    const saved = localStorage.getItem('doc_verification_api_keys');
    return saved ? JSON.parse(saved) : [
      { key: 'doc_live_83a9f0e1bc256d02a901844ef', createdAt: '2026-08-01T12:00:00Z', name: 'Production ERP Integration' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('doc_verification_docs', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('doc_verification_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('doc_verification_api_keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  const addLog = (message, status = 'info', docId = null, actor = 'Admin') => {
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor,
      message,
      status,
      docId
    };
    setHistory(prev => [newLog, ...prev]);
  };

  const uploadDocument = (file, customName = null) => {
    const name = customName || file.name;
    const type = inferDocType(name);
    const size = formatBytes(file.size || 1024 * 350);
    const id = `doc-${Date.now()}`;
    
    // Create random mock hash
    const hash = Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');

    // Heuristically extract values based on name or document type
    const metadata = generateMockMetadata(name, type);
    
    // Run checks
    const checks = runVerificationChecks(type, metadata, hash, documents);
    
    // Determine status
    let status = 'Pending';
    if (checks.expiryCheck.status === 'fail') status = 'Expired';
    else if (checks.duplicateCheck.status === 'fail') status = 'Duplicate';
    else if (checks.integrityCheck.status === 'fail' || checks.registryCheck.status === 'fail') status = 'Altered';
    else status = 'Verified';

    const newDoc = {
      id,
      name,
      type,
      size,
      uploadedAt: new Date().toISOString(),
      status,
      matchRate: Math.floor(Math.random() * 20) + 78, // 78-98% match
      hash,
      metadata,
      checks,
      ocrBoxes: getMockOcrBoxes(type, metadata)
    };

    setDocuments(prev => [newDoc, ...prev]);
    setSelectedDocId(id);
    addLog(`Uploaded and scanned document ${name}`, status === 'Verified' ? 'success' : (status === 'Altered' || status === 'Expired' ? 'error' : 'warning'), id);
  };

  const updateDocumentMetadata = (id, newMetadata) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === id) {
        const { metadata, type, hash, status: docStatus, name } = doc;
        const updatedMeta = { ...metadata, ...newMetadata };
        // Rerun checks with updated metadata
        const checks = runVerificationChecks(type, updatedMeta, hash, documents.filter(d => d.id !== id));
        let status = docStatus;
        if (checks.expiryCheck.status === 'fail') status = 'Expired';
        else if (checks.duplicateCheck.status === 'fail') status = 'Duplicate';
        else if (checks.integrityCheck.status === 'fail' || checks.registryCheck.status === 'fail') status = 'Altered';
        else status = 'Verified';
        
        addLog(`Updated metadata for ${name}`, 'info', id);
        return {
          ...doc,
          metadata: updatedMeta,
          checks,
          status
        };
      }
      return doc;
    }));
  };

  const updateDocumentStatus = (id, status) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === id) {
        addLog(`Manually set ${doc.name} status to ${status.toUpperCase()}`, status === 'Verified' ? 'success' : 'error', id);
        
        // Override checks lists dynamically so they visually reflect the admin action
        const updatedChecks = { ...doc.checks };
        let newMatchRate = doc.matchRate;
        
        if (status === 'Verified') {
          newMatchRate = 100;
          Object.keys(updatedChecks).forEach(key => {
            updatedChecks[key] = {
              ...updatedChecks[key],
              status: 'pass',
              message: `${updatedChecks[key].name}: Approved by Admin Override`
            };
          });
        } else if (status === 'Altered') {
          newMatchRate = 35;
          updatedChecks.integrityCheck = {
            status: 'fail',
            name: 'Integrity Check',
            message: 'Integrity Check: Failed by Admin Override'
          };
          updatedChecks.registryCheck = {
            status: 'fail',
            name: 'Authority Match',
            message: 'Authority Match: Failed by Admin Override'
          };
        } else if (status === 'Duplicate') {
          newMatchRate = 50;
          updatedChecks.duplicateCheck = {
            status: 'fail',
            name: 'Duplicate Check',
            message: 'Duplicate Check: Flagged by Admin Override'
          };
        }

        return { 
          ...doc, 
          status, 
          checks: updatedChecks,
          matchRate: newMatchRate
        };
      }
      return doc;
    }));
  };

  const deleteDocument = (id) => {
    const docToDelete = documents.find(d => d.id === id);
    setDocuments(prev => prev.filter(d => d.id !== id));
    if (selectedDocId === id) {
      setSelectedDocId(null);
    }
    if (docToDelete) {
      addLog(`Deleted document ${docToDelete.name}`, 'warning');
    }
  };

  const generateApiKey = (name = 'New API Key') => {
    const key = `doc_live_${Array.from({length: 25}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
    const newKeyObj = {
      key,
      createdAt: new Date().toISOString(),
      name
    };
    setApiKeys(prev => [...prev, newKeyObj]);
    addLog(`Generated developer API Key: "${name}"`, 'success');
  };

  const revokeApiKey = (key) => {
    const target = apiKeys.find(k => k.key === key);
    setApiKeys(prev => prev.filter(k => k.key !== key));
    if (target) {
      addLog(`Revoked developer API Key: "${target.name}"`, 'error');
    }
  };

  return (
    <DocumentContext.Provider value={{
      documents,
      history,
      activeTab,
      selectedDocId,
      apiKeys,
      setActiveTab,
      setSelectedDocId,
      uploadDocument,
      updateDocumentMetadata,
      updateDocumentStatus,
      deleteDocument,
      generateApiKey,
      revokeApiKey,
      addLog
    }}>
      {children}
    </DocumentContext.Provider>
  );
};

// Heuristics & Helpers
function inferDocType(filename) {
  const f = filename.toLowerCase();
  if (f.includes('passport') || f.includes('pass')) return 'Passport';
  if (f.includes('dl') || f.includes('driver') || f.includes('license')) return 'Driver License';
  if (f.includes('invoice') || f.includes('bill') || f.includes('receipt')) return 'Invoice';
  if (f.includes('cert') || f.includes('degree') || f.includes('diploma') || f.includes('course')) return 'Certificate';
  return 'Utility Bill';
}

function formatBytes(bytes, decimals = 1) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function generateMockMetadata(filename, type) {
  const cleanName = filename.split('.')[0].replace(/[-_]/g, ' ').toUpperCase();
  const today = new Date();
  
  // Future expiry for passport/DL, none for others
  const expiry = new Date();
  expiry.setFullYear(today.getFullYear() + 5);
  const expiryStr = expiry.toISOString().split('T')[0];

  switch (type) {
    case 'Passport':
      return {
        documentNumber: `A${Math.floor(10000000 + Math.random() * 90000000)}`,
        fullName: cleanName.includes('PASSPORT') ? 'ALICE GREEN' : cleanName,
        dateOfBirth: '1992-04-15',
        expiryDate: expiryStr,
        issuer: 'US Dept of State'
      };
    case 'Driver License':
      return {
        documentNumber: `DL-${Math.floor(100000 + Math.random() * 900000)}-CA`,
        fullName: cleanName,
        dateOfBirth: '1995-08-10',
        expiryDate: expiryStr,
        issuer: 'California DMV'
      };
    case 'Invoice':
      return {
        documentNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
        fullName: 'ACME CORPORATION',
        dateOfBirth: 'N/A',
        expiryDate: 'N/A',
        issuer: cleanName || 'Supplier Inc.'
      };
    case 'Certificate':
      return {
        documentNumber: `CERT-STN-${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: 'STUDENT NAME',
        dateOfBirth: 'N/A',
        expiryDate: 'N/A',
        issuer: 'Stanford Online'
      };
    default:
      return {
        documentNumber: `UTIL-${Math.floor(100000 + Math.random() * 900000)}`,
        fullName: cleanName,
        dateOfBirth: 'N/A',
        expiryDate: 'N/A',
        issuer: 'Utility Corp'
      };
  }
}

function runVerificationChecks(type, metadata, hash, existingDocs) {
  const currentDate = new Date('2026-08-08'); // Current system date as per metadata

  // 1. Expiry Check
  let expiryStatus = 'pass';
  let expiryMsg = 'Document is active.';
  if (metadata.expiryDate && metadata.expiryDate !== 'N/A') {
    const expDate = new Date(metadata.expiryDate);
    if (expDate < currentDate) {
      expiryStatus = 'fail';
      expiryMsg = `Document expired on ${expDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      expiryMsg = `Document active. Expiry: ${expDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
  }

  // 2. Duplicate Check
  let duplicateStatus = 'pass';
  let duplicateMsg = 'Unique document checksum';
  const duplicate = existingDocs.find(doc => doc.hash === hash);
  if (duplicate) {
    duplicateStatus = 'fail';
    duplicateMsg = `Conflict: Document with matching checksum already submitted (ID: ${duplicate.id})`;
  }

  // 3. Format Check (regex on doc numbers)
  let formatStatus = 'pass';
  let formatMsg = 'Document layout and format fields validate successfully';
  if (type === 'Passport' && !/^[A-Z][0-9]{7,8}$/i.test(metadata.documentNumber)) {
    formatStatus = 'warn';
    formatMsg = 'Passport numbers typically start with 1 letter followed by 7-8 digits';
  } else if (type === 'Driver License' && !/^DL-[0-9]+-[A-Z]{2}$/i.test(metadata.documentNumber)) {
    formatStatus = 'warn';
    formatMsg = 'License number does not match expected DMV state format patterns';
  }

  // 4. Registry check (simulates lookups)
  let registryStatus = 'pass';
  let registryMsg = 'Verified against official regulatory databases';
  if (metadata.fullName && metadata.fullName.toLowerCase().includes('altered')) {
    registryStatus = 'fail';
    registryMsg = 'Name details do not match regulatory registry files';
  }

  // 5. Integrity check
  let integrityStatus = 'pass';
  let integrityMsg = 'Digital signature valid. No alteration anomalies detected.';
  if (metadata.documentNumber && metadata.documentNumber.includes('999')) {
    integrityStatus = 'fail';
    integrityMsg = 'Mismatched metadata properties. Font anomalies in serial number box.';
  }

  return {
    expiryCheck: { status: expiryStatus, name: 'Validity Check', message: expiryMsg },
    formatCheck: { status: formatStatus, name: 'Format Validation', message: formatMsg },
    registryCheck: { status: registryStatus, name: 'Authority Match', message: registryMsg },
    integrityCheck: { status: integrityStatus, name: 'Integrity Check', message: integrityMsg },
    duplicateCheck: { status: duplicateStatus, name: 'Duplicate Check', message: duplicateMsg }
  };
}

function getMockOcrBoxes(type, metadata) {
  return [
    { text: type.toUpperCase(), top: 15, left: 15, width: 30 },
    { text: metadata.fullName || 'FULL NAME', top: 40, left: 10, width: 40 },
    { text: metadata.documentNumber || 'DOCUMENT ID', top: 55, left: 10, width: 40 },
    { text: metadata.expiryDate || 'N/A', top: 75, left: 60, width: 30 }
  ];
}
