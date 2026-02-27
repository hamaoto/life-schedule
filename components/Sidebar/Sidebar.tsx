'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import './Sidebar.css';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();
    const [userEmail, setUserEmail] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUserEmail(user?.email || null);
        });
    }, []);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    // Month-based week: week of the current month (1-5)
    const currentWeekOfMonth = Math.min(Math.ceil(now.getDate() / 7), 5);
    const currentWeekPeriod = (currentMonth - 1) * 5 + currentWeekOfMonth;

    function isActive(path: string) {
        return pathname === path;
    }

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-brand">
                <div className="sidebar-logo">📋</div>
                <h1 className="sidebar-title">人生設計</h1>
                <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
                    ✕
                </button>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section">
                    <div className="nav-section-label">クイックアクセス</div>
                    <button
                        className={`nav-item ${isActive('/sheet/life/0/0') ? 'active' : ''}`}
                        onClick={() => router.push('/sheet/life/0/0')}
                    >
                        <span className="nav-icon">🌏</span>
                        <span className="nav-text">人生</span>
                    </button>
                    <button
                        className={`nav-item ${isActive(`/sheet/week/${currentYear}/${currentWeekPeriod}`) ? 'active' : ''}`}
                        onClick={() => router.push(`/sheet/week/${currentYear}/${currentWeekPeriod}`)}
                    >
                        <span className="nav-icon">📅</span>
                        <span className="nav-text">今週</span>
                    </button>
                    <button
                        className={`nav-item ${isActive(`/sheet/month/${currentYear}/${currentMonth}`) ? 'active' : ''}`}
                        onClick={() => router.push(`/sheet/month/${currentYear}/${currentMonth}`)}
                    >
                        <span className="nav-icon">📆</span>
                        <span className="nav-text">今月</span>
                    </button>
                    <button
                        className={`nav-item ${isActive(`/sheet/year/${currentYear}/0`) ? 'active' : ''}`}
                        onClick={() => router.push(`/sheet/year/${currentYear}/0`)}
                    >
                        <span className="nav-icon">🗓️</span>
                        <span className="nav-text">今年</span>
                    </button>
                </div>

                <div className="nav-section">
                    <div className="nav-section-label">ナビゲーション</div>
                    <button
                        className={`nav-item ${isActive('/jump') ? 'active' : ''}`}
                        onClick={() => router.push('/jump')}
                    >
                        <span className="nav-icon">📁</span>
                        <span className="nav-text">Jump</span>
                    </button>
                </div>

                <div className="nav-section">
                    <div className="nav-section-label">資料・設定</div>
                    <button
                        className={`nav-item ${isActive('/doc') ? 'active' : ''}`}
                        onClick={() => router.push('/doc')}
                    >
                        <span className="nav-icon">📄</span>
                        <span className="nav-text">Doc</span>
                    </button>
                    <button
                        className={`nav-item ${isActive('/settings') ? 'active' : ''}`}
                        onClick={() => router.push('/settings')}
                    >
                        <span className="nav-icon">⚙️</span>
                        <span className="nav-text">設定</span>
                    </button>
                </div>

                <div className="nav-section account-section">
                    {userEmail ? (
                        <>
                            <div className="account-email" title={userEmail}>
                                <span className="account-icon">👤</span>
                                <span className="account-text">{userEmail}</span>
                            </div>
                            <button
                                className="nav-item logout-button"
                                onClick={async () => {
                                    await supabase.auth.signOut();
                                    router.push('/login');
                                    router.refresh();
                                }}
                            >
                                <span className="nav-icon">門</span>
                                <span className="nav-text">ログアウト</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="account-email">
                                <span className="account-icon">👤</span>
                                <span className="account-text">ゲストユーザー</span>
                            </div>
                            <button
                                className="nav-item sync-button"
                                onClick={() => router.push('/login')}
                            >
                                <span className="nav-icon">✨</span>
                                <span className="nav-text">ログインまたは登録</span>
                            </button>
                        </>
                    )}
                </div>
            </nav>
        </aside>
    );
}
