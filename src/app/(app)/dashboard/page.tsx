import Link from "next/link";
import { isDemoMode } from "@/lib/demo";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { QuoteRow } from "@/types/database";

function formatMoney(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "AUD" }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const DEMO_QUOTES: QuoteRow[] = [
  {
    id: "demo",
    user_id: "demo",
    customer_name: "Sample customer",
    address: "123 Demo Street, Brisbane",
    roof_size: 180,
    roof_type: "colorbond",
    pitch: "medium",
    material_cost: 45,
    labour_cost: 35,
    margin: 15,
    final_price: 16560,
    created_at: new Date().toISOString(),
  },
  {
    id: "demo",
    user_id: "demo",
    customer_name: "Second job (same preview)",
    address: "45 Example Ave",
    roof_size: 95,
    roof_type: "tile",
    pitch: "low",
    material_cost: 52,
    labour_cost: 40,
    margin: 12,
    final_price: 9788.8,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export default async function DashboardPage() {
  let rows: QuoteRow[];

  if (isDemoMode()) {
    rows = DEMO_QUOTES;
  } else {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: quotes } = await supabase
      .from("quotes")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    rows = (quotes ?? []) as QuoteRow[];
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-red-950">Your quotes</h1>
          <p className="text-muted">Tap a job to view details or export PDF.</p>
        </div>
        <Link href="/quotes/new" className="no-print">
          <Button className="w-full sm:w-auto">New quote</Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <Card className="text-center">
          <p className="text-muted">No saved quotes yet.</p>
          <Link href="/quotes/new" className="mt-4 inline-block">
            <Button>Create your first quote</Button>
          </Link>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((q, i) => (
            <li key={`${q.id}-${i}`}>
              <Link href={isDemoMode() ? "/quotes/demo" : `/quotes/${q.id}`}>
                <Card className="transition-colors hover:border-red-300 hover:bg-yellow-50/80">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold">{q.customer_name}</p>
                      <p className="text-sm text-muted">{formatDate(q.created_at)}</p>
                      {q.address ? (
                        <p className="mt-1 line-clamp-2 text-sm text-muted">{q.address}</p>
                      ) : null}
                    </div>
                    <p className="shrink-0 text-lg font-bold text-accent">{formatMoney(q.final_price)}</p>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
