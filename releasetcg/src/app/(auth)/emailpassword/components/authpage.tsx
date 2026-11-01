"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type AuthPageProps = {
  title: string;
  children: ReactNode;
};

export function AuthPage({
  title,
  children,
}: AuthPageProps) {
  return (
    <div className="flex min-h-dvh items-center justify-center flex-col bg-gradient-to-br from-[#1c1b1c] to-[#1c1b1c] text-slate-100">
      <header className="backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-5xl font-semibold text-white">{title}</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-12">
        <div className="grid gap-8">
          <div className="flex flex-col gap-6">{children}</div>
        </div>
      </main>
    </div>
  );
}