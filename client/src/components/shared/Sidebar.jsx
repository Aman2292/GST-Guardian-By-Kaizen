import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUsers, FaFileInvoice, FaCalendarAlt, FaCog, FaSignOutAlt, FaHistory, FaShieldAlt, FaBars, FaChevronLeft } from 'react-icons/fa';
import clsx from 'clsx';
import useAuth from '../../hooks/useAuth';
import { useSidebar } from '../../context/SidebarContext';

const Sidebar = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const { collapsed, toggle } = useSidebar();

    let navItems = [];

    if (user?.role === 'firms') {
        navItems = [
            { name: 'Dashboard', path: '/firm/dashboard', icon: FaHome },
            { name: 'My CAs', path: '/firm/cas', icon: FaUsers },
            { name: 'Clients', path: '/firm/clients', icon: FaUsers },
            { name: 'Reports', path: '/firm/reports', icon: FaFileInvoice },
            { name: 'Audit Logs', path: '/firm/audit-logs', icon: FaHistory },
            { name: 'Settings', path: '/firm/settings', icon: FaCog },
        ];
    } else if (user?.role === 'ca') {
        navItems = [
            { name: 'Dashboard', path: '/ca/dashboard', icon: FaHome },
            { name: 'Clients', path: '/ca/clients', icon: FaUsers },
            { name: 'Central Vault', path: '/ca/documents', icon: FaFileInvoice },
            { name: 'Deadlines', path: '/ca/deadlines', icon: FaCalendarAlt },
            { name: 'Settings', path: '/ca/settings', icon: FaCog },
        ];
    } else if (user?.role === 'client') {
        navItems = [
            { name: 'Dashboard', path: '/dashboard', icon: FaHome },
            { name: 'Central Vault', path: '/client/documents', icon: FaFileInvoice },
            { name: 'Profile', path: '/client/profile', icon: FaCog },
        ];
    }

    return (
        <aside
            className={clsx(
                'fixed left-0 top-0 h-screen bg-sidebar text-sidebar-text flex flex-col font-sans z-50 overflow-hidden',
                'transition-[width] duration-300 ease-in-out',
                collapsed ? 'w-16' : 'w-64'
            )}
        >
            {/* ── Brand ─────────────────────────────────────────── */}
            <div className="h-16 flex items-center border-b border-gray-700/50 px-3 flex-shrink-0">
                {/* Logo icon — always visible */}
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/20 flex-shrink-0">
                    <FaShieldAlt className="text-white text-sm" />
                </div>

                {/* Brand name — hidden when collapsed */}
                <div
                    className={clsx(
                        'ml-3 overflow-hidden transition-all duration-300',
                        collapsed ? 'w-0 opacity-0' : 'w-40 opacity-100'
                    )}
                >
                    <span className="text-white font-bold text-base tracking-tight whitespace-nowrap">
                        GST Guardian
                    </span>
                </div>

                {/* Toggle button — pushes to right when expanded */}
                <button
                    onClick={toggle}
                    className={clsx(
                        'ml-auto flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors',
                        collapsed && 'mx-auto ml-0'
                    )}
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? <FaBars className="text-xs" /> : <FaChevronLeft className="text-xs" />}
                </button>
            </div>

            {/* ── Navigation ────────────────────────────────────── */}
            <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto overflow-x-hidden">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            title={collapsed ? item.name : undefined}
                            className={clsx(
                                'flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative',
                                collapsed ? 'justify-center' : '',
                                isActive
                                    ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                                    : 'hover:bg-sidebar-hover hover:text-white'
                            )}
                        >
                            <item.icon
                                className={clsx(
                                    'text-lg flex-shrink-0',
                                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                                )}
                            />

                            {/* Label — hidden when collapsed */}
                            <span
                                className={clsx(
                                    'overflow-hidden whitespace-nowrap transition-all duration-300',
                                    collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                                )}
                            >
                                {item.name}
                            </span>

                            {/* Active dot */}
                            {isActive && !collapsed && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse flex-shrink-0" />
                            )}

                            {/* Tooltip when collapsed */}
                            {collapsed && (
                                <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-neutral-800 text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-white/10">
                                    {item.name}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* ── User Profile & Logout ─────────────────────────── */}
            <div className="border-t border-gray-700/50 p-2 space-y-1 flex-shrink-0">
                {/* Avatar row */}
                <div
                    className={clsx(
                        'flex items-center gap-3 px-2.5 py-2 bg-neutral-800/50 rounded-xl border border-gray-700/30',
                        collapsed && 'justify-center'
                    )}
                >
                    <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-primary-500/20 flex-shrink-0">
                        {user?.name?.charAt(0)}
                    </div>
                    <div
                        className={clsx(
                            'flex-1 min-w-0 overflow-hidden transition-all duration-300',
                            collapsed ? 'w-0 opacity-0' : 'opacity-100'
                        )}
                    >
                        <div className="text-sm font-bold text-white truncate">{user?.name}</div>
                        <div className="text-[10px] uppercase tracking-wider font-extrabold text-primary-400">
                            {user?.role === 'firms' ? 'Firm Owner' : user?.role === 'ca' ? 'CA Expert' : 'Client Hub'}
                        </div>
                    </div>
                </div>

                {/* Sign out */}
                <button
                    onClick={logout}
                    title={collapsed ? 'Sign Out' : undefined}
                    className={clsx(
                        'flex items-center gap-3 w-full px-2.5 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-neutral-800 hover:text-red-400 transition-colors group',
                        collapsed && 'justify-center'
                    )}
                >
                    <FaSignOutAlt className="group-hover:rotate-12 transition-transform flex-shrink-0" />
                    <span
                        className={clsx(
                            'overflow-hidden whitespace-nowrap transition-all duration-300',
                            collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                        )}
                    >
                        Sign Out
                    </span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
