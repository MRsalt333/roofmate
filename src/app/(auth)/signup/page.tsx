import Link from "next/link";
import { SignupForm } from "@/components/auth/SignupForm";
import { BrandWordmark } from "@/components/BrandWordmark";
import { Card } from "@/components/ui/Card";

export default function SignupPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="flex justify-center">
          <BrandWordmark size="hero" />
        </h1>
        <p className="mt-4 text-muted">Create your contractor account</p>
      </div>
      <Card>
        <SignupForm />
        <p className="mt-6 text-center text-sm text-muted">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-red-800 underline decoration-yellow-500 decoration-2 underline-offset-2 hover:text-red-950">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
