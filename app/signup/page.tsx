'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import '../login/auth.css';

export default function SignupPage() {
    const router = useRouter();
    const supabase = createClient();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('パスワードが一致しません');
            return;
        }

        if (password.length < 6) {
            setError('パスワードは6文字以上にしてください');
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
            // Auto-login after signup
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (!signInError) {
                router.push('/');
                router.refresh();
            }
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">📋</div>
                <h1 className="auth-title">人生設計</h1>
                <p className="auth-subtitle">新規登録</p>

                {success ? (
                    <div className="auth-success">
                        <p>登録完了！リダイレクト中...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSignup} className="auth-form">
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
                        <div className="auth-field">
                            <label htmlFor="password">パスワード</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="6文字以上"
                                required
                            />
                        </div>
                        <div className="auth-field">
                            <label htmlFor="confirmPassword">パスワード確認</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="もう一度入力"
                                required
                            />
                        </div>

                        {error && <div className="auth-error">{error}</div>}

                        <button type="submit" className="auth-button" disabled={loading}>
                            {loading ? '登録中...' : '新規登録'}
                        </button>
                    </form>
                )}

                <p className="auth-link">
                    既にアカウントをお持ちですか？{' '}
                    <a href="/login">ログイン</a>
                </p>
            </div>
        </div>
    );
}
