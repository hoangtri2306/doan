import { Inter, Playfair_Display } from 'next/font/google';
import { AuthProvider } from '../hooks/useAuth';
import NavbarWrapper from '../components/NavbarWrapper';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--inter-font',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--playfair-font',
});

export const metadata = {
  title: 'Inkwell — A space for ideas',
  description: 'Discover thoughtful writing on topics that matter. Share your stories with a community of curious readers.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased min-h-screen bg-bg text-text-primary">
        <AuthProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--text-primary)',
                color: 'var(--bg)',
                fontSize: '13px',
                fontWeight: 500,
                borderRadius: '10px',
                boxShadow: 'var(--shadow-md)',
                padding: '12px 16px',
              },
            }}
          />
          <NavbarWrapper>
            {children}
          </NavbarWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
