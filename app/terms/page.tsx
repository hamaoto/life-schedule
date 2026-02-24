'use client';

import '../login/auth.css';

export default function TermsOfServicePage() {
    return (
        <div className="auth-container" style={{ alignItems: 'flex-start', paddingTop: '80px' }}>
            <div className="auth-card" style={{ maxWidth: '800px', textAlign: 'left' }}>
                <h1 className="auth-title">利用規約</h1>
                <p className="auth-subtitle">最終更新日: 2026年2月25日</p>

                <div className="policy-content" style={{ color: '#475569', fontSize: '14px', lineHeight: '1.8' }}>
                    <section style={{ marginBottom: '24px' }}>
                        <h2 style={{ color: '#1e293b', fontSize: '18px', marginBottom: '12px' }}>1. サービスの概要</h2>
                        <p>本サービスは、ユーザーが作成する「人生設計シート」を通じて自己管理を支援するツールです。</p>
                    </section>

                    <section style={{ marginBottom: '24px' }}>
                        <h2 style={{ color: '#1e293b', fontSize: '18px', marginBottom: '12px' }}>2. 禁止事項</h2>
                        <ul style={{ paddingLeft: '20px' }}>
                            <li>他者の著作権やプライバシーを侵害する情報の入力</li>
                            <li>サービスのサーバーに対する過度な負荷をかける行為</li>
                            <li>法令に反する目的での利用</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '24px' }}>
                        <h2 style={{ color: '#1e293b', fontSize: '18px', marginBottom: '12px' }}>3. 免責事項</h2>
                        <p>本サービスを利用したことによる、直接的または間接的な損害について、当運営は一切の責任を負いません。入力したデータのバックアップは、必要に応じてユーザー自身の責任で行ってください。</p>
                    </section>

                    <section style={{ marginBottom: '24px' }}>
                        <h2 style={{ color: '#1e293b', fontSize: '18px', marginBottom: '12px' }}>4. 規約の変更</h2>
                        <p>当運営は、必要に応じて本規約を変更できるものとします。重大な変更がある場合は、サービス内で告知します。</p>
                    </section>
                </div>

                <div style={{ marginTop: '40px' }}>
                    <a href="/" className="auth-button" style={{ display: 'inline-block', width: 'auto', padding: '10px 24px', textDecoration: 'none' }}>トップページへ戻る</a>
                </div>
            </div>
        </div>
    );
}
