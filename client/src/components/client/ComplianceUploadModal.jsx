import { useState } from 'react';
import { FaTimes, FaCloudUploadAlt, FaFilePdf, FaImage, FaCheckCircle } from 'react-icons/fa';
import api from '../../services/api';
import clsx from 'clsx';

const ComplianceUploadModal = ({ deadline, isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen || !deadline) return null;

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) setFile(droppedFile);
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('document', file);
        formData.append('deadlineId', deadline._id);
        formData.append('clientId', deadline.clientId);
        // Auto-categorize based on deadline title (simple heuristic)
        // Or let backend handle it via AI

        try {
            const res = await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                onSuccess();
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition"
                >
                    <FaTimes size={20} />
                </button>

                <div className="p-6">
                    <h3 className="text-lg font-bold font-heading text-neutral-800 mb-1">
                        Upload Compliance Document
                    </h3>
                    <p className="text-sm text-neutral-500 mb-6">
                        For: <span className="font-bold text-neutral-800">{deadline.title}</span> (Due: {new Date(deadline.dueDate).toLocaleDateString()})
                    </p>

                    <div
                        className={clsx(
                            "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer relative",
                            dragActive ? "border-primary-500 bg-primary-50" : "border-neutral-200 hover:border-primary-300 hover:bg-neutral-50",
                            file ? "bg-green-50 border-green-200" : ""
                        )}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('compliance-file-input').click()}
                    >
                        <input
                            id="compliance-file-input"
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png"
                        />

                        {file ? (
                            <div className="flex flex-col items-center animate-fade-in">
                                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-3">
                                    <FaCheckCircle size={24} />
                                </div>
                                <p className="font-bold text-neutral-800 text-sm truncate max-w-[200px]">{file.name}</p>
                                <p className="text-xs text-neutral-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                    className="text-xs text-red-500 font-bold mt-2 hover:underline"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center mb-3">
                                    <FaCloudUploadAlt size={24} />
                                </div>
                                <p className="font-bold text-neutral-800 text-sm">Click to upload or drag & drop</p>
                                <p className="text-xs text-neutral-400 mt-1">PDF, PNG, JPG (Max 10MB)</p>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex items-center gap-2">
                            <FaTimes /> {error}
                        </div>
                    )}

                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className={clsx(
                            "w-full mt-6 py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2",
                            !file || uploading
                                ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                                : "bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/20"
                        )}
                    >
                        {uploading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            'Submit Document'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ComplianceUploadModal;
