import { useState } from 'react';
import api from '../../services/api';
import {
    FaCloudUploadAlt, FaSpinner, FaCheckCircle, FaTimesCircle,
    FaFilePdf, FaFileImage, FaFile, FaTrash
} from 'react-icons/fa';
import clsx from 'clsx';

const DocumentUpload = ({ clientId, onUploadComplete }) => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const newFiles = selectedFiles.map(file => ({
            file,
            id: `${Date.now()}-${Math.random()}`,
            status: 'pending' // pending, uploading, success, failed
        }));
        setFiles(prev => [...prev, ...newFiles]);
        setError('');
    };

    const removeFile = (id) => {
        setFiles(prev => prev.filter(f => f.id !== id));
        // Also remove from progress tracking
        setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[id];
            return newProgress;
        });
    };

    const clearAll = () => {
        if (uploading) {
            // Only clear pending and failed files during upload
            setFiles(prev => prev.filter(f => f.status === 'uploading' || f.status === 'success'));
        } else {
            setFiles([]);
        }
        setUploadProgress({});
        setError('');
    };

    const getFileIcon = (fileType) => {
        if (fileType.includes('pdf')) return <FaFilePdf className="text-danger-500" />;
        if (fileType.includes('image')) return <FaFileImage className="text-primary-500" />;
        return <FaFile className="text-neutral-400" />;
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleBulkUpload = async () => {
        if (files.length === 0) return;

        const formData = new FormData();
        files.forEach(({ file }) => {
            formData.append('files', file);
        });
        if (clientId) formData.append('clientId', clientId);

        setUploading(true);
        setError('');

        // Set all files to uploading status
        setFiles(prev => prev.map(f => ({ ...f, status: 'uploading' })));

        // Simulate progress (estimate ~5 seconds per file for OCR + AI)
        const estimatedTimePerFile = 5000; // 5 seconds
        const totalEstimatedTime = files.length * estimatedTimePerFile;
        let currentProgress = 0;

        const progressInterval = setInterval(() => {
            currentProgress += 1;
            const estimatedFilesComplete = Math.floor((currentProgress / 100) * files.length);

            // Update files to show simulated progress
            setFiles(prev => prev.map((f, idx) => {
                if (idx < estimatedFilesComplete && f.status === 'uploading') {
                    return { ...f, status: 'processing' }; // Temporary status
                }
                return f;
            }));

            if (currentProgress >= 95) {
                clearInterval(progressInterval);
            }
        }, totalEstimatedTime / 100);

        try {
            const { data } = await api.post('/documents/upload-bulk', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            clearInterval(progressInterval);

            if (data.success) {
                // Update status based on actual results
                const resultMap = {};
                data.data.results.forEach(result => {
                    resultMap[result.fileName] = result;
                });

                setFiles(prev => prev.map(fileObj => {
                    const result = resultMap[fileObj.file.name];
                    return {
                        ...fileObj,
                        status: result?.success ? 'success' : 'failed',
                        error: result?.error
                    };
                }));

                // Show success message
                const successCount = data.data.successful;
                const failedCount = data.data.failed;
                setSuccessMessage(
                    `✓ Upload complete! ${successCount} file${successCount !== 1 ? 's' : ''} processed successfully` +
                    (failedCount > 0 ? `, ${failedCount} failed` : '')
                );

                // Clear successful files and refresh after 3 seconds
                setTimeout(() => {
                    setFiles(prev => prev.filter(f => f.status !== 'success'));
                    setSuccessMessage('');
                    if (onUploadComplete) onUploadComplete();
                }, 3000);
            }
        } catch (err) {
            clearInterval(progressInterval);
            setError(err.response?.data?.message || 'Upload failed');
            setFiles(prev => prev.map(f => ({ ...f, status: 'failed' })));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-card border border-neutral-100">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold font-heading text-neutral-800 text-lg">Bulk Upload</h3>
                {files.length > 0 && (
                    <button
                        onClick={clearAll}
                        className="text-xs text-danger-600 hover:text-danger-700 font-bold transition"
                    >
                        {uploading ? 'Clear Pending' : 'Clear All'}
                    </button>
                )}
            </div>

            {error && <div className="text-danger-600 text-sm mb-3 bg-danger-50 p-3 rounded-lg border border-danger-200 flex items-center gap-2">
                <FaTimesCircle /> {error}
            </div>}

            {successMessage && <div className="text-success-700 text-sm mb-3 bg-success-50 p-3 rounded-lg border border-success-200 flex items-center gap-2 animate-fade-in">
                <FaCheckCircle /> {successMessage}
            </div>}

            {/* Upload Progress Bar */}
            {uploading && files.length > 0 && (
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-neutral-600">Upload Progress</span>
                        <span className="text-xs font-bold text-primary-600">
                            {Math.round((files.filter(f => f.status === 'success' || f.status === 'processing').length / files.length) * 100)}%
                        </span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out"
                            style={{ width: `${(files.filter(f => f.status === 'success' || f.status === 'processing').length / files.length) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Drag & Drop Zone */}
            <div className="border-2 border-dashed border-neutral-200 rounded-xl p-8 text-center hover:border-primary-400 hover:bg-primary-50/30 transition cursor-pointer relative bg-gradient-to-br from-neutral-50 to-white group">
                <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    accept=".pdf,.jpg,.jpeg,.png"
                />
                <div className="flex flex-col items-center pointer-events-none">
                    <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <FaCloudUploadAlt className="text-3xl text-primary-500" />
                    </div>
                    <span className="text-sm font-bold text-neutral-700 mb-1">
                        Click or Drag Multiple Files Here
                    </span>
                    <span className="text-xs text-neutral-400">PDF, JPG, PNG • Up to 10MB each • Max 20 files</span>
                </div>
            </div>

            {/* File Preview List */}
            {files.length > 0 && (
                <div className="mt-6 space-y-3 max-h-96 overflow-y-auto">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">
                            Selected Files ({files.length})
                        </p>
                    </div>

                    {files.map(({ file, id, status, error }) => (
                        <div
                            key={id}
                            className={clsx(
                                "flex items-center gap-3 p-3 rounded-lg border transition-all",
                                status === 'pending' && "bg-neutral-50 border-neutral-200",
                                (status === 'uploading' || status === 'processing') && "bg-primary-50 border-primary-200 animate-pulse",
                                status === 'success' && "bg-success-50 border-success-200",
                                status === 'failed' && "bg-danger-50 border-danger-200"
                            )}
                        >
                            <div className="flex-shrink-0 text-2xl">
                                {getFileIcon(file.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-neutral-800 truncate">{file.name}</p>
                                <p className="text-xs text-neutral-500">{formatFileSize(file.size)}</p>
                                {status === 'failed' && error && (
                                    <p className="text-xs text-danger-600 mt-1">{error}</p>
                                )}
                            </div>

                            <div className="flex-shrink-0">
                                {(status === 'pending' || status === 'failed') && (
                                    <button
                                        onClick={() => removeFile(id)}
                                        className="text-neutral-400 hover:text-danger-600 transition p-1"
                                        title="Remove file"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                )}
                                {(status === 'uploading' || status === 'processing') && (
                                    <FaSpinner className="animate-spin text-primary-600" size={18} />
                                )}
                                {status === 'success' && (
                                    <FaCheckCircle className="text-success-600" size={18} />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Button */}
            {files.length > 0 && (
                <button
                    onClick={handleBulkUpload}
                    disabled={uploading || files.length === 0}
                    className="w-full mt-6 bg-primary-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2"
                >
                    {uploading ? (
                        <>
                            <FaSpinner className="animate-spin" />
                            Processing {files.filter(f => f.status === 'success').length}/{files.length} files...
                        </>
                    ) : (
                        <>
                            <FaCloudUploadAlt />
                            Upload {files.length} File{files.length > 1 ? 's' : ''}
                        </>
                    )}
                </button>
            )}
        </div>
    );
};

export default DocumentUpload;
