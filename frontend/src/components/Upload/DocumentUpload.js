import React, { useState } from 'react';
import './DocumentUpload.css';

const DocumentUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            alert('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/documents/upload', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            onUploadSuccess();
            setFile(null);
            e.target.reset();
        } else {
            const data = await response.json();
            alert(`Upload failed: ${data.detail}`);
        }
    };

    return (
        <div className="document-upload-container">
            <form className="document-upload-form" onSubmit={handleSubmit}>
                <h2>Upload Document</h2>
                <input type="file" onChange={handleFileChange} />
                <button type="submit">Upload</button>
            </form>
        </div>
    );
};

export default DocumentUpload;
