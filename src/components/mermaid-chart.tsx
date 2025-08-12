'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useTheme } from 'next-themes';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'inherit',
});

interface MermaidChartProps {
  chart: string;
}

export function MermaidChart({ chart }: MermaidChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    async function renderChart() {
      if (containerRef.current && chart) {
        try {
          // Set theme based on Next-themes
          mermaid.updateThemeVariables({
            darkMode: resolvedTheme === 'dark',
            background: resolvedTheme === 'dark' ? 'hsl(var(--card))' : 'hsl(var(--card))',
            primaryColor: 'hsl(var(--primary))',
            textColor: 'hsl(var(--foreground))',
            lineColor: 'hsl(var(--border))',
          });

          const { svg } = await mermaid.render(`mermaid-${Date.now()}`, chart);
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
            setIsRendered(true);
          }
        } catch (error) {
          console.error('Mermaid render error:', error);
          if (containerRef.current) {
            containerRef.current.innerHTML = 'Error rendering chart.';
          }
        }
      }
    }
    renderChart();
  }, [chart, resolvedTheme]);
  
  return <div ref={containerRef} className="w-full flex justify-center items-center" />;
}
