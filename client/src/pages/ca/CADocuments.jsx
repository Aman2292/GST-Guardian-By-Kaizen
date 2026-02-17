import Sidebar from '../../components/shared/Sidebar';
import DocumentList from '../../components/shared/DocumentList';
import { FaFileInvoice } from 'react-icons/fa';

const CADocuments = () => {
    return (
        <div className="min-h-screen bg-surface-page font-body text-neutral-900 flex">
            <Sidebar />

            <div className="flex-1 ml-64 transition-all duration-300">
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-40 px-8 flex justify-between items-center">
                    <h1 className="text-xl font-bold font-heading text-neutral-800 flex items-center gap-2">
                        <FaFileInvoice className="text-primary-500" /> Documents
                    </h1>
                </header>

                <main className="p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
                    <p className="text-neutral-500">All documents uploaded by clients or generated for them.</p>
                    {/* Note: DocumentList fetches ALL documents for the user context. For CA, it fetches all docs they have access to. */}
                    <DocumentList />
                </main>
            </div>
        </div>
    );
};

export default CADocuments;
