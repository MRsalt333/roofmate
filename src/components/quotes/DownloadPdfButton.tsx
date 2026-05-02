"use client";

import { useCallback, useState } from "react";
import { downloadQuotePdf, type QuotePdfPayload } from "@/lib/pdf/quotePdf";
import { Button } from "@/components/ui/Button";

type Props = { payload: QuotePdfPayload };

export function DownloadPdfButton({ payload }: Props) {
  const [busy, setBusy] = useState(false);

  const onClick = useCallback(() => {
    setBusy(true);
    try {
      downloadQuotePdf(payload);
    } finally {
      setBusy(false);
    }
  }, [payload]);

  return (
    <Button type="button" variant="secondary" className="w-full sm:w-auto" disabled={busy} onClick={onClick}>
      {busy ? "Preparing PDF…" : "Download PDF"}
    </Button>
  );
}
