'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar/Sidebar';
import Header from '@/components/Header/Header';
import MobileNotice from '@/components/MobileNotice/MobileNotice';
import SyncModal from '@/components/SyncModal/SyncModal';
import { createClient } from '@/lib/supabase-client';
import './AppShell.css';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [user, setUser] = useState<any>(null);
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

    // Check for user and guest-id cookie to show sync modal
    useEffect(() => {
        const checkSyncNeeded = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user && !isMinimalPage) {
                // Read cookies manually since we're in a client component
                const cookies = document.cookie.split('; ');
                const guestIdCookie = cookies.find(row => row.startsWith('guest-id='));

                if (guestIdCookie) {
                    setShowSyncModal(true);
                }
            }
        };

        if (!isMinimalPage) {
            checkSyncNeeded();
        }
    }, [pathname, isMinimalPage]);

    const handleSync = async () => {
        const res = await fetch('/api/guest/sync', { method: 'POST' });
        if (res.ok) {
            setShowSyncModal(false);
            // Refresh the current page to show merged data
            router.refresh();
        } else {
            throw new Error('Sync failed');
        }
    };

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
            {showSyncModal && (
                <SyncModal
                    onSync={handleSync}
                    onSkip={() => setShowSyncModal(false)}
                />
            )}
        </div>
    );
}
