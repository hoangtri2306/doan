"use client";

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import { useAuth } from '../hooks/useAuth';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

/* Pages that bypass the navbar and use full-viewport layout */
const FULL_PAGE_ROUTES = ['/login', '/register'];

export default function NavbarWrapper({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const isFullPage = FULL_PAGE_ROUTES.includes(pathname);
  const { isAuthenticated, user } = useAuth();

  if (isAdmin) {
    return <>{children}</>;
  }

  if (isFullPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      {isAuthenticated && user && user.status === 'WARNING' && (
        <div className="border-b border-warning/20 bg-warning-subtle px-4 py-2.5 text-sm sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="h-4 w-4 shrink-0 text-warning" strokeWidth={2} />
              <span className="leading-snug text-text-primary">
                <strong className="font-semibold">Cảnh báo tài khoản:</strong>{' '}
                <strong className="font-semibold text-warning">{user.violationScore || 0}/10</strong>{' '}
                điểm vi phạm — tài khoản sẽ bị khóa vĩnh viễn nếu đạt 10 điểm.
              </span>
            </div>
            <Link href="/appeals" className="focus-ring shrink-0 rounded-md text-xs font-semibold text-warning hover:underline">
              Xem kháng cáo →
            </Link>
          </div>
        </div>
      )}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </>
  );
}
