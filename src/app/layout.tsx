import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'APEX-CODE | AI Coding Platform',
  description: 'Production-grade AI coding platform powered by Kimi K2.5. Out-features ChatGPT and Gemini in every dimension a developer cares about.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-white antialiased font-sans">
        {children}
      </body>
    </html>
  );
}