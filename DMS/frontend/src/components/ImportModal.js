import React, { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle, FileText, Loader } from 'lucide-react';

const ImportModal = ({ isOpen, onClose, endpoint, title, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const API_BASE = process.env.REACT_APP_API_URL || '/api';

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validate file type
            const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
            if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls)$/)) {
                setError('Chỉ chấp nhận file Excel (.xlsx, .xls)');
                return;
            }
            // Validate file size (5MB)
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('File không được vượt quá 5MB');
                return;
            }
            setFile(selectedFile);
            setError(null);
            setResults(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Vui lòng chọn file');
            return;
        }

        setUploading(true);
        setError(null);
        setResults(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/excel/import/${endpoint}`, {
                method: 'POST',
                headers: {
                    'x-auth-token': token
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Import failed');
            }

            setResults(data);
            if (data.success > 0 && onSuccess) {
                setTimeout(() => onSuccess(), 2000);
            }
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra khi import');
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setResults(null);
        setError(null);
        setUploading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.headerTitle}>
                        <Upload size={24} color="#2563eb" />
                        <h2 style={styles.title}>{title || 'Import Excel'}</h2>
                    </div>
                    <button onClick={handleClose} style={styles.closeBtn}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={styles.body}>
                    {!results ? (
                        <>
                            {/* File Upload Area */}
                            <div style={styles.uploadArea}>
                                <input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={handleFileChange}
                                    style={styles.fileInput}
                                    id="file-upload"
                                    disabled={uploading}
                                />
                                <label htmlFor="file-upload" style={styles.uploadLabel}>
                                    <FileText size={48} color="#94a3b8" />
                                    <p style={styles.uploadText}>
                                        {file ? file.name : 'Click để chọn file Excel'}
                                    </p>
                                    <p style={styles.uploadHint}>
                                        Hỗ trợ: .xlsx, .xls (tối đa 5MB)
                                    </p>
                                </label>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div style={styles.errorBox}>
                                    <AlertCircle size={20} />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Upload Button */}
                            <button
                                onClick={handleUpload}
                                disabled={!file || uploading}
                                style={{
                                    ...styles.uploadBtn,
                                    opacity: !file || uploading ? 0.5 : 1,
                                    cursor: !file || uploading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {uploading ? (
                                    <>
                                        <Loader size={20} className="spin" />
                                        Đang import...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={20} />
                                        Import File
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Results */}
                            <div style={styles.results}>
                                <div style={styles.resultsSummary}>
                                    <div style={styles.resultItem}>
                                        <span style={styles.resultLabel}>Tổng số:</span>
                                        <span style={styles.resultValue}>{results.total}</span>
                                    </div>
                                    <div style={styles.resultItem}>
                                        <CheckCircle size={20} color="#10b981" />
                                        <span style={styles.resultLabel}>Thành công:</span>
                                        <span style={{ ...styles.resultValue, color: '#10b981' }}>{results.success}</span>
                                    </div>
                                    <div style={styles.resultItem}>
                                        <AlertCircle size={20} color="#ef4444" />
                                        <span style={styles.resultLabel}>Thất bại:</span>
                                        <span style={{ ...styles.resultValue, color: '#ef4444' }}>{results.failed}</span>
                                    </div>
                                </div>

                                {/* Errors List */}
                                {results.errors && results.errors.length > 0 && (
                                    <div style={styles.errorsList}>
                                        <h4 style={styles.errorsTitle}>Chi tiết lỗi:</h4>
                                        <div style={styles.errorsScroll}>
                                            {results.errors.map((err, idx) => (
                                                <div key={idx} style={styles.errorItem}>
                                                    <div style={styles.errorRow}>
                                                        <strong>Dòng {err.row}:</strong>
                                                        {err.code && <span style={styles.errorCode}>{err.code}</span>}
                                                    </div>
                                                    <ul style={styles.errorMessages}>
                                                        {err.errors.map((msg, i) => (
                                                            <li key={i}>{msg}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Success Message */}
                                {results.success > 0 && (
                                    <div style={styles.successBox}>
                                        <CheckCircle size={20} />
                                        <span>Import thành công {results.success} bản ghi!</span>
                                    </div>
                                )}
                            </div>

                            {/* Close Button */}
                            <button onClick={handleClose} style={styles.closeButton}>
                                Đóng
                            </button>
                        </>
                    )}
                </div>
            </div>

            <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
    },
    modal: {
        background: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
    },
    header: {
        padding: '20px 24px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    title: {
        margin: 0,
        fontSize: '20px',
        fontWeight: '700',
        color: '#1e293b'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748b',
        transition: 'all 0.2s'
    },
    body: {
        padding: '24px',
        overflowY: 'auto',
        maxHeight: 'calc(90vh - 80px)'
    },
    uploadArea: {
        marginBottom: '20px'
    },
    fileInput: {
        display: 'none'
    },
    uploadLabel: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        border: '2px dashed #cbd5e1',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        background: '#f8fafc'
    },
    uploadText: {
        marginTop: '16px',
        fontSize: '16px',
        fontWeight: '600',
        color: '#475569'
    },
    uploadHint: {
        marginTop: '4px',
        fontSize: '14px',
        color: '#94a3b8'
    },
    uploadBtn: {
        width: '100%',
        padding: '12px',
        background: '#2563eb',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.2s'
    },
    errorBox: {
        padding: '12px 16px',
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        color: '#dc2626',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
        fontSize: '14px'
    },
    successBox: {
        padding: '12px 16px',
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '8px',
        color: '#16a34a',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: '16px',
        fontSize: '14px',
        fontWeight: '600'
    },
    results: {
        marginBottom: '20px'
    },
    resultsSummary: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '24px'
    },
    resultItem: {
        padding: '16px',
        background: '#f8fafc',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
    },
    resultLabel: {
        fontSize: '14px',
        color: '#64748b',
        fontWeight: '500'
    },
    resultValue: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
    },
    errorsList: {
        marginTop: '20px'
    },
    errorsTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '12px'
    },
    errorsScroll: {
        maxHeight: '300px',
        overflowY: 'auto',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '12px'
    },
    errorItem: {
        marginBottom: '16px',
        paddingBottom: '16px',
        borderBottom: '1px solid #f1f5f9'
    },
    errorRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '8px',
        fontSize: '14px',
        color: '#1e293b'
    },
    errorCode: {
        padding: '2px 8px',
        background: '#e2e8f0',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '600',
        color: '#475569'
    },
    errorMessages: {
        margin: '0',
        paddingLeft: '20px',
        fontSize: '13px',
        color: '#ef4444'
    },
    closeButton: {
        width: '100%',
        padding: '12px',
        background: '#f1f5f9',
        color: '#475569',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s'
    }
};

export default ImportModal;
