'use client';

import { useRouter } from 'next/navigation';
import './Landing.css';

export default function LandingPage() {
    const router = useRouter();

    return (
        <div className="landing-container">
            {/* Nav */}
            <nav className="landing-nav">
                <div className="nav-logo">📋 人生設計シート</div>
                <div className="nav-actions">
                    <button className="btn-secondary" onClick={() => router.push('/login')}>ログイン</button>
                    <button className="btn-primary" onClick={() => router.push('/signup')}>無料で始める</button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        人生を、<br />
                        <span className="text-gradient">PDCAサイクル</span>で設計する。
                    </h1>
                    <p className="hero-description">
                        「忘れる」をなくし、「信頼」を積み上げる。<br />
                        人生、フェーズ、年、月、週。すべてのレイヤーが連動する、<br />
                        最強の自己管理ツール。
                    </p>
                    <div className="hero-cta">
                        <button className="btn-primary btn-large" onClick={() => router.push('/signup')}>
                            今すぐ人生を設計する
                        </button>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="visual-mockup">
                        <div className="mockup-header">
                            <div className="dot red"></div>
                            <div className="dot yellow"></div>
                            <div className="dot green"></div>
                        </div>
                        <div className="mockup-content">
                            <div className="mockup-line"></div>
                            <div className="mockup-line short"></div>
                            <div className="mockup-grid">
                                <div className="mockup-cell active">P</div>
                                <div className="mockup-cell">D</div>
                                <div className="mockup-cell">C</div>
                                <div className="mockup-cell">A</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <h2 className="section-title">連動する5つのレイヤー</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🌏</div>
                        <h3>人生レベル</h3>
                        <p>生涯を通じて成し遂げたい大きなビジョンを描きます。</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🧱</div>
                        <h3>フェーズレベル</h3>
                        <p>3年単位の戦略を立て、人生の土台を固めます。</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🗓️</div>
                        <h3>年レベル</h3>
                        <p>その年の主要なマイルストーンを定義します。</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📆</div>
                        <h3>月レベル</h3>
                        <p>クォーターと月の目標を日々の行動に落とし込みます。</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📅</div>
                        <h3>週レベル</h3>
                        <p>今週の具体的なタスクと、その結果を振り返ります。</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-card">
                    <h2>「なんとなく」の毎日を、卒業しよう。</h2>
                    <p>管理されるのではなく、管理する人生へ。</p>
                    <button className="btn-white" onClick={() => router.push('/signup')}>
                        アカウントを作成する（無料）
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-logo">📋 人生設計シート</div>
                    <div className="footer-links">
                        <a href="/privacy">プライバシーポリシー</a>
                        <a href="/terms">利用規約</a>
                        <a href="/doc">ヘルプ・使い方</a>
                    </div>
                </div>
                <div className="footer-bottom">
                    © 2026 Life Schedule Sheet. Built for Clarity.
                </div>
            </footer>
        </div>
    );
}
