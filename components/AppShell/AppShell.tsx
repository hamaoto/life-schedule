'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar/Sidebar';
import Header from '@/components/Header/Header';
import MobileNotice from '@/components/MobileNotice/MobileNotice';
import './AppShell.css';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // Pages that should have NO app shell (Sidebar, Header, etc.)
    const minimalPaths = ['/landing', '/login', '/signup', '/privacy', '/terms', '/forgot-password', '/reset-password', '/auth/callback'];
    const isMinimalPage = minimalPaths.some(path => pathname.startsWith(path)) || pathname === '/';

    // Pages that are accessible without login but SHOULD have the app shell
    // (Note: /sheet and /jump are handled here implicitly by not being in minimalPaths 
    // and allowed by middleware)

    // Close sidebar on navigation (mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    if (isMinimalPage) {
        return <>{children}</>;
    }

    return (
        <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <MobileNotice />
            <Header onMenuClick={() => setIsSidebarOpen(true)} />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            {isSidebarOpen && <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />}
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
