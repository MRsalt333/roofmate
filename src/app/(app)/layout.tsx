import { isDemoMode } from "@/lib/demo";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const demo = isDemoMode();
  let email: string | null | undefined;
  if (demo) {
    email = "Demo preview";
  } else {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader email={email} demo={demo} />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6 sm:max-w-2xl">{children}</main>
    </div>
  );
}
