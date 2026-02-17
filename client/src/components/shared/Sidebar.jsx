import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUsers, FaFileInvoice, FaCalendarAlt, FaCog, FaSignOutAlt } from 'react-icons/fa';
import clsx from 'clsx';
import useAuth from '../../hooks/useAuth';

const Sidebar = () => {
    const location = useLocation();
    const { user, logout } = useAuth();

    // Define navigation items based on role
    let navItems = [];

    if (user?.role === 'firms') {
        // Firm Admin
        navItems = [
            { name: 'Dashboard', path: '/firm/dashboard', icon: FaHome },
            { name: 'My CAs', path: '/firm/cas', icon: FaUsers },
            { name: 'Reports', path: '/firm/reports', icon: FaFileInvoice },
            { name: 'Settings', path: '/firm/settings', icon: FaCog },
        ];
    } else if (user?.role === 'ca') {
        // CA Employee
        navItems = [
            { name: 'Dashboard', path: '/ca/dashboard', icon: FaHome },
            { name: 'Clients', path: '/ca/clients', icon: FaUsers },
            { name: 'Documents', path: '/ca/documents', icon: FaFileInvoice },
            { name: 'Deadlines', path: '/ca/deadlines', icon: FaCalendarAlt },
            { name: 'Settings', path: '/ca/settings', icon: FaCog },
        ];
    } else if (user?.role === 'client') {
        // Client
        navItems = [
            { name: 'Dashboard', path: '/dashboard', icon: FaHome },
            { name: 'My Documents', path: '/client/documents', icon: FaFileInvoice },
            { name: 'Profile', path: '/client/profile', icon: FaCog },
        ];
    }

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar text-sidebar-text flex flex-col font-sans transition-all duration-300 z-50">
            {/* Brand */}
            <div className="h-16 flex items-center px-6 border-b border-gray-700/50">
                <div className="flex items-center gap-3 text-white font-bold text-xl tracking-tight">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <span className="text-white text-sm">CA</span>
                    </div>
                    <span>Command</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={clsx(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                                isActive
                                    ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                                    : 'hover:bg-sidebar-hover hover:text-white'
                            )}
                        >
                            <item.icon className={clsx("text-lg", isActive ? "text-white" : "text-gray-400 group-hover:text-white")} />
                            {item.name}
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User & Logout */}
            <div className="p-4 border-t border-gray-700/50">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-neutral-800 hover:text-red-400 transition-colors"
                >
                    <FaSignOutAlt />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
