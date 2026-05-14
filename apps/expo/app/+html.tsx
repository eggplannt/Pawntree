import { ScrollViewStyleReset } from 'expo-router/html';

// Injected before the CDN so the CDN picks up our theme on first parse.
const TAILWIND_CONFIG = `
  window.tailwind = {
    config: {
      theme: {
        extend: {
          colors: {
            bg: {
              base:     '#0f1117',
              surface:  '#1a1d27',
              elevated: '#242736',
            },
            content: {
              primary:   '#e8e3d8',
              secondary: '#9a9490',
              muted:     '#5a5760',
            },
            accent: {
              DEFAULT: '#c8a96e',
              hover:   '#d4b87a',
              dim:     '#8a7048',
            },
            border: {
              DEFAULT: '#2a2d3a',
              subtle:  '#1e2130',
            },
            danger:  '#e05555',
            success: '#4caf7d',
          },
        },
      },
    },
  };
`;

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ height: '100%' }}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Pawntree</title>
        <ScrollViewStyleReset />
        {/* Inject theme before CDN so custom colors are available immediately */}
        <script dangerouslySetInnerHTML={{ __html: TAILWIND_CONFIG }} />
        <script src="https://cdn.tailwindcss.com" />
        <style dangerouslySetInnerHTML={{
          __html: `
            * { box-sizing: border-box; }
            html, body, #root { height: 100%; margin: 0; }
            body { background-color: #0f1117; color: #e8e3d8; }
          `
        }} />
      </head>
      <body style={{ height: '100%' }}>
        {children}
      </body>
    </html>
  );
}
