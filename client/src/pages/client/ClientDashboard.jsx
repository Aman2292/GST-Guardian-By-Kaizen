import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import DeadlineList from '../../components/ca/DeadlineList';
import DocumentUpload from '../../components/shared/DocumentUpload';
import DocumentList from '../../components/shared/DocumentList';
import { FaFileUpload, FaHistory } from 'react-icons/fa';

const ClientDashboard = () => {
    const { user, logout } = useAuth();
    const [refreshDocs, setRefreshDocs] = useState(0);

    const handleUploadComplete = () => {
        setRefreshDocs(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-surface-page font-body text-neutral-900">
            <header className="h-16 bg-white border-b border-neutral-200 px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm">
                <div className="flex items-center gap-3 font-bold text-xl text-neutral-800">
                    <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">C</div>
                    <span>Client Portal</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold text-neutral-900">{user?.name}</div>
                        <div className="text-xs text-neutral-500">{user?.clientProfile?.businessName}</div>
                    </div>
                    <button onClick={logout} className="text-sm text-neutral-500 hover:text-danger-600 font-medium px-3 py-1 transition">Logout</button>
                </div>
            </header>

            <main className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
                <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold font-heading mb-2">Welcome, {user?.name}</h1>
                        <p className="text-neutral-300 max-w-xl">
                            Manage compliance for <b>{user?.clientProfile?.businessName}</b>.
                            Upload invoices and track your GST filings here.
                        </p>
                    </div>
                    <div className="absolute -right-10 -bottom-20 w-64 h-64 rounded-full bg-primary-500/20 blur-3xl"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <h2 className="text-xl font-bold font-heading text-neutral-800 mb-4 flex items-center gap-2">
                                <FaFileUpload className="text-primary-500" /> Upload Documents
                            </h2>
                            <DocumentUpload clientId={user?.userId} onUploadComplete={handleUploadComplete} />
                        </section>

                        <section>
                            <h2 className="text-xl font-bold font-heading text-neutral-800 mb-4 flex items-center gap-2">
                                <FaHistory className="text-primary-500" /> Recent Uploads
                            </h2>
                            <DocumentList clientId={user?.userId} refreshTrigger={refreshDocs} />
                        </section>
                    </div>

                    <div className="lg:col-span-1">
                        <h2 className="text-xl font-bold font-heading text-neutral-800 mb-4">Upcoming Deadlines</h2>
                        <div className="bg-white p-1 rounded-xl shadow-sm border border-neutral-100">
                            <DeadlineList />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ClientDashboard;
