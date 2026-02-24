'use client';

import './Header.css';

interface HeaderProps {
    onMenuClick: () => void;
    title?: string;
}

export default function Header({ onMenuClick, title = '人生設計' }: HeaderProps) {
    return (
        <header className="mobile-header">
            <button className="menu-toggle-btn" onClick={onMenuClick} aria-label="Menu">
                <span className="hamburger-icon"></span>
            </button>
            <div className="header-title">{title}</div>
            <div className="header-spacer"></div>
        </header>
    );
}
