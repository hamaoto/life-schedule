'use client';

import './doc.css';

export default function DocPage() {
    // Placeholder links - can be managed via DB later
    const links = [
        {
            title: '人生設計・四軸フレーム(FCCF)',
            url: 'https://docs.google.com/document/d/1cBo90m8LGHOEUZwBbQQVKIn0nYbpZwIP0J_JEYQT7ZA/edit?tab=t.0',
            description: '人生設計シートの説明',
        },
        {
            title: 'FCCFの具体的内容',
            url: 'https://docs.google.com/document/d/1B21jKQvBlVLZv8U27QXOZ6zRAUi2j8LOWaFIG__HDhY/edit?tab=t.0',
            description: '四軸フレームの具体的な内容について',
        },
        {
            title: 'FCCFの年間の例',
            url: 'https://docs.google.com/spreadsheets/d/1lbbQaZZ2Ap8LzY4O0AWekVslQuyqfCSENmfa2w26fkE/edit?usp=sharing',
            description: '年間計画のスプレッドシート例',
        },
    ];

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Doc</h1>
                <p className="page-subtitle">ドキュメント・リンク集</p>
            </div>
            <div className="doc-list">
                {links.length === 0 ? (
                    <p className="doc-empty">リンクはまだありません</p>
                ) : (
                    links.map((link, i) => (
                        <a key={i} href={link.url} className="doc-card" target="_blank" rel="noopener noreferrer">
                            <div className="doc-card-title">{link.title}</div>
                            {link.description && (
                                <div className="doc-card-desc">{link.description}</div>
                            )}
                        </a>
                    ))
                )}
            </div>
        </div>
    );
}
