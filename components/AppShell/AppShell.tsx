'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar/Sidebar';
import Header from '@/components/Header/Header';
import './AppShell.css';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const isAuthPage = pathname === '/login' || pathname === '/signup';

    // Close sidebar on navigation (mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <Header onMenuClick={() => setIsSidebarOpen(true)} />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            {isSidebarOpen && <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />}
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
