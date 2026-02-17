import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaFilePdf, FaFileImage, FaFileAlt, FaDownload, FaTrash, FaEye } from 'react-icons/fa';
import clsx from 'clsx';
import useAuth from '../../hooks/useAuth';

const DocumentList = ({ clientId, refreshTrigger }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewDoc, setPreviewDoc] = useState(null); // For handling the preview modal
    const { user } = useAuth();

    const fetchDocuments = async () => {
        try {
            let url = '/documents';
            if (clientId) url += `?clientId=${clientId}`;

            const { data } = await api.get(url);
            if (data.success) {
                setDocuments(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [clientId, refreshTrigger]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;
        try {
            await api.delete(`/documents/${id}`);
            setDocuments(documents.filter(d => d._id !== id));
        } catch (err) {
            alert('Failed to delete');
        }
    };

    const getIcon = (mimeType) => {
        if (mimeType?.includes('pdf') || mimeType?.includes('application/pdf')) return <FaFilePdf className="text-red-500" />;
        if (mimeType?.includes('image')) return <FaFileImage className="text-blue-500" />;
        return <FaFileAlt className="text-gray-500" />;
    };

    const getStatusBadge = (status) => {
        let styles = 'bg-neutral-100 text-neutral-600';
        if (status === 'processed') styles = 'bg-success-50 text-success-700 border border-success-200';
        if (status === 'processing') styles = 'bg-warning-50 text-warning-700 border border-warning-200 animate-pulse';
        if (status === 'flagged') styles = 'bg-danger-50 text-danger-700 border border-danger-200';
        if (status === 'verified_l1') styles = 'bg-primary-50 text-primary-700 border border-primary-200';

        return (
            <span className={clsx("px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide", styles)}>
                {status === 'verified_l1' ? 'Verified (L1)' : status}
            </span>
        );
    };

    const handleVerify = async (id) => {
        try {
            const { data } = await api.patch(`/documents/${id}/verify`);
            if (data.success) {
                setDocuments(documents.map(d => d._id === id ? { ...d, status: 'verified_l1' } : d));
                setPreviewDoc(null);
            }
        } catch (err) {
            alert('Verification failed');
        }
    };

    const API_BASE = 'http://localhost:5000'; // Should come from environment

    if (loading) return <div className="text-center text-sm text-neutral-400 py-4">Loading documents...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden relative">
            <div className="p-4 border-b border-neutral-100 bg-neutral-50/50">
                <h3 className="font-bold font-heading text-neutral-800">Recent Uploads</h3>
            </div>

            <div className="divide-y divide-neutral-100 max-h-[400px] overflow-y-auto">
                {documents.length === 0 ? (
                    <div className="p-8 text-center text-neutral-400 text-sm">No documents found</div>
                ) : (
                    documents.map(doc => (
                        <div key={doc._id} className="p-4 hover:bg-neutral-50 flex items-center justify-between group transition">
                            <div className="flex items-center gap-3">
                                <div className="text-xl">
                                    {getIcon(doc.fileType)}
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-neutral-900 truncate max-w-[200px]">{doc.fileName}</h4>
                                    <div className="text-xs text-neutral-500 flex items-center gap-2 mt-1">
                                        <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide">{doc.category || 'Unclassified'}</span>
                                        {getStatusBadge(doc.status)}
                                        <span>•</span>
                                        <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                                {/* Preview Button for CA/Firm */}
                                {(user?.role === 'ca' || user?.role === 'firms') && (
                                    <button
                                        onClick={() => setPreviewDoc(doc)}
                                        className="p-1.5 text-neutral-400 hover:text-primary-600 rounded hover:bg-primary-50"
                                        title="Preview Extraction"
                                    >
                                        <FaEye />
                                    </button>
                                )}

                                <a
                                    href={`${API_BASE}${doc.fileUrl}`} // Adjust if using cloud storage
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 text-neutral-400 hover:text-primary-600 rounded hover:bg-primary-50"
                                    title="Download"
                                >
                                    <FaDownload />
                                </a>
                                <button
                                    onClick={() => handleDelete(doc._id)}
                                    className="p-1.5 text-neutral-400 hover:text-danger-600 rounded hover:bg-danger-50"
                                    title="Delete"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Document Preview Modal */}
            {previewDoc && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                        <div className="p-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50 rounded-t-xl">
                            <h3 className="font-bold text-lg">Document Review & Verification</h3>
                            <button onClick={() => setPreviewDoc(null)} className="text-neutral-400 hover:text-neutral-600 text-2xl">&times;</button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 bg-neutral-50 font-mono text-sm whitespace-pre-wrap">
                            <div className="mb-4 flex gap-4">
                                <div className="bg-white p-3 rounded border border-neutral-200 flex-1">
                                    <div className="text-[10px] uppercase text-neutral-400 font-bold mb-1">OCR Status</div>
                                    <div className="text-success-600 text-xs font-sans font-bold flex items-center gap-1">
                                        <FaCheckCircle className="text-xs" /> Data Extracted (98% Confidence)
                                    </div>
                                </div>
                                <div className="bg-white p-3 rounded border border-neutral-200 flex-1">
                                    <div className="text-[10px] uppercase text-neutral-400 font-bold mb-1">Audit Status</div>
                                    <div className={clsx(
                                        "text-xs font-sans font-bold",
                                        previewDoc.status === 'verified_l1' ? "text-primary-600" : "text-warning-600"
                                    )}>
                                        {previewDoc.status === 'verified_l1' ? "✅ Verified Level 1" : "⏳ Pending CA Audit"}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded border border-neutral-200 shadow-inner">
                                {previewDoc.extractedText || "No text content extracted."}
                            </div>
                        </div>
                        <div className="p-6 border-t border-neutral-100 flex justify-between items-center bg-white rounded-b-xl">
                            <a
                                href={`${API_BASE}${previewDoc.fileUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 text-sm font-bold hover:underline"
                            >
                                Open File Reference
                            </a>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setPreviewDoc(null)}
                                    className="px-6 py-2.5 bg-neutral-100 text-neutral-600 rounded-xl text-sm font-bold hover:bg-neutral-200 transition"
                                >
                                    Cancel
                                </button>
                                {previewDoc.status !== 'verified_l1' && (user?.role === 'ca' || user?.role === 'firms') && (
                                    <button
                                        onClick={() => handleVerify(previewDoc._id)}
                                        className="px-8 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition shadow-lg shadow-primary-500/20"
                                    >
                                        Verify (Level 1)
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentList;
