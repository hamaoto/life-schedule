'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import '../login/auth.css';

export default function ResetPasswordPage() {
    const router = useRouter();
    const supabase = createClient();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        // Check if user is logged in (from the recovery link)
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setIsAuthorized(true);
            } else {
                setError('セッションが無効か期限切れです。再度パスワード再設定をリクエストしてください。');
            }
        };
        checkSession();
    }, [supabase]);

    async function handleResetPassword(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('パスワードが一致しません');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            alert('パスワードを更新しました。新しいパスワードでログインしてください。');
            router.push('/login');
        }
    }

    if (!isAuthorized && !error) {
        return (
            <div className="auth-container">
                <p>読み込み中...</p>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">🔑</div>
                <h1 className="auth-title">新しいパスワード</h1>
                <p className="auth-subtitle">新しいパスワードを設定してください</p>

                <form onSubmit={handleResetPassword} className="auth-form">
                    <div className="auth-field">
                        <label htmlFor="password">新しいパスワード</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div className="auth-field">
                        <label htmlFor="confirmPassword">パスワードの確認</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <button type="submit" className="auth-button" disabled={loading || !isAuthorized}>
                        {loading ? '更新中...' : 'パスワードを更新'}
                    </button>
                </form>
            </div>
        </div>
    );
}
