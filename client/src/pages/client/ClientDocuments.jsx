import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import Sidebar from '../../components/shared/Sidebar';
import DocumentUpload from '../../components/shared/DocumentUpload';
import DocumentList from '../../components/shared/DocumentList';
import { FaFileUpload, FaHistory } from 'react-icons/fa';

const ClientDocuments = () => {
    const { user } = useAuth();
    const [refreshDocs, setRefreshDocs] = useState(0);

    const handleUploadComplete = () => {
        setRefreshDocs(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-surface-page font-body text-neutral-900 flex">
            <Sidebar />

            <div className="flex-1 ml-64 transition-all duration-300">
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-40 px-8 flex justify-between items-center">
                    <h1 className="text-xl font-bold font-heading text-neutral-800">My Documents</h1>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold text-neutral-900">{user?.name}</div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20 font-bold text-sm">
                            {user?.name?.charAt(0)}
                        </div>
                    </div>
                </header>

                <main className="p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
                    <section>
                        <h2 className="text-lg font-bold font-heading text-neutral-800 mb-4 flex items-center gap-2">
                            <FaFileUpload className="text-primary-500" /> Upload New Document
                        </h2>
                        <DocumentUpload clientId={user?.userId} onUploadComplete={handleUploadComplete} />
                    </section>

                    <section>
                        <h2 className="text-lg font-bold font-heading text-neutral-800 mb-4 flex items-center gap-2">
                            <FaHistory className="text-primary-500" /> Document History
                        </h2>
                        <DocumentList clientId={user?.userId} refreshTrigger={refreshDocs} />
                    </section>
                </main>
            </div>
        </div>
    );
};

export default ClientDocuments;
