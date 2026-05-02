import Link from "next/link";
import { BrandWordmark } from "@/components/BrandWordmark";
import { Button } from "@/components/ui/Button";

type Props = {
  email?: string | null;
  demo?: boolean;
};

export function AppHeader({ email, demo }: Props) {
  return (
    <header className="no-print sticky top-0 z-10 border-b-2 border-red-200 bg-card/95 backdrop-blur">
      {demo ? (
        <div className="roof-banner-fill px-4 py-2 text-center text-xs font-semibold text-red-900">
          Preview mode — add Supabase keys and set NEXT_PUBLIC_DEMO_MODE=false to save real quotes
        </div>
      ) : null}
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3 sm:max-w-2xl">
        <Link href="/dashboard" className="min-w-0 shrink py-1">
          <BrandWordmark size="header" />
        </Link>
        <div className="flex items-center gap-2">
          {email ? (
            <span className="hidden max-w-[140px] truncate text-xs text-muted sm:inline">{email}</span>
          ) : null}
          {!demo ? (
            <form action="/auth/signout" method="post">
              <Button type="submit" variant="ghost" className="min-h-10 px-3 text-sm">
                Sign out
              </Button>
            </form>
          ) : null}
        </div>
      </div>
    </header>
  );
}
