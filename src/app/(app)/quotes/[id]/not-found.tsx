import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function QuoteNotFound() {
  return (
    <Card className="text-center">
      <h1 className="text-xl font-bold text-red-950">Quote not found</h1>
      <p className="mt-2 text-muted">It may have been removed or you may not have access.</p>
      <Link href="/dashboard" className="mt-6 inline-block">
        <Button>Back to dashboard</Button>
      </Link>
    </Card>
  );
}
