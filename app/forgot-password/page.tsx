'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import '../login/auth.css';

export default function ForgotPasswordPage() {
    const supabase = createClient();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleResetRequest(e: React.FormEvent) {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });

        if (error) {
            setError(error.message);
        } else {
            setMessage('再設定用のメールを送信しました。メール内のリンクをクリックしてください。');
        }
        setLoading(false);
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">🔒</div>
                <h1 className="auth-title">パスワード再設定</h1>
                <p className="auth-subtitle">登録済みのメールアドレスを入力してください</p>

                <form onSubmit={handleResetRequest} className="auth-form">
                    <div className="auth-field">
                        <label htmlFor="email">メールアドレス</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
                            required
                        />
                    </div>

                    {error && <div className="auth-error">{error}</div>}
                    {message && <div className="auth-success">{message}</div>}

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? '送信中...' : '再設定メールを送信'}
                    </button>
                </form>

                <p className="auth-link">
                    <a href="/login">ログイン画面に戻る</a>
                </p>
            </div>
        </div>
    );
}
