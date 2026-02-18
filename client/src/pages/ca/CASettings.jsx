import Sidebar from '../../components/shared/Sidebar';
import { FaCog } from 'react-icons/fa';

const CASettings = () => {
    return (
        <div className="min-h-screen bg-surface-page font-body text-neutral-900 flex">
            <Sidebar />

            <div className="flex-1 sidebar-content">
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-40 px-8 flex justify-between items-center">
                    <h1 className="text-xl font-bold font-heading text-neutral-800 flex items-center gap-2">
                        <FaCog className="text-primary-500" /> Settings
                    </h1>
                </header>

                <main className="p-8 max-w-xl mx-auto space-y-6 animate-fade-in">
                    <div className="bg-white p-8 rounded-xl shadow-card border border-neutral-100 text-center">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
                            <FaCog size={32} />
                        </div>
                        <h2 className="text-lg font-bold text-neutral-800">Settings Coming Soon</h2>
                        <p className="text-neutral-500 mt-2">Configuration options for notifications and profile will be available here.</p>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CASettings;
