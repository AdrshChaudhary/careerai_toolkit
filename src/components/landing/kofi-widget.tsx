'use client';

import Script from 'next/script';

export function KofiWidget() {
  return (
    <>
      <div id="kofi-widget-container"></div>
      <Script
        src="https://storage.ko-fi.com/cdn/widget/Widget_2.js"
        strategy="lazyOnload"
        onReady={() => {
          // @ts-ignore
          kofiwidget2.init('Support me on Ko-fi', '#72a4f2', 'F1F51CX8CM');
          // @ts-ignore
          kofiwidget2.draw();
        }}
      />
    </>
  );
}
