"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updateQuoteTemplateAction, type TemplateActionState } from "@/actions/templates";
import type { QuoteTemplateRow } from "@/types/quoteTemplate";
import { TemplateEditorFields } from "@/components/templates/TemplateEditorFields";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const initial: TemplateActionState = null;

export function TemplateEditForm({ template }: { template: QuoteTemplateRow }) {
  const [state, formAction, pending] = useActionState(updateQuoteTemplateAction, initial);

  return (
    <form action={formAction}>
      <Card className="flex flex-col gap-6">
        <TemplateEditorFields initial={template} />
        {state?.message ? (
          <p className={`text-sm font-medium ${state.ok ? "text-red-900" : "text-red-800"}`}>{state.message}</p>
        ) : null}
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Saving…" : "Save changes"}
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
      <h1 className="text-2xl font-bold text-red-950">Edit template</h1>
      <p className="text-sm text-muted">{template.template_name}</p>
      <TemplateEditForm template={template} />
    </div>
  );
}
