import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    FaFilePdf, FaFileImage, FaFileAlt, FaDownload, FaTrash,
    FaEye, FaCheckCircle, FaExclamationTriangle, FaTimesCircle,
    FaShieldAlt, FaInfoCircle
} from 'react-icons/fa';
import clsx from 'clsx';
import useAuth from '../../hooks/useAuth';

const DocumentList = ({ clientId, refreshTrigger }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewDoc, setPreviewDoc] = useState(null);
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
        let styles = 'bg-neutral-100 text-neutral-600 border-neutral-200';
        let label = status;

        if (status === 'processed') {
            styles = 'bg-blue-50 text-blue-700 border border-blue-100';
            label = 'AI Audited';
        } else if (status === 'processing') {
            styles = 'bg-warning-50 text-warning-700 border border-warning-200 animate-pulse';
            label = 'AI Processing';
        } else if (status === 'flagged') {
            styles = 'bg-danger-50 text-danger-700 border border-danger-200';
            label = 'Review Required';
        } else if (status === 'verified_l1') {
            styles = 'bg-primary-50 text-primary-700 border border-primary-200';
            label = 'Verification Pending';
        } else if (status === 'uploaded') {
            label = 'Queued';
        }

        return (
            <span className={clsx("px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide border", styles)}>
                {label}
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

    const API_BASE = 'http://localhost:5000';

    if (loading) return <div className="text-center text-sm text-neutral-400 py-4 font-body">Loading vault...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden relative font-body">
            <div className="p-4 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                <h3 className="font-bold text-neutral-800 uppercase text-xs tracking-widest">Document Vault</h3>
                <span className="text-[10px] text-neutral-400 font-bold">{documents.length} Files</span>
            </div>

            <div className="divide-y divide-neutral-100 max-h-[500px] overflow-y-auto">
                {documents.length === 0 ? (
                    <div className="p-12 text-center text-neutral-400 text-sm italic">
                        No documents in vault.
                    </div>
                ) : (
                    documents.map(doc => (
                        <div key={doc._id} className="p-4 hover:bg-neutral-50 flex items-center justify-between group transition cursor-default">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-xl shadow-sm border border-neutral-200 group-hover:bg-white transition">
                                    {getIcon(doc.fileType)}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-neutral-800 truncate max-w-[250px]">{doc.originalName || doc.fileName}</h4>
                                    <div className="text-[10px] text-neutral-500 flex items-center gap-2 mt-1 font-bold uppercase tracking-tighter">
                                        <span className="bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">{doc.category || 'Unclassified'}</span>
                                        {getStatusBadge(doc.status)}
                                        {doc.status === 'verified_l1' && doc.verifiedBy && (
                                            <span className="text-success-600 font-bold flex items-center gap-1">
                                                <FaCheckCircle size={8} /> By {doc.verifiedBy.name}
                                            </span>
                                        )}
                                        {doc.riskLevel === 'high' && doc.status !== 'verified_l1' && (
                                            <span className="bg-danger-100 text-danger-700 px-1.5 py-0.5 rounded border border-danger-200 flex items-center gap-1">
                                                <FaExclamationTriangle size={8} /> High Risk
                                            </span>
                                        )}
                                        <span className="text-neutral-300">•</span>
                                        <span className="text-neutral-400">{new Date(doc.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition translate-x-2 group-hover:translate-x-0">
                                {(user?.role === 'ca' || user?.role === 'firms') && (
                                    <button
                                        onClick={() => setPreviewDoc(doc)}
                                        className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-primary-600 rounded-lg hover:bg-primary-50 border border-transparent hover:border-primary-100 transition shadow-sm"
                                        title="AI Inspection"
                                    >
                                        <FaShieldAlt size={14} />
                                    </button>
                                )}

                                <a
                                    href={`${API_BASE}/${doc.fileUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-primary-600 rounded-lg hover:bg-primary-50 border border-transparent hover:border-primary-100 transition shadow-sm"
                                    title="Download"
                                >
                                    <FaDownload size={14} />
                                </a>
                                <button
                                    onClick={() => handleDelete(doc._id)}
                                    className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-danger-600 rounded-lg hover:bg-danger-50 border border-transparent hover:border-danger-100 transition shadow-sm"
                                    title="Delete"
                                >
                                    <FaTrash size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* AI Inspection Preview Modal */}
            {previewDoc && (
                <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-neutral-200">
                        {/* Header */}
                        <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                                    <FaShieldAlt size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-neutral-800">AI Compliance Inspection</h3>
                                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">{previewDoc.originalName}</p>
                                </div>
                            </div>
                            <button onClick={() => setPreviewDoc(null)} className="w-10 h-10 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-400 transition text-2xl">&times;</button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-neutral-50/50">
                            {/* Left: Extracted Data */}
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                                    <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <FaInfoCircle className="text-primary-500" /> Extracted Structured Data
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                                                <p className="text-[10px] text-neutral-400 font-bold uppercase">Invoice No</p>
                                                <p className="text-sm font-bold text-neutral-800 font-mono">{previewDoc.extractedData?.invoiceNumber || '-'}</p>
                                            </div>
                                            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                                                <p className="text-[10px] text-neutral-400 font-bold uppercase">Invoice Date</p>
                                                <p className="text-sm font-bold text-neutral-800">{previewDoc.extractedData?.invoiceDate || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                                                <p className="text-[10px] text-neutral-400 font-bold uppercase">Document Type</p>
                                                <p className="text-sm font-bold text-neutral-800">{previewDoc.extractedData?.documentType || 'Tax Invoice'}</p>
                                            </div>
                                            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                                                <p className="text-[10px] text-neutral-400 font-bold uppercase">Reverse Charge</p>
                                                <p className={clsx("text-sm font-bold", previewDoc.extractedData?.reverseCharge ? "text-danger-600" : "text-success-600")}>
                                                    {previewDoc.extractedData?.reverseCharge ? 'YES' : 'NO'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                                            <p className="text-[10px] text-neutral-400 font-bold uppercase">Supplier</p>
                                            <p className="text-sm font-bold text-neutral-800">{previewDoc.extractedData?.supplierName || previewDoc.extractedData?.vendorName || '-'}</p>
                                            <p className="text-[10px] text-neutral-500 font-mono mt-0.5">{previewDoc.extractedData?.supplierGstin || '-'}</p>
                                        </div>
                                        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                                            <p className="text-[10px] text-neutral-400 font-bold uppercase">Recipient (Client)</p>
                                            <p className="text-sm font-bold text-neutral-800">{previewDoc.extractedData?.recipientName || '-'}</p>
                                            <p className="text-[10px] text-neutral-500 font-mono mt-0.5">{previewDoc.extractedData?.recipientGstin || '-'}</p>
                                        </div>
                                        {previewDoc.extractedData?.irn && (
                                            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                                                <p className="text-[10px] text-neutral-400 font-bold uppercase text-blue-600">e-Invoice IRN</p>
                                                <p className="text-[10px] font-mono break-all text-neutral-600">{previewDoc.extractedData.irn}</p>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="p-3 bg-primary-50 rounded-xl border border-primary-100">
                                                <p className="text-[10px] text-primary-400 font-bold uppercase">Taxable Value</p>
                                                <p className="text-sm font-bold text-primary-700">₹{(previewDoc.extractedData?.taxableValue || 0).toLocaleString()}</p>
                                            </div>
                                            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                                                <p className="text-[10px] text-neutral-400 font-bold uppercase">Cess</p>
                                                <p className="text-sm font-bold text-neutral-700">₹{(previewDoc.extractedData?.cessAmount || 0).toLocaleString()}</p>
                                            </div>
                                            <div className="p-3 bg-primary-600 rounded-xl shadow-lg shadow-primary-500/20">
                                                <p className="text-[10px] text-primary-200 font-bold uppercase">Total (INR)</p>
                                                <p className="text-sm font-bold text-white">₹{(previewDoc.extractedData?.totalAmount || previewDoc.extractedData?.amount || 0).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        {previewDoc.extractedData?.currency && previewDoc.extractedData?.currency !== 'INR' && (
                                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] text-amber-600 font-bold uppercase">Original Multi-Currency</p>
                                                    <p className="text-sm font-bold text-amber-800">
                                                        {previewDoc.extractedData.currency} {previewDoc.extractedData.originalTotalAmount?.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-amber-600 font-bold uppercase">Ex. Rate</p>
                                                    <p className="text-xs font-bold text-amber-800">1 {previewDoc.extractedData.currency} = ₹{previewDoc.extractedData.exchangeRate}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                                    <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Raw OCR Transcript</h4>
                                    <div className="text-[10px] font-mono whitespace-pre-wrap bg-neutral-900 text-neutral-400 p-4 rounded-xl max-h-[200px] overflow-y-auto leading-relaxed border border-neutral-800">
                                        {previewDoc.ocrText || previewDoc.extractedText}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Compliance Flags */}
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm h-full flex flex-col">
                                    <div className="flex justify-between items-center mb-6">
                                        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                            <FaShieldAlt className="text-primary-500" /> Compliance Audit Results
                                        </h4>
                                        <span className={clsx(
                                            "px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border",
                                            previewDoc.riskLevel === 'high' ? "bg-danger-50 text-danger-700 border-danger-100" :
                                                previewDoc.riskLevel === 'medium' ? "bg-warning-50 text-warning-700 border-warning-100" :
                                                    "bg-success-50 text-success-700 border-success-100"
                                        )}>
                                            {previewDoc.riskLevel || 'low'} RISK
                                        </span>
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        {previewDoc.complianceFlags?.length > 0 ? (
                                            previewDoc.complianceFlags.map((flag, idx) => (
                                                <div key={idx} className={clsx(
                                                    "p-4 rounded-xl border flex gap-3 transition hover:shadow-md",
                                                    flag.severity === 'high' ? "bg-danger-50 border-danger-100" :
                                                        flag.severity === 'medium' ? "bg-warning-50 border-warning-100" :
                                                            "bg-primary-50 border-primary-100"
                                                )}>
                                                    <div className="mt-1">
                                                        {flag.severity === 'high' ? <FaTimesCircle className="text-danger-500" /> :
                                                            flag.severity === 'medium' ? <FaExclamationTriangle className="text-warning-500" /> :
                                                                <FaCheckCircle className="text-primary-500" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-neutral-800">{flag.issue}</p>
                                                        <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{flag.explanation}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-success-50 rounded-2xl border border-success-100">
                                                <div className="w-16 h-16 bg-success-500 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-success-500/20">
                                                    <FaCheckCircle size={32} />
                                                </div>
                                                <h5 className="font-bold text-success-700">All Checks Passed</h5>
                                                <p className="text-xs text-success-600 mt-1">This document is fully GST compliant based on AI analysis.</p>
                                            </div>
                                        )}
                                    </div>

                                    {previewDoc.suggestedAction && (
                                        <div className="mt-8 p-4 bg-primary-900 text-white rounded-xl shadow-xl">
                                            <p className="text-[10px] font-bold text-primary-300 uppercase tracking-widest mb-1">Recommended Action</p>
                                            <p className="text-sm font-medium">{previewDoc.suggestedAction}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-neutral-100 flex justify-between items-center bg-white">
                            <a
                                href={`${API_BASE}/${previewDoc.fileUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-2.5 bg-neutral-100 text-neutral-600 rounded-xl text-sm font-bold hover:bg-neutral-200 transition border border-neutral-200"
                            >
                                View Original Document
                            </a>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setPreviewDoc(null)}
                                    className="px-6 py-2.5 bg-white text-neutral-500 rounded-xl text-sm font-bold hover:text-neutral-800 transition"
                                >
                                    Dismiss
                                </button>
                                {previewDoc.status !== 'verified_l1' && (user?.role === 'ca' || user?.role === 'firms') && (
                                    <button
                                        onClick={() => handleVerify(previewDoc._id)}
                                        className="px-8 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition shadow-lg shadow-primary-500/20 flex items-center gap-2"
                                    >
                                        <FaCheckCircle /> Approve & Verify
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

