import Link from "next/link";
import { isDemoMode } from "@/lib/demo";
import { getUserOrNull } from "@/lib/supabase/server";
import { fetchQuoteTemplatesForUser } from "@/data/quoteTemplates";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { deleteQuoteTemplateFormAction, setDefaultTemplateFormAction } from "@/actions/templates";

export default async function AccountPage() {
  const demo = isDemoMode();

  if (demo) {
    return (
      <div className="flex flex-col gap-6">
        <Link
          href="/quotes/new"
          className="text-sm font-semibold text-red-800 underline decoration-yellow-500 decoration-2 underline-offset-2 hover:text-red-950"
        >
          ← New quote
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-red-950">Account</h1>
        <Card>
          <p className="text-muted">
            Preview mode uses sample data. Add Supabase keys and turn off demo mode to use accounts and saved templates.
          </p>
        </Card>
      </div>
    );
  }

  const user = await getUserOrNull();

  if (!user) {
    return (
      <div className="flex flex-col gap-6">
        <Link
          href="/quotes/new"
          className="text-sm font-semibold text-red-800 underline decoration-yellow-500 decoration-2 underline-offset-2 hover:text-red-950"
        >
          ← New quote
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-red-950">Account</h1>
          <p className="mt-1 text-muted">Optional — sign in to save quote templates and stored jobs.</p>
        </div>
        <Card className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-red-950">Sign in</h2>
          <LoginForm nextPath="/account" />
        </Card>
        <Card className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-red-950">Create account</h2>
          <SignupForm nextPath="/account" />
        </Card>
      </div>
    );
  }

  const templates = await fetchQuoteTemplatesForUser();

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/quotes/new"
        className="text-sm font-semibold text-red-800 underline decoration-yellow-500 decoration-2 underline-offset-2 hover:text-red-950"
      >
        ← New quote
      </Link>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-red-950">Account</h1>
          <p className="mt-1 text-sm text-muted">{user.email}</p>
        </div>
        <form action="/auth/signout" method="post">
          <Button type="submit" variant="secondary" className="w-full sm:w-auto">
            Sign out
          </Button>
        </form>
      </div>

      <Card className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-red-950">Quote templates</h2>
          <Link href="/account/templates/new">
            <Button type="button" variant="secondary" className="w-full sm:w-auto">
              New template
            </Button>
          </Link>
        </div>
        <p className="text-sm text-muted">
          Templates prefill material, labour, and margin on new quotes. Edit anytime — nothing is locked per job.
        </p>
        {templates.length === 0 ? (
          <p className="text-sm text-muted">No templates yet. Create one to reuse your usual pricing.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {templates.map((t) => (
              <li key={t.id}>
                <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-red-950">
                      {t.template_name}
                      {t.is_default ? (
                        <span className="ml-2 rounded-md bg-yellow-200 px-2 py-0.5 text-xs font-semibold text-red-900">
                          Default
                        </span>
                      ) : null}
                    </p>
                    <Link
                      href={`/account/templates/${t.id}/edit`}
                      className="mt-1 inline-block text-sm font-semibold text-red-800 underline decoration-yellow-500 decoration-2 underline-offset-2"
                    >
                      Edit
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!t.is_default ? (
                      <form action={setDefaultTemplateFormAction}>
                        <input type="hidden" name="id" value={t.id} />
                        <Button type="submit" variant="secondary" className="min-h-10 px-3 text-sm">
                          Set default
                        </Button>
                      </form>
                    ) : null}
                    <form action={deleteQuoteTemplateFormAction}>
                      <input type="hidden" name="id" value={t.id} />
                      <Button type="submit" variant="ghost" className="min-h-10 px-3 text-sm text-red-800">
                        Delete
                      </Button>
                    </form>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
