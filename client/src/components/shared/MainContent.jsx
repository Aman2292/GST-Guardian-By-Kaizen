import { useSidebar } from '../../context/SidebarContext';
import clsx from 'clsx';

/**
 * MainContent — wraps the right-side content area.
 * Automatically adjusts left margin based on sidebar collapsed state.
 */
const MainContent = ({ children, className = '' }) => {
    const { collapsed } = useSidebar();
    return (
        <div
            className={clsx(
                'flex-1 transition-[margin-left] duration-300 ease-in-out',
                collapsed ? 'ml-16' : 'ml-64',
                className
            )}
        >
            {children}
        </div>
    );
};

export default MainContent;
