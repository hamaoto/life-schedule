'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './settings.css';

export default function SettingsPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [birthYear, setBirthYear] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('/api/profile')
            .then(res => res.json())
            .then(data => {
                setEmail(data.email || '');
                setBirthYear(data.profile?.birthYear?.toString() || '');
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    async function handleSave() {
        setSaving(true);
        setMessage('');
        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    birthYear: birthYear ? parseInt(birthYear) : null,
                }),
            });
            if (res.ok) {
                setMessage('保存しました！');
                setTimeout(() => setMessage(''), 2000);
            }
        } catch {
            setMessage('保存に失敗しました');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>読み込み中...</p>
            </div>
        );
    }

    const currentYear = new Date().getFullYear();
    const currentAge = birthYear ? currentYear - parseInt(birthYear) : null;

    return (
        <div className="settings-page">
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">設定</h1>
                    <p className="page-subtitle">アカウント設定</p>
                </div>
            </div>

            <div className="settings-card">
                <div className="settings-section">
                    <h2 className="settings-section-title">アカウント情報</h2>
                    <div className="settings-field">
                        <label>メールアドレス</label>
                        <div className="settings-value">{email}</div>
                    </div>
                </div>

                <div className="settings-section">
                    <h2 className="settings-section-title">プロフィール</h2>
                    <div className="settings-field">
                        <label htmlFor="birthYear">生まれ年（任意）</label>
                        <p className="settings-hint">設定すると、各年に年齢が表示されます</p>
                        <div className="settings-input-row">
                            <input
                                id="birthYear"
                                type="number"
                                value={birthYear}
                                onChange={(e) => setBirthYear(e.target.value)}
                                placeholder="例: 1998"
                                min="1920"
                                max={currentYear}
                                className="settings-input"
                            />
                            {currentAge !== null && (
                                <span className="settings-age-preview">
                                    → 現在 {currentAge}歳
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="settings-actions">
                    <button
                        className="settings-save-button"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? '保存中...' : '保存'}
                    </button>
                    {message && (
                        <span className={`settings-message ${message.includes('失敗') ? 'error' : 'success'}`}>
                            {message}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
