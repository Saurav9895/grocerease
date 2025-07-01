"use client";

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/CartProvider';
import { usePathname } from 'next/navigation';
import { ShopHeader } from '@/components/common/ShopHeader';
import { Footer } from '@/components/common/Footer';
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

// Metadata cannot be exported from a client component. 
// We can define it here, but it will be static.
// export const metadata: Metadata = {
//   title: 'GrocerEase',
//   description: 'Your friendly neighborhood online grocery store.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');
  const isAuthPage = pathname.startsWith('/signin') || pathname.startsWith('/signup');

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <title>GrocerEase</title>
      </head>
      <body className={cn("font-body antialiased", inter.variable)}>
        <AuthProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              {!isAdminPage && !isAuthPage && <ShopHeader />}
              <main className="flex-grow">{children}</main>
              {!isAdminPage && !isAuthPage && <Footer />}
            </div>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
