'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

declare global {
    interface Window {
        kofiWidgetOverlay: {
            draw: (username: string, config: object) => void;
        };
    }
}

export function KofiWidget() {
    const pathname = usePathname();

    useEffect(() => {
        // Ensure the widget is redrawn on route changes if it exists
        if (window.kofiWidgetOverlay) {
            window.kofiWidgetOverlay.draw('aadarshchaudhary', {
                'type': 'floating-chat',
                'floating-chat.donateButton.text': 'Support me',
                'floating-chat.donateButton.background-color': '#794bc4',
                'floating-chat.donateButton.text-color': '#fff'
            });
        }
    }, [pathname]); // Re-run the effect when the path changes

    return (
        <>
            <Script
                src="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js"
                strategy="lazyOnload"
                onLoad={() => {
                    if (window.kofiWidgetOverlay) {
                        window.kofiWidgetOverlay.draw('aadarshchaudhary', {
                            'type': 'floating-chat',
                            'floating-chat.donateButton.text': 'Support me',
                            'floating-chat.donateButton.background-color': '#794bc4',
                            'floating-chat.donateButton.text-color': '#fff'
                        });
                    }
                }}
            />
        </>
    );
}
