'use client';

import Script from 'next/script';
import { useEffect } from 'react';

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
        // This function will only run on the client side, after the component mounts.
        const drawWidget = () => {
            if (window.kofiWidgetOverlay) {
                 // To prevent multiple widgets from being drawn, we can remove the old one first.
                const existingIframe = document.getElementById('kofi-iframe-container');
                if (existingIframe) {
                    existingIframe.remove();
                }
                window.kofiWidgetOverlay.draw(kofiId, kofiConfig);
            }
        };

        // If the script is already loaded, draw the widget immediately.
        if (document.readyState === 'complete' && window.kofiWidgetOverlay) {
            drawWidget();
        }
        
        // The onload event on the Script component will handle drawing when the script loads.
    }, []);

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
