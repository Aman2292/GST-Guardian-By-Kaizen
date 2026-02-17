import Sidebar from '../../components/shared/Sidebar';
import DeadlineList from '../../components/ca/DeadlineList';
import { FaCalendarAlt } from 'react-icons/fa';

const CADeadlines = () => {
    return (
        <div className="min-h-screen bg-surface-page font-body text-neutral-900 flex">
            <Sidebar />

            <div className="flex-1 ml-64 transition-all duration-300">
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-40 px-8 flex justify-between items-center">
                    <h1 className="text-xl font-bold font-heading text-neutral-800 flex items-center gap-2">
                        <FaCalendarAlt className="text-primary-500" /> Deadlines
                    </h1>
                </header>

                <main className="p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
                    <p className="text-neutral-500">Track and manage compliance deadlines for all clients.</p>
                    <div className="bg-white p-2 rounded-xl border border-neutral-100 dark:border-neutral-700">
                        <DeadlineList />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CADeadlines;
