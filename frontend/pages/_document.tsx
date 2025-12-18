/**
 * _document.jsx - Document Structure
 * Handles HTML structure, meta tags, and fonts
 */

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        
        {/* Meta tags for SEO and social sharing */}
        <meta name="description" content="ACT Platform - Digital Token Exchange and User Management System" />
        <meta name="keywords" content="ACT tokens, digital exchange, wallet, KYC, PesaPal" />
        <meta name="author" content="ACT Platform" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'} />
        <meta property="og:title" content="ACT Platform - Digital Token Exchange" />
        <meta property="og:description" content="Secure digital token exchange platform with advanced KYC verification and wallet management." />
        <meta property="og:image" content="/og-image.jpg" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'} />
        <meta property="twitter:title" content="ACT Platform - Digital Token Exchange" />
        <meta property="twitter:description" content="Secure digital token exchange platform with advanced KYC verification and wallet management." />
        <meta property="twitter:image" content="/og-image.jpg" />
        
        {/* PWA and mobile */}
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      </Head>
      <body className="font-sans antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}