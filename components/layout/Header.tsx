"use client";

import { useSession } from "next-auth/react";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">Admin Panel</h2>
      </div>
      <div className="flex items-center gap-4">
        {session?.user && (
          <span className="text-sm text-gray-600">
            {session.user.name || session.user.email}
          </span>
        )}
      </div>
    </header>
  );
}

