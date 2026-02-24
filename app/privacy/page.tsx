'use client';

import '../login/auth.css';

export default function PrivacyPolicyPage() {
    return (
        <div className="auth-container" style={{ alignItems: 'flex-start', paddingTop: '80px' }}>
            <div className="auth-card" style={{ maxWidth: '800px', textAlign: 'left' }}>
                <h1 className="auth-title">プライバシーポリシー</h1>
                <p className="auth-subtitle">最終更新日: 2026年2月25日</p>

                <div className="policy-content" style={{ color: '#475569', fontSize: '14px', lineHeight: '1.8' }}>
                    <section style={{ marginBottom: '24px' }}>
                        <h2 style={{ color: '#1e293b', fontSize: '18px', marginBottom: '12px' }}>1. 収集する情報</h2>
                        <p>当サービス（人生設計シート）では、メールアドレスおよびサービス内での入力データを、サービス提供および改善の目的で収集します。</p>
                    </section>

                    <section style={{ marginBottom: '24px' }}>
                        <h2 style={{ color: '#1e293b', fontSize: '18px', marginBottom: '12px' }}>2. 情報の利用目的</h2>
                        <ul style={{ paddingLeft: '20px' }}>
                            <li>本人確認およびログインの管理</li>
                            <li>データの保存および同期（Supabaseを利用）</li>
                            <li>サービスの重要なお知らせの送信</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '24px' }}>
                        <h2 style={{ color: '#1e293b', fontSize: '18px', marginBottom: '12px' }}>3. 情報の保管とセキュリティ</h2>
                        <p>収集したデータは、Supabaseの提供する暗号化および強固なセキュリティ環境下で保管されます。ユーザー本人の承諾なく第三者にデータを提供することはありません。</p>
                    </section>

                    <section style={{ marginBottom: '24px' }}>
                        <h2 style={{ color: '#1e293b', fontSize: '18px', marginBottom: '12px' }}>4. データの削除</h2>
                        <p>ユーザーはいつでも退会し、自身のデータを削除することを要求できます。お問い合わせはサービス管理までお願いします。</p>
                    </section>
                </div>

                <div style={{ marginTop: '40px' }}>
                    <a href="/" className="auth-button" style={{ display: 'inline-block', width: 'auto', padding: '10px 24px', textDecoration: 'none' }}>トップページへ戻る</a>
                </div>
            </div>
        </div>
    );
}
