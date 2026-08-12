"use client";

import { MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function MessagesPlaceholder() {
  /* BUG-042: bỏ `hidden` — main panel trong layout đã kiểm soát hiển thị mobile (ẩn khi có danh sách,
     hiện khi không có conversation được chọn). `hidden` cũ khiến placeholder không bao giờ hiện trên mobile. */
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-accent-subtle">
        <MessageSquare className="h-9 w-9 text-accent-text" strokeWidth={1.75} />
      </div>
      <h2
        className="mb-2 text-xl font-bold text-text-primary"
        style={{ fontFamily: 'var(--playfair-font), Georgia, serif' }}
      >
        Your Messages
      </h2>
      <p className="mb-6 max-w-xs text-sm leading-relaxed text-text-secondary">
        Select a conversation to start chatting, or visit someone&apos;s profile to start a new one.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-accent-subtle px-5 py-2.5 text-sm font-semibold text-accent-text transition-all hover:bg-accent hover:text-white"
      >
        Browse writers →
      </Link>
    </div>
  );
}
