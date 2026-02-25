'use client';

import { useState, useEffect } from 'react';
import './MobileNotice.css';

export default function MobileNotice() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Only show if on mobile and not dismissed in this session
        const isMobile = window.innerWidth < 768;
        const isDismissed = sessionStorage.getItem('mobile-notice-dismissed');

        if (isMobile && !isDismissed) {
            setIsVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem('mobile-notice-dismissed', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="mobile-notice-overlay">
            <div className="mobile-notice-card">
                <div className="mobile-notice-icon">💻</div>
                <h3>PCでの利用を推奨します</h3>
                <p>
                    「人生設計シート」は、大画面での閲覧・編集に最適化されています。<br />
                    スマホでは操作が困難な場合があるため、快適な体験のためにPCでのご利用を強く推奨いたします。
                </p>
                <div className="mobile-notice-actions">
                    <button className="mobile-notice-btn" onClick={handleDismiss}>
                        このままスマホで表示する
                    </button>
                </div>
            </div>
        </div>
    );
}
