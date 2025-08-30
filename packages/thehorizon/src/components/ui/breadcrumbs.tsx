"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Breadcrumbs({ base }: { base?: { href: string; label: string } }) {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);
  const items: { href: string; label: string }[] = [];
  let acc = "";
  for (const p of parts) {
    acc += `/${p}`;
    items.push({ href: acc, label: decodeURIComponent(p) });
  }
  let crumbs = items;
  if (base) {
    // Avoid duplicating the base if it equals the first computed segment
    if (!items.length || items[0]?.href !== base.href) {
      crumbs = [base, ...items];
    }
  }
  return (
    <nav className="text-sm text-muted-foreground">
      {crumbs.map((c, i) => (
        <span key={`${c.href}-${i}`}>
          {i > 0 && <span className="px-1">/</span>}
          {i < crumbs.length - 1 ? (
            <Link href={c.href} className="hover:underline">
              {c.label}
            </Link>
          ) : (
            <span className="text-foreground">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
