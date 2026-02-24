'use client';

import { useEffect } from 'react';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { usePathname, useSearchParams } from 'next/navigation';

export default function ProgressBar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Configure NProgress
        NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.1 });

        // Stop progress when path/params change
        NProgress.done();

        return () => {
            // Start progress when unmounting (optional, some use it to catch the start of next nav)
        };
    }, [pathname, searchParams]);

    return null;
}
