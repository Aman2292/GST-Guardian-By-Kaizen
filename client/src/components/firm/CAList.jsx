import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaUserTie } from 'react-icons/fa';

const CAList = ({ cas }) => {
    const navigate = useNavigate();

    if (!cas || cas.length === 0) {
        return (
            <div className="text-center py-10 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                <p className="text-neutral-500">No CAs found. Invite your first employee!</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-sm text-neutral-500 border-b border-neutral-100 uppercase tracking-widest text-[10px]">
                        <th className="py-3 px-4 font-bold">Name</th>
                        <th className="py-3 px-4 font-bold">Contact</th>
                        <th className="py-3 px-4 font-bold">Role</th>
                        <th className="py-3 px-4 font-bold">Status</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {cas.map((ca) => (
                        <tr
                            key={ca._id}
                            className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors cursor-pointer group"
                            onClick={() => navigate(`/firm/cas/${ca._id}`)}
                        >
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold group-hover:scale-110 transition-transform">
                                        {ca.name.charAt(0)}
                                    </div>
                                    <span className="font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">{ca.name}</span>
                                </div>
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex flex-col text-xs text-neutral-500 group-hover:text-neutral-700 transition-colors">
                                    <span className="flex items-center gap-1 font-medium"><FaEnvelope size={10} className="text-neutral-300" /> {ca.email}</span>
                                    {ca.phone && <span className="flex items-center gap-1 font-medium"><FaPhone size={10} className="text-neutral-300" /> {ca.phone}</span>}
                                </div>
                            </td>
                            <td className="py-3 px-4">
                                <span className={clsx(
                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight",
                                    ca.caProfile?.isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                )}>
                                    <FaUserTie size={10} />
                                    {ca.caProfile?.isAdmin ? 'Senior' : 'Associate'}
                                </span>
                            </td>
                            <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${ca.isActive ? 'bg-success-100 text-success-700' : 'bg-neutral-100 text-neutral-600'}`}>
                                    {ca.isActive ? 'Active' : 'Offline'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Add clsx import or just use template literals if clsx is not available in small components
const clsx = (...classes) => classes.filter(Boolean).join(' ');

export default CAList;
