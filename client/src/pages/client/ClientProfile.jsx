import useAuth from '../../hooks/useAuth';
import Sidebar from '../../components/shared/Sidebar';
import { FaUser, FaBuilding, FaPhone, FaEnvelope, FaFileContract, FaMapMarkerAlt } from 'react-icons/fa';

const ClientProfile = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-surface-page font-body text-neutral-900 flex">
            <Sidebar />

            <div className="flex-1 ml-64 transition-all duration-300">
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-40 px-8 flex justify-between items-center">
                    <h1 className="text-xl font-bold font-heading text-neutral-800">Profile</h1>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Business Info */}
                        <div className="bg-white p-8 rounded-xl shadow-card border border-neutral-100">
                            <h2 className="text-lg font-bold font-heading text-neutral-800 mb-6 flex items-center gap-2">
                                <FaBuilding className="text-primary-500" /> Business Details
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Business Name</label>
                                    <p className="text-neutral-900 font-medium text-lg mt-1">{user?.clientProfile?.businessName}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Business Type</label>
                                    <p className="text-neutral-900 font-medium mt-1">{user?.clientProfile?.businessType}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">GSTIN</label>
                                    <p className="text-neutral-900 font-mono font-medium mt-1 bg-neutral-50 inline-block px-2 py-1 rounded border border-neutral-200">
                                        {user?.clientProfile?.gstin}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">PAN</label>
                                    <p className="text-neutral-900 font-mono font-medium mt-1">{user?.clientProfile?.pan}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Address</label>
                                    <div className="flex gap-2 mt-1 text-neutral-700">
                                        <FaMapMarkerAlt className="mt-1 text-neutral-400" />
                                        <p>{user?.clientProfile?.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-white p-8 rounded-xl shadow-card border border-neutral-100 h-fit">
                            <h2 className="text-lg font-bold font-heading text-neutral-800 mb-6 flex items-center gap-2">
                                <FaUser className="text-primary-500" /> Contact Information
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Full Name</label>
                                    <p className="text-neutral-900 font-medium text-lg mt-1">{user?.name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Email Address</label>
                                    <div className="flex items-center gap-2 mt-1 text-neutral-900 font-medium">
                                        <FaEnvelope className="text-neutral-400" />
                                        {user?.email}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Phone Number</label>
                                    <div className="flex items-center gap-2 mt-1 text-neutral-900 font-medium">
                                        <FaPhone className="text-neutral-400" />
                                        {user?.phone || 'Not provided'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ClientProfile;
