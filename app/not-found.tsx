'use client';

import { useRouter } from 'next/navigation';
import './login/auth.css';

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">🔍</div>
                <h1 className="auth-title">404 - Page Not Found</h1>
                <p className="auth-subtitle">お探しのページは見つかりませんでした。</p>

                <div style={{ marginTop: '32px' }}>
                    <button className="auth-button" onClick={() => router.push('/')}>
                        トップページへ戻る
                    </button>
                </div>
            </div>
        </div>
    );
}
