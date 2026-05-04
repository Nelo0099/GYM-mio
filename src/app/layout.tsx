
import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Impulso Fitness | SaaS Gym Platform',
  description: 'Gimnasio moderno con tecnología de punta y acompañamiento personalizado.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased text-foreground bg-background">
        {children}
      </body>
    </html>
  );
}
