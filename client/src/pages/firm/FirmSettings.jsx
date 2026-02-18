import { useState } from 'react';
import Sidebar from '../../components/shared/Sidebar';
import api from '../../services/api';
import { FaCog, FaSave, FaSync } from 'react-icons/fa';

const FirmSettings = () => {
    const [config, setConfig] = useState([
        { type: 'GSTR-1', dueDay: 11 },
        { type: 'GSTR-3B', dueDay: 20 },
        { type: 'TDS Payment', dueDay: 7 }
    ]);
    const [loading, setLoading] = useState(false);
    const [seeding, setSeeding] = useState(false);

    const handleDateChange = (index, value) => {
        const newConfig = [...config];
        newConfig[index].dueDay = parseInt(value);
        setConfig(newConfig);
    };

    const saveSettings = async () => {
        setLoading(true);
        try {
            await api.put('/firm/settings', { complianceConfig: config });
            alert('Settings Saved');
        } catch (err) {
            console.error(err);
            alert('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    const seedDeadlines = async () => {
        if (!window.confirm("This will regenerate Feb 2026 deadlines for ALL clients based on current settings. Continue?")) return;

        setSeeding(true);
        try {
            const { data } = await api.post('/firm/seed-deadlines');
            alert(data.message);
        } catch (err) {
            console.error(err);
            alert('Failed to seed deadlines');
        } finally {
            setSeeding(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-page font-body text-neutral-900 flex">
            <Sidebar />

            <div className="flex-1 sidebar-content">
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-40 px-8 flex justify-between items-center">
                    <h1 className="text-xl font-bold font-heading text-neutral-800 flex items-center gap-2">
                        <FaCog className="text-primary-500" /> Firm Settings
                    </h1>
                </header>

                <main className="p-8 max-w-2xl mx-auto space-y-8 animate-fade-in">
                    <div className="bg-white p-8 rounded-xl shadow-card border border-neutral-100">
                        <h2 className="text-lg font-bold text-neutral-800 mb-6 flex items-center gap-2">
                            <FaCog /> Compliance Configuration (Feb 2026)
                        </h2>

                        <div className="space-y-4">
                            {config.map((item, index) => (
                                <div key={item.type} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                                    <div>
                                        <span className="font-medium text-neutral-700">{item.type}</span>
                                        <p className="text-xs text-neutral-500">Default Due Day of Month</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-neutral-400">Day:</span>
                                        <input
                                            type="number"
                                            min="1"
                                            max="31"
                                            value={item.dueDay}
                                            onChange={(e) => handleDateChange(index, e.target.value)}
                                            className="w-16 p-2 border border-neutral-300 rounded font-bold text-center focus:ring-primary-500 focus:border-primary-500"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex gap-4">
                            <button
                                onClick={saveSettings}
                                disabled={loading}
                                className="flex-1 bg-neutral-900 text-white py-3 rounded-lg font-medium hover:bg-neutral-800 transition flex items-center justify-center gap-2"
                            >
                                {loading ? 'Saving...' : <><FaSave /> Save Configuration</>}
                            </button>

                            <button
                                onClick={seedDeadlines}
                                disabled={seeding}
                                className="flex-1 bg-white text-primary-600 border border-primary-200 py-3 rounded-lg font-medium hover:bg-primary-50 transition flex items-center justify-center gap-2"
                            >
                                {seeding ? 'Processing...' : <><FaSync /> Seed Feb 2026 Deadlines</>}
                            </button>
                        </div>

                        <p className="text-xs text-neutral-400 mt-4 text-center">
                            * Seeding will create deadlines for all clients for Feb 2026 using these dates.
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default FirmSettings;
