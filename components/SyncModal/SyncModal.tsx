'use client';

import { useState } from 'react';
import './SyncModal.css';

interface SyncModalProps {
    onSync: () => Promise<void>;
    onSkip: () => void;
}

export default function SyncModal({ onSync, onSkip }: SyncModalProps) {
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSync = async () => {
        setIsSyncing(true);
        setError(null);
        try {
            await onSync();
        } catch (err) {
            setError('同期に失敗しました。時間をおいて再度お試しください。');
            setIsSyncing(false);
        }
    };

    return (
        <div className="sync-modal-overlay">
            <div className="sync-modal-content">
                <div className="sync-modal-header">
                    <span className="sync-icon">🔄</span>
                    <h2>データの統合（マージ）</h2>
                </div>
                <div className="sync-modal-body">
                    <p>
                        デバイスに保存されているデータをアカウントに統合（マージ）しますか？
                    </p>
                    <div className="sync-notice">
                        <strong>確認:</strong><br />
                        現在編集中の内容は保持され、アカウント側のデータと統合されます。既存のデータが上書きされることはありません。
                    </div>
                    {error && <div className="sync-error">{error}</div>}
                </div>
                <div className="sync-modal-footer">
                    <button
                        className="btn-skip"
                        onClick={onSkip}
                        disabled={isSyncing}
                    >
                        今はしない
                    </button>
                    <button
                        className="btn-sync"
                        onClick={handleSync}
                        disabled={isSyncing}
                    >
                        {isSyncing ? '同期中...' : '同期を実行する'}
                    </button>
                </div>
            </div>
        </div>
    );
}
