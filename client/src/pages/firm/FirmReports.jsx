import { useState, useEffect } from 'react';
import Sidebar from '../../components/shared/Sidebar';
import ClientList from '../../components/ca/ClientList'; // Reusing from CA
import api from '../../services/api';
import { FaFileInvoice, FaChartPie } from 'react-icons/fa';

const FirmReports = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Firm Admin fetches ALL clients due to updated controller logic
        const fetchAllClients = async () => {
            try {
                const { data } = await api.get('/ca/clients'); // Using CA route which now supports Firm Admin
                if (data.success) {
                    setClients(data.data);
                }
            } catch (error) {
                console.error("Error fetching clients for reports:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllClients();
    }, []);

    return (
        <div className="min-h-screen bg-surface-page font-body text-neutral-900 flex">
            <Sidebar />

            <div className="flex-1 ml-64 transition-all duration-300">
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-40 px-8 flex justify-between items-center">
                    <h1 className="text-xl font-bold font-heading text-neutral-800 flex items-center gap-2">
                        <FaFileInvoice className="text-primary-500" /> Reports & Analytics
                    </h1>
                </header>

                <main className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">

                    {/* Placeholder Analytics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center"><FaChartPie /></div>
                                <h3 className="font-semibold text-neutral-700">Client Growth</h3>
                            </div>
                            <p className="text-2xl font-bold">{clients.length}</p>
                            <p className="text-xs text-neutral-500">Active Clients</p>
                        </div>
                        {/* More placeholders can be added */}
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-bold font-heading text-neutral-800">All Clients List</h2>
                        {loading ? (
                            <div className="p-12 text-center text-neutral-400">Loading report data...</div>
                        ) : (
                            <ClientList clients={clients} />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default FirmReports;
