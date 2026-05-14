import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function HelpPage() {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/quotes/new"
        className="text-sm font-semibold text-red-800 underline decoration-yellow-500 decoration-2 underline-offset-2 hover:text-red-950"
      >
        ← New quote
      </Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-red-950">Help</h1>
        <p className="mt-1 text-muted">Quick tips for using Roofmate.</p>
      </div>
      <Card className="space-y-4">
        <section>
          <h2 className="font-semibold text-red-950">Quotes</h2>
          <p className="mt-2 text-sm text-muted">
            Start from <strong className="text-red-950">New quote</strong>, enter customer details and roof inputs,
            then review totals before saving or exporting.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-red-950">PDF</h2>
          <p className="mt-2 text-sm text-muted">
            On a quote detail screen, use <strong className="text-red-950">Download PDF</strong> to save a copy for the
            customer.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-red-950">Account</h2>
          <p className="mt-2 text-sm text-muted">
            Open <strong className="text-red-950">Account</strong> from the settings menu (gear icon) to sign in, manage
            templates, or sign out.
          </p>
        </section>
      </Card>
    </div>
  );
}
