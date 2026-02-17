import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaFilePdf, FaFileImage, FaFileAlt, FaDownload, FaTrash } from 'react-icons/fa';

const DocumentList = ({ clientId, refreshTrigger }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

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
        if (mimeType?.includes('pdf')) return <FaFilePdf className="text-red-500" />;
        if (mimeType?.includes('image')) return <FaFileImage className="text-blue-500" />;
        return <FaFileAlt className="text-gray-500" />;
    };

    const API_BASE = 'http://localhost:5000'; // Should come from environment

    if (loading) return <div className="text-center text-sm text-neutral-400 py-4">Loading documents...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
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
                                    {getIcon(doc.metadata?.mimeType)}
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-neutral-900 truncate max-w-[200px]">{doc.name}</h4>
                                    <div className="text-xs text-neutral-500 flex items-center gap-2">
                                        <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide">{doc.type}</span>
                                        <span>•</span>
                                        <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span>{doc.uploadedBy?.name}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                                <a
                                    href={`${API_BASE}${doc.url}`}
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
        </div>
    );
};

export default DocumentList;
