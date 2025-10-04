import React, { useState, useEffect } from 'react';
import './AnalysisView.css';

const AnalysisView = ({ document }) => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (document && document.id) {
            const fetchAnalysis = async () => {
                setLoading(true);
                setError(null);
                try {
                    const response = await fetch(`/api/documents/${document.id}/analyze`, {
                        method: 'POST',
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
            {!analysis ? (
                <div className="analysis-message">No analysis results found for this document.</div>
            ) : (
                <>
                    <h3>Summary</h3>
                    <p>{analysis.summary || 'N/A'}</p>

                    <h3>Key Information</h3>
                    <pre>{analysis.key_information ? JSON.stringify(analysis.key_information, null, 2) : 'N/A'}</pre>

                    <h3>Risk Assessment</h3>
                    <pre>{analysis.risk_assessment ? JSON.stringify(analysis.risk_assessment, null, 2) : 'N/A'}</pre>
                </>
            )}
        </div>
    );
};

export default AnalysisView;
