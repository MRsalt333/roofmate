import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { BrandWordmark } from "@/components/BrandWordmark";
import { Card } from "@/components/ui/Card";

type Props = { searchParams?: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const next = sp?.next ?? "/dashboard";

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="flex justify-center">
          <BrandWordmark size="hero" />
        </h1>
        <p className="mt-4 text-muted">Sign in to manage quotes</p>
      </div>
      <Card>
        <LoginForm nextPath={next} />
        <p className="mt-6 text-center text-sm text-muted">
          No account?{" "}
          <Link href="/signup" className="font-semibold text-red-800 underline decoration-yellow-500 decoration-2 underline-offset-2 hover:text-red-950">
            Create one
          </Link>
        </p>
      </Card>
    </div>
  );
}
