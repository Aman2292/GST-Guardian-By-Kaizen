import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import Sidebar from '../../components/shared/Sidebar';
import api from '../../services/api';
import { FaCalendarAlt, FaShieldAlt, FaClock, FaFileUpload, FaCheckCircle } from 'react-icons/fa';
import clsx from 'clsx';

const ClientDashboard = () => {
    const { user } = useAuth();
    const [deadlines, setDeadlines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedDeadline, setSelectedDeadline] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/client/my-deadlines');
            if (res.data.success) {
                setDeadlines(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching client deadlines:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openUploadModal = (deadline) => {
        setSelectedDeadline(deadline);
        setShowUploadModal(true);
    };

    const handleUploadSuccess = () => {
        setShowUploadModal(false);
        fetchData(); // Refresh to show updated status
    };

    const pendingCount = deadlines.filter(d => d.status !== 'filed').length;

    return (
        <div className="min-h-screen bg-surface-page font-body text-neutral-900 flex">
            <Sidebar />

            <div className="flex-1 ml-64 transition-all duration-300">
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-40 px-8 flex justify-between items-center">
                    <div className="flex items-center gap-3 font-bold text-xl text-neutral-800">
                        <span>Client Hub</span>
                    </div>
                </header>

                <main className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
                    {/* Welcome Card */}
                    <div className="bg-gradient-to-br from-indigo-900 to-primary-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h1 className="text-3xl font-bold font-heading mb-2">Welcome, {user?.name}</h1>
                            <p className="text-indigo-100 max-w-xl text-lg">
                                Your business compliance health at a glance for <b>{user?.clientProfile?.businessName}</b>.
                            </p>

                            <div className="mt-6 flex gap-4">
                                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                                    <div className="text-xs uppercase tracking-wider text-indigo-200 font-bold">Pending Tasks</div>
                                    <div className="text-2xl font-bold">{pendingCount}</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                                    <div className="text-xs uppercase tracking-wider text-indigo-200 font-bold">Assigned CA</div>
                                    <div className="text-sm font-bold truncate max-w-[150px]">Expert In-Charge</div>
                                </div>
                            </div>
                        </div>
                        <FaShieldAlt className="absolute -right-10 -bottom-10 text-white/5 text-[240px]" />
                    </div>

                    {/* Pending Compliances Table */}
                    <section className="bg-white rounded-2xl shadow-card border border-neutral-100 overflow-hidden">
                        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                            <h2 className="text-xl font-bold font-heading text-neutral-800 flex items-center gap-2">
                                <FaCalendarAlt className="text-primary-500" /> Pending Compliances
                            </h2>
                            <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Action Required</span>
                        </div>

                        {loading ? (
                            <div className="p-20 text-center text-neutral-400">Loading your compliances...</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-xs font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-100">
                                            <th className="px-6 py-4">Compliance Type</th>
                                            <th className="px-6 py-4">Due Date</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-50">
                                        {deadlines.map(deadline => {
                                            const isOverdue = new Date(deadline.dueDate) < new Date() && deadline.status !== 'filed';
                                            return (
                                                <tr key={deadline._id} className="hover:bg-neutral-50/50 transition-colors">
                                                    <td className="px-6 py-5">
                                                        <div className="text-sm font-bold text-neutral-800">{deadline.type}</div>
                                                        <div className="text-[10px] text-neutral-400 font-mono mt-0.5 uppercase">{deadline.month ? `${deadline.month}/${deadline.year}` : 'Annual'}</div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className={clsx(
                                                            "flex items-center gap-2 text-sm font-mono",
                                                            isOverdue ? "text-danger-600 font-bold" : "text-neutral-600"
                                                        )}>
                                                            <FaClock className={isOverdue ? "animate-pulse" : ""} />
                                                            {new Date(deadline.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col gap-1">
                                                            <span className={clsx(
                                                                "px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide border w-fit",
                                                                deadline.status === 'filed'
                                                                    ? "bg-success-50 text-success-700 border-success-100"
                                                                    : deadline.documentStatus === 'verified_l2'
                                                                        ? "bg-success-50 text-success-700 border-success-200"
                                                                        : deadline.documentStatus === 'verified_l1'
                                                                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                                                            : deadline.documentStatus
                                                                                ? "bg-primary-50 text-primary-700 border-primary-100"
                                                                                : "bg-neutral-50 text-neutral-500 border-neutral-100"
                                                            )}>
                                                                {deadline.status === 'filed'
                                                                    ? 'Completed'
                                                                    : deadline.documentStatus === 'verified_l2'
                                                                        ? 'Fully Verified'
                                                                        : deadline.documentStatus === 'verified_l1'
                                                                            ? 'CA Verified'
                                                                            : deadline.documentStatus
                                                                                ? 'Verification Pending'
                                                                                : 'Draft Pending'}
                                                            </span>
                                                            {deadline.documentStatus === 'verified_l1' && deadline.verifiedByName && (
                                                                <span className="text-[9px] text-indigo-600 font-bold flex items-center gap-1">
                                                                    <FaCheckCircle size={8} /> CA: {deadline.verifiedByName}
                                                                </span>
                                                            )}
                                                            {deadline.documentStatus === 'verified_l2' && deadline.verifiedByL2Name && (
                                                                <span className="text-[9px] text-success-600 font-bold flex items-center gap-1">
                                                                    <FaCheckCircle size={8} /> Firm: {deadline.verifiedByL2Name}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        {deadline.status !== 'filed' ? (
                                                            <button
                                                                onClick={() => openUploadModal(deadline)}
                                                                disabled={!!deadline.documentStatus}
                                                                className={clsx(
                                                                    "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm",
                                                                    deadline.documentStatus
                                                                        ? "bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200"
                                                                        : "bg-primary-600 text-white hover:bg-primary-700"
                                                                )}
                                                            >
                                                                {deadline.documentStatus ? (
                                                                    <>
                                                                        <FaCheckCircle className="text-neutral-300" />
                                                                        {deadline.documentStatus === 'verified_l2' ? 'Fully Verified' : 'Pending Review'}
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <FaFileUpload /> Upload Doc
                                                                    </>
                                                                )}
                                                            </button>
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-success-600 font-bold text-xs bg-success-50 px-3 py-2 rounded-lg w-fit">
                                                                <FaCheckCircle /> Filed Successfully
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {deadlines.length === 0 && (
                                    <div className="p-20 text-center">
                                        <FaCalendarAlt className="mx-auto text-4xl text-neutral-100 mb-4" />
                                        <p className="text-neutral-500 font-medium">No pending compliances found.</p>
                                        <p className="text-xs text-neutral-400 mt-1">Everything is up to date!</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                </main>
            </div>

            {showUploadModal && (
                <ComplianceUploadModal
                    deadline={selectedDeadline}
                    onClose={() => setShowUploadModal(false)}
                    onSuccess={handleUploadSuccess}
                />
            )}
        </div>
    );
};

// Internal Modal Component
const ComplianceUploadModal = ({ deadline, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('deadlineId', deadline._id);
        formData.append('category', deadline.type.includes('GSTR') ? 'Sale Invoice' : 'Other');

        try {
            const res = await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                onSuccess();
            }
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-neutral-800">Upload Compliance Doc</h3>
                        <p className="text-xs text-neutral-400 mt-0.5">Linking to {deadline.type} ({deadline.month}/{deadline.year})</p>
                    </div>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 font-bold text-xl">&times;</button>
                </div>

                <form onSubmit={handleUpload} className="p-8 space-y-6">
                    <div className="border-2 border-dashed border-neutral-200 rounded-xl p-8 text-center bg-neutral-50 hover:bg-neutral-100 transition cursor-pointer relative group">
                        <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                        <FaFileUpload className="mx-auto text-4xl text-neutral-300 group-hover:text-primary-500 mb-3" />
                        <p className="text-sm font-medium text-neutral-600">
                            {file ? file.name : "Click or Drag file here"}
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-wider">PDF, JPG, PNG up to 10MB</p>
                    </div>

                    <button
                        type="submit"
                        disabled={!file || uploading}
                        className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold tracking-wide hover:bg-primary-700 disabled:bg-neutral-300 transition shadow-lg shadow-primary-500/20"
                    >
                        {uploading ? "Uploading..." : "Submit for Verification"}
                    </button>

                    <p className="text-[10px] text-center text-neutral-500 leading-relaxed">
                        By uploading, you certify that these documents are authentic. <br />
                        Our CAs will verify these within 24 hours.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default ClientDashboard;
