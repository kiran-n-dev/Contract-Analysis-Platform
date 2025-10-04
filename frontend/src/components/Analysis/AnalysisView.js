import React, { useState, useEffect } from 'react';
import './AnalysisView.css';

const formatJsonToPoints = (data) => {
    if (typeof data !== 'object' || data === null) {
        return <p>{String(data)}</p>;
    }

    if (Array.isArray(data)) {
        return (
            <ul>
                {data.map((item, index) => (
                    <li key={index}>{formatJsonToPoints(item)}</li>
                ))}
            </ul>
        );
    }

    return (
        <ul>
            {Object.entries(data).map(([key, value]) => (
                <li key={key}>
                    <strong>{key}:</strong> {formatJsonToPoints(value)}
                </li>
            ))}
        </ul>
    );
};

const AnalysisView = ({ document }) => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('summary'); // New state for active tab

    useEffect(() => {
        const fetchAnalysis = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/documents/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming token is stored
                    }
                });
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    setAnalysis(data);
                } catch (e) {
                    setError("Failed to fetch analysis: " + e.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchAnalysis();
        } else {
            setAnalysis(null);
        }
    }, [document]);

    if (!document) {
        return <div className="analysis-message">Select a document to view its analysis.</div>;
    }

    if (loading) {
        return <div className="analysis-message">Loading analysis for {document.filename}...</div>;
    }

    if (error) {
        return <div className="analysis-message error">{error}</div>;
    }

    if (!analysis) {
        return <div className="analysis-message">No analysis available for this document.</div>;
    }

    return (
        <div className="analysis-view-container">
            <h2>Analysis for {document.filename}</h2>
            <div className="tabs-container">
                <button
                    className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`}
                    onClick={() => setActiveTab('summary')}
                >
                    Summary
                </button>
                <button
                    className={`tab-button ${activeTab === 'key_information' ? 'active' : ''}`}
                    onClick={() => setActiveTab('key_information')}
                >
                    Key Information
                </button>
                <button
                    className={`tab-button ${activeTab === 'risk_assessment' ? 'active' : ''}`}
                    onClick={() => setActiveTab('risk_assessment')}
                >
                    Risk Assessment
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'summary' && (
                    <div className="analysis-section-content">
                        <p>{analysis.summary || 'N/A'}</p>
                    </div>
                )}

                {activeTab === 'key_information' && (
                    <div className="analysis-section-content">
                        {analysis.key_information ? formatJsonToPoints(analysis.key_information) : 'N/A'}
                    </div>
                )}

                {activeTab === 'risk_assessment' && (
                    <div className="analysis-section-content">
                        {analysis.risk_assessment ? formatJsonToPoints(analysis.risk_assessment) : 'N/A'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalysisView;