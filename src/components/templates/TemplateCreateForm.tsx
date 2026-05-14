"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createQuoteTemplateAction, type TemplateActionState } from "@/actions/templates";
import { TemplateEditorFields } from "@/components/templates/TemplateEditorFields";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const initial: TemplateActionState = null;

export function TemplateCreateForm() {
  const [state, formAction, pending] = useActionState(createQuoteTemplateAction, initial);

  return (
    <form action={formAction}>
      <Card className="flex flex-col gap-6">
        <TemplateEditorFields initial={null} />
        {state?.ok === false ? <p className="text-sm font-medium text-red-800">{state.message}</p> : null}
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Creating…" : "Create template"}
        </Button>
      </Card>
    </form>
  );
}

export function TemplateCreatePageChrome() {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/account"
        className="text-sm font-semibold text-red-800 underline decoration-yellow-500 decoration-2 underline-offset-2 hover:text-red-950"
      >
        ← Account
      </Link>
      <h1 className="text-2xl font-bold text-red-950">New template</h1>
      <TemplateCreateForm />
    </div>
  );
}
