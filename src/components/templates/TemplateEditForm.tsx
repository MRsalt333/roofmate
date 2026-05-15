"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { updateQuoteTemplateFromJsonAction, type TemplateActionState } from "@/actions/templates";
import type { QuoteTemplateRow } from "@/types/quoteTemplate";
import { TemplateEditorFields } from "@/components/templates/TemplateEditorFields";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function isNextRedirectError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as { digest: unknown }).digest === "string" &&
    String((err as { digest: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

export function TemplateEditForm({ template }: { template: QuoteTemplateRow }) {
  const fieldsSnapshotRef = useRef("");
  const [state, setState] = useState<TemplateActionState>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const json = fieldsSnapshotRef.current;
    if (!json.trim()) {
      setState({ ok: false, message: "Template fields were not ready. Refresh and try again." });
      return;
    }
    setState(null);
    startTransition(() => {
      void (async () => {
        try {
          const next = await updateQuoteTemplateFromJsonAction(template.id, json);
          if (next && !next.ok) setState(next);
        } catch (err) {
          if (isNextRedirectError(err)) return;
          setState({ ok: false, message: err instanceof Error ? err.message : "Could not save template." });
        }
      })();
    });
  }

  return (
    <form key={template.id} onSubmit={handleSubmit}>
      <Card className="flex flex-col gap-6">
        <TemplateEditorFields initial={template} fieldsSnapshotRef={fieldsSnapshotRef} />
        {state?.message ? (
          <p className={`text-sm font-medium ${state.ok ? "text-red-900" : "text-red-800"}`}>{state.message}</p>
        ) : null}
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? "Saving…" : "Save changes"}
        </Button>
      </Card>
    </form>
  );
}

export function TemplateEditPageChrome({ template }: { template: QuoteTemplateRow }) {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/account"
        className="text-sm font-semibold text-red-800 underline decoration-yellow-500 decoration-2 underline-offset-2 hover:text-red-950"
      >
        ← Account
      </Link>
      <h1 className="text-2xl font-bold tracking-tight text-red-950">Edit template</h1>
      <p className="text-sm text-muted">{template.template_name}</p>
      <TemplateEditForm template={template} />
    </div>
  );
}
