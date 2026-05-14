import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/quotes/new"
        className="text-sm font-semibold text-red-800 underline decoration-yellow-500 decoration-2 underline-offset-2 hover:text-red-950"
      >
        ← New quote
      </Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-red-950">About Roofmate</h1>
        <p className="mt-1 text-muted">Fast mobile quotes for roofing contractors.</p>
      </div>
      <Card className="space-y-3 text-red-950">
        <p>
          Roofmate helps you price jobs quickly using roof size, materials, labour rates, and margin — then share a
          professional breakdown with customers.
        </p>
        <p className="text-sm text-muted">Aussies #1 roofing estimator.</p>
      </Card>
    </div>
  );
}
