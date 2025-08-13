'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

declare global {
    interface Window {
        kofiWidgetOverlay: {
            draw: (username: string, config: object) => void;
            getIframe: () => HTMLIFrameElement | null;
            remove: () => void;
        };
    }
}

export function KofiWidget() {
    const pathname = usePathname();

    const kofiId = 'aadarshchaudhary';
    const kofiConfig = {
        'type': 'floating-chat',
        'floating-chat.donateButton.text': 'Support me',
        'floating-chat.donateButton.background-color': '#794bc4',
        'floating-chat.donateButton.text-color': '#fff',
        'floating-chat.chatButton.position.bottom': '1rem',
        'floating-chat.chatButton.position.right': '1rem',
    };

    useEffect(() => {
        // Ensure the widget is redrawn on route changes if it exists
        // This is a robust way to handle SPAs with third-party widgets
        if (window.kofiWidgetOverlay) {
             // To prevent multiple widgets from being drawn, we can remove the old one first.
            const existingIframe = document.getElementById('kofi-iframe-container');
            if (existingIframe) {
                existingIframe.remove();
            }
            window.kofiWidgetOverlay.draw(kofiId, kofiConfig);
        }
    }, [pathname]);

    return (
        <Script
            id="kofi-widget-script"
            src="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js"
            strategy="lazyOnload"
            onLoad={() => {
                if (window.kofiWidgetOverlay) {
                    window.kofiWidgetOverlay.draw(kofiId, kofiConfig);
                }
            }}
        />
    );
}
