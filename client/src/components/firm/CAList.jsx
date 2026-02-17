import { FaEnvelope, FaPhone, FaUserTie } from 'react-icons/fa';

const CAList = ({ cas }) => {
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
                    <tr className="text-sm text-neutral-500 border-b border-neutral-100">
                        <th className="py-3 px-4 font-medium">Name</th>
                        <th className="py-3 px-4 font-medium">Contact</th>
                        <th className="py-3 px-4 font-medium">Role</th>
                        <th className="py-3 px-4 font-medium">Status</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {cas.map((ca) => (
                        <tr key={ca._id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
                                        {ca.name.charAt(0)}
                                    </div>
                                    <span className="font-medium text-neutral-900">{ca.name}</span>
                                </div>
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex flex-col text-xs text-neutral-500">
                                    <span className="flex items-center gap-1"><FaEnvelope size={10} /> {ca.email}</span>
                                    {ca.phone && <span className="flex items-center gap-1"><FaPhone size={10} /> {ca.phone}</span>}
                                </div>
                            </td>
                            <td className="py-3 px-4">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${ca.caProfile?.isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                    <FaUserTie size={10} />
                                    {ca.caProfile?.isAdmin ? 'Admin' : 'Associate'}
                                </span>
                            </td>
                            <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ca.isActive ? 'bg-success-100 text-success-700' : 'bg-neutral-100 text-neutral-600'}`}>
                                    {ca.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CAList;
