import React, { useState, useEffect, useCallback } from 'react';
import AnalysisView from '../Analysis/AnalysisView';
import DocumentUpload from '../Upload/DocumentUpload';
import './Dashboard.css';

const Dashboard = () => {
    const [documents, setDocuments] = useState([]);
    const [selectedDocument, setSelectedDocument] = useState(null);

    const fetchDocuments = useCallback(async () => {
        try {
            const response = await fetch('/api/documents');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setDocuments(data);
        } catch (error) {
            console.error("Failed to fetch documents:", error);
        }
    }, []);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const handleViewAnalysis = (doc) => {
        setSelectedDocument(doc);
    };

    return (
        <div className="dashboard-container">
            <div className="document-list">
                <DocumentUpload onUploadSuccess={fetchDocuments} />
                <h2>Documents</h2>
                <ul>
                    {documents.map(doc => (
                        <li key={doc.id} className={`document-item ${selectedDocument && selectedDocument.id === doc.id ? 'selected' : ''}`}>
                            <span className="document-name">{doc.filename} - <strong>{doc.status}</strong></span>
                            <button onClick={() => handleViewAnalysis(doc)}>View Analysis</button>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="analysis-section">
                <AnalysisView document={selectedDocument} />
            </div>
        </div>
    );
};

export default Dashboard;

