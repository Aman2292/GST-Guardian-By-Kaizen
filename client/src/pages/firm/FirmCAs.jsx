import { useState, useEffect } from 'react';
import Sidebar from '../../components/shared/Sidebar';
import CAList from '../../components/firm/CAList';
import api from '../../services/api';
import { FaUserPlus, FaUsers } from 'react-icons/fa';

const FirmCAs = () => {
    const [cas, setCas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCAs = async () => {
            try {
                const { data } = await api.get('/firm/cas');
                if (data.success) {
                    setCas(data.data);
                }
            } catch (error) {
                console.error("Error fetching CAs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCAs();
    }, []);

    return (
        <div className="min-h-screen bg-surface-page font-body text-neutral-900 flex">
            <Sidebar />

            <div className="flex-1 ml-64 transition-all duration-300">
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-40 px-8 flex justify-between items-center">
                    <h1 className="text-xl font-bold font-heading text-neutral-800 flex items-center gap-2">
                        <FaUsers className="text-primary-500" /> My CAs
                    </h1>
                </header>

                <main className="p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center">
                        <p className="text-neutral-500">Manage your Chartered Accountant employees.</p>
                        <button className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors">
                            <FaUserPlus /> Invite CA
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-card border border-neutral-100">
                        {loading ? (
                            <div className="p-12 text-center text-neutral-400">Loading staff details...</div>
                        ) : (
                            <CAList cas={cas} />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default FirmCAs;
